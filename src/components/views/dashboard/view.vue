<template lang="pug">
.dashboard-graphView(
  ref="graphView"
  :class="theme"
)
  iframe(ref="iframe" :src="url")
  .header(:class="{'requesting': !requesting}") {{ name }}
  .main.left(:class="{'requesting': !requesting}")
    .main-item.resource
      .title
        span {{ i18n.getTrans('dashboard', 'resource')}}
      .content
        template(v-if="resourceLoading")
          .item(v-for="resource in data.resource")
            .key(:title="resource[0]") {{resource[0]}}
            .value {{resource[1]}}
        template(v-else)
          Loading
    .main-item.cable
      .title
        span {{ i18n.getTrans('dashboard', 'cable')}}
      .content
        template(v-if="cableLoading")
          .item(v-for="cable,i in data.cable")
            .key
              .icon
                .order {{i+1}}
              .str(:title="cable[0]") {{cable[0]}}
            .value(:title="cable[1]") {{cable[1]}}
        template(v-else)
          Loading
    .main-item.capacityAnalysis
      .title
        span {{ i18n.getTrans('dashboard', 'capacityAnalysis')}}
      .content(ref="capacityAnalysisChart")
        Loading
  .main.right(:class="{'requesting': !requesting}")
    .main-item.alarm
      .title
        span {{ i18n.getTrans('dashboard', 'alarm')}}
      .content(ref="alarmChart")
        Loading
    .main-item.workOrder
      .title
        span {{ i18n.getTrans('dashboard', 'workOrder')}}
      .content(ref="workOrderChart")
        Loading
    .main-item.PUE
      .title
        span PUE
      .content(ref="PUEChart")
        Loading
  .control(:class="{'requesting': !requesting}")
    .control-item
      .icon-back-C(@click="goBack")
    .control-item.is3d(v-if="!isMap" :class="{'active': is3D}")
      .icon-3D(@click="to3D")
    .control-item.is2d(v-if="!isMap" :class="{'active': !is3D}")
      .icon-2D(@click="to2D")
    .control-item.theme(:class="theme")
      .icon-moon(@click="changeTheme")
</template>

<script>
import { Component, Vue } from 'vue-property-decorator'
import i18n from '@/i18n'
import * as echarts from 'echarts';
import workOrderChartHelper from './charts/workOrder.js'
import alarmChartHelper from './charts/alarm.js'
import PUEChartHelper from './charts/PUE.js'
import capacityAnalysisChartHelper from './charts/capacityAnalysis.js'
import Loading from './loading.vue'

let capacityAnalysisChart = null; // 容量分析图表实例
let alarmChart = null; // 告警图表实例
let workOrderChart = null; // 工单图表实例
let PUEChart = null; // PUE图表实例
let isInit = true;
let resourceCancelToken;
let cableCancelToken;
let capacityAnalysisCancelToken;
let alarmCancelToken;
let workOrderCancelToken;
let PUECancelToken;

@Component({
  components: {
    Loading,
  }
})
export default class GraphView extends Vue {
  i18n = i18n;
  name = ''
  url = '';
  workOrderSum = ''
  data = {}
  activeStatus = false
  isMap = false
  is3D = false
  requesting = true
  resourceLoading = false;
  cableLoading = false;
  theme = 'light'

  parseBackground(background) {
    const r = parseInt(background.substr(1, 2), 16);
    const g = parseInt(background.substr(3, 2), 16);
    const b = parseInt(background.substr(5, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return this.isMap ? 'dark' : (brightness > 128 ? 'light' : 'dark'); // 大于128为浅色
  }

  createURL(id, name) {
    const query = this.$route.query;
    const diagramId = id || query.id
    if (diagramId) {
      const params = new URLSearchParams({
        id: diagramId,
        editable: 'false',
        hidden: 'menu,statusBar,ruler,breadcrumbs,property,leftBar,rightBar,overview,control,mapControls,contextMenu',
        v: +new Date(),
      });
      this.url = 'http://release.nvisual.com:9090/diagram.html?' + params.toString();
      this.name = name || query.name || ''
    }
  }

  created() {
    this.createURL();
  }

  async goBack() {
    this.$refs.iframe.contentWindow.postMessage({
      type: 'LARGE-SCREEN',
      event: 'moveUp',
    });
  }

  to2D() {
    this.is3d = false;
    this.$refs.iframe.contentWindow.postMessage({
      type: 'LARGE-SCREEN',
      event: 'to2D',
    });
  }

  to3D() {
    this.is3d = true;
    this.$refs.iframe.contentWindow.postMessage({
      type: 'LARGE-SCREEN',
      event: 'to3D',
    });
  }

  changeTheme() {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
    this.resizeHandler();
  }

  getMessage() {
    window.addEventListener('message', (event) => {
      if (event.data.type === 'LARGE-SCREEN') {
        if (event.data.event === 'render') {
          this.name = event.data.name;
          this.isMap = event.data.isMap;
          this.is3D = event.data.is3D;
          if (+event.data.id !== +this.$route.query.id || isInit) {
            if (!isInit) {
              this.$router.push({
                query: {
                  id: event.data.id,
                  name: this.name,
                }
              })
            }
            this.theme = this.parseBackground(event.data.background);
            this.chartInit();
            isInit = false;
          } else {
            this.resizeHandler();
          }
          setTimeout(() => {
            this.requesting = false;
          }, 400)
        } else if (event.data.event === 'renderBefore') {
          resourceCancelToken.cancel('cancel')
          cableCancelToken.cancel('cancel')
          capacityAnalysisCancelToken.cancel('cancel')
          alarmCancelToken.cancel('cancel')
          workOrderCancelToken.cancel('cancel')
          PUECancelToken.cancel('cancel')
          this.requesting = true;
        }
      }
    })
  }

  getLoading(root) {
    const loading = new Vue({
      render(h) {
        return h(Loading)
      }
    }).$mount()
    root.removeAttribute('_echarts_instance_');
    root.innerHTML = ''
    root.appendChild(loading.$el);
  }

  resourceInit() {
    this.resourceLoading = false
    resourceCancelToken = this.$axios.CancelToken.source();
    this.$axios.post('v1/diagram_excel/group_by_type', {
      nodeId: this.$route.query.id,
      filter: ['type', '=', 7],
      sort: [{ selector: 'counts', desc: true }],
      take: 100,
      skip: 0
    }, {
      cancelToken: resourceCancelToken.token
    }).then(result => {
      if (result?.data?.code !== 200) return;
      const data = result?.data?.data || [];
      this.$set(this.data, 'resource', data.slice(0, 5).map(item => [item.model, item.counts]));
    }).catch(() => { }).finally(() => {
      this.resourceLoading = true
    })
  }

  cableInit() {
    this.cableLoading = false
    cableCancelToken = this.$axios.CancelToken.source();
    this.$axios.post('v1/diagram_excel/group_by_type', {
      nodeId: this.$route.query.id,
      filter: ['type', '=', 12],
      sort: [{ selector: 'counts', desc: true }],
      take: 100,
      skip: 0
    }, {
      cancelToken: cableCancelToken.token,
    }).then(result => {
      if (result?.data?.code !== 200) return;
      const data = result?.data?.data || [];
      this.$set(this.data, 'cable', data.slice(0, 6).map(item => [item.model, item.counts]));
    }).catch(() => { }).finally(() => {
      this.cableLoading = true
    })
  }

  capacityAnalysisInit() {
    const chartDom = this.$refs.capacityAnalysisChart;
    if (!chartDom) return;
    this.getLoading(chartDom)
    capacityAnalysisCancelToken = this.$axios.CancelToken.source();
    this.$axios.get('v1/capacityAnalysis/diagramId/' + this.$route.query.id, {
      cancelToken: capacityAnalysisCancelToken.token,
    }).then(result => {
      if (result?.data?.code !== 200) return;
      capacityAnalysisChart = echarts.init(chartDom);

      const data = capacityAnalysisChartHelper.setData(result?.data?.data || []);
      const option = capacityAnalysisChartHelper.createOption(data, this.theme);
      option && capacityAnalysisChart.setOption(option);
    }).catch(() => { })
  }

  alarmInit() {
    const chartDom = this.$refs.alarmChart;
    if (!chartDom) return;
    // 获取告警图表容器的矩形
    this.getLoading(chartDom)
    alarmCancelToken = this.$axios.CancelToken.source();
    this.$axios.get('v1/notice/diagramId/' + this.$route.query.id, {
      cancelToken: alarmCancelToken.token,
    }).then(result => {
      if (result?.data?.code !== 200) return;
      alarmChart = echarts.init(chartDom);

      const data = alarmChartHelper.setData(result?.data?.data || []);
      const option = alarmChartHelper.createOption(data, this.theme);
      option && alarmChart.setOption(option);
    }).catch(() => { })
  }

  workOrderInit() {
    const chartDom = this.$refs.workOrderChart;
    if (!chartDom) return;
    this.getLoading(chartDom)
    workOrderCancelToken = this.$axios.CancelToken.source();
    this.$axios.get('v1/work_order_tasks/diagramId/' + this.$route.query.id, {
      cancelToken: workOrderCancelToken.token,
    }).then(result => {
      if (result?.data?.code !== 200) return;
      workOrderChart = echarts.init(chartDom);

      const data = workOrderChartHelper.setData(result?.data?.data || []);
      const option = workOrderChartHelper.createOption(data, this.theme);

      option && workOrderChart.setOption(option);
    }).catch(() => {})
  }

  PUEInit() {
    const chartDom = this.$refs.PUEChart;
    if (!chartDom) return;
    this.getLoading(chartDom)
    PUECancelToken = this.$axios.CancelToken.source();
    this.$axios.get('v1/PUE/diagramId/' + this.$route.query.id, {
      cancelToken: PUECancelToken.token,
    }).then(result => {
      if (result?.data?.code !== 200) return;
      PUEChart = echarts.init(chartDom);

      const data = PUEChartHelper.setData(result?.data?.data || []);
      const option = PUEChartHelper.createOption(data, this.theme);
      option && PUEChart.setOption(option);
    }).catch(() => { })
  }

  resizeHandler() {
    if (capacityAnalysisChart) {
      const capacityAnalysisCharData = capacityAnalysisChartHelper.getData();
      const capacityAnalysisChartOption = capacityAnalysisChartHelper.createOption(capacityAnalysisCharData, this.theme);
      capacityAnalysisChart.setOption(capacityAnalysisChartOption);
      capacityAnalysisChart.resize();
    }
    if (alarmChart) {
      const alarmCharData = alarmChartHelper.getData();
      const alarmChartOption = alarmChartHelper.createOption(alarmCharData, this.theme);
      alarmChart.setOption(alarmChartOption);
      alarmChart?.resize();
    }
    if (workOrderChart) {
      const workOrderCharData = workOrderChartHelper.getData();
      const workOrderChartOption = workOrderChartHelper.createOption(workOrderCharData, this.theme);
      workOrderChart.setOption(workOrderChartOption);
      workOrderChart.resize();
    }
    if (PUEChart) {
      const PUECharData = PUEChartHelper.getData();
      const PUEChartOption = PUEChartHelper.createOption(PUECharData, this.theme);
      PUEChart.setOption(PUEChartOption);
      PUEChart.resize();
    }
  }

  event() {
    window.addEventListener('resize', this.resizeHandler);
  }

  chartInit() {
    this.resourceInit()
    this.cableInit()
    this.capacityAnalysisInit()
    this.alarmInit()
    this.workOrderInit()
    this.PUEInit()
  }

  mounted() {
    this.getMessage();
    this.event();
  }
}
</script>

<style scoped>
.dashboard-graphView {
  position: relative;
  height: 100%;
  width: 100%;
}

/* 主题 深色模式 开始 */
.dark .header {
  background-image: url('/img/nvisual/dashboard/headTitleBg.png'), linear-gradient(180deg, #000A2B 2%, rgba(0, 11, 49, 0.63) 46%, rgba(0, 0, 0, 0) 100%);
  color: #ffffff;
}
.dark .main {
  background-image: linear-gradient(90deg, #000411 12%, rgba(0, 4, 17, 0.5962) 53%, rgba(0, 27, 100, 0) 100%);
}
.dark .main-item .title {
  color: #ffffff;
}
.dark .resource .content .item {
  color: #ffffff;
}
.dark .cable .content .item .key {
  color: #ffffff;
}
.dark .cable .content .item .value {
  color: #ffc403;
}
/* 主题 深色模式 结束 */

/* 主题 浅色模式 开始 */
.light .header {
  background-image: url('/img/nvisual/dashboard/headTitleBg.png'), linear-gradient(180deg, #FFFFFF 2%, rgba(255, 255, 255, 0.63) 46%, rgba(255, 255, 255, 0) 100%);
  color: #000000;
}
.light .main {
  background-image: linear-gradient(90deg, #f1f1f1 12%, #fafafa 53%, #ffffff50 100%);
}
.light .main-item .title {
  color: #000000;
}
.light .resource .content .item {
  color: #000000;
}
.light .cable .content .item .key {
  color: #000000;
}
.light .cable .content .item .value {
  color: #000000;
}
/* 主题 浅色模式 结束 */

iframe {
  height: 100%;
  width: 100%;
  border: 0;
}
.header {
  position: absolute;
  top: 0;
  left: 0;
  height: 40px;
  line-height: 40px;
  width: 100%;
  text-align: center;
  font-size: 18px;
  transform: translateY(-40px);
  transition: transform 0.4s ease-in-out;
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
}
.header.requesting {
  transform: translateY(0);
}

/* 主界面 开始*/
.main {
  position: absolute;
  top: 0;
  width: 330px;
  height: 100%;
  padding-top: 40px;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  transition: transform 0.4s ease-in-out;
}
/* .main.requesting {
  pointer-events: none;
} */
.main.left {
  left: 0;
  transform: translateX(-330px);
}
.main.left.requesting {
  transform: translateX(0);
}
.main.right {
  right: 0;
  transform: translateX(330px) rotateY(180deg);
}
.main.right.requesting {
  transform: translateX(0) rotateY(180deg);
}
.main-item {
  margin-left: 20px;
}
.main.right .main-item {
  transform: rotateY(180deg);
}
.main-item .title {
  width: 300px;
  height: 30px;
  text-align: left;
  font-size: 14px;
  background-repeat: no-repeat;
  background-image: url('/img/nvisual/dashboard/titleBg.svg');
  background-size: contain;
}
.main-item .title span{
  display: inline-block;
  transform: translate(34px, -5px);
}
.main-item .content {
  height: calc(100% - 30px);
}
.main-item .extend {
  position: absolute;
  top: 0;
  left: 0;
}
/* 主界面 结束*/

/* 资源 开始*/
.resource .content {
  display: flex;
  flex-flow: wrap;
  transform: translate(8px, 10px);
}
.resource {
  height: 24%;
  min-height: 180px;
}
.resource .content .item {
  display: flex;
  justify-content: space-around;
  align-items: center;
  width: 140px;
  height: 50px;
  margin-right: 4px;
  font-size: 12px;
  background-image: url('/img/nvisual/dashboard/resourceItemBg.svg');
  background-size: 100% 100%;
  background-repeat: no-repeat;
}
.resource .content .item .key {
  overflow: hidden;
  text-overflow: ellipsis;
  width: 70px;
  height: 20px;
  text-align: left;
  font-size: 14px;
  white-space: nowrap;
  transform: translateY(-6px);
}
.resource .content .item .value {
  overflow: hidden;
  width: 30px;
  font-size: 18px;
  transform: translateY(-8px);
  font-family: 'Impact';
}
/* 资源 结束*/

/* 线缆 开始*/
.cable {
  height: 40%;
  min-height: 280px;
}
.cable .content {
  display: flex;
  flex-direction: column;
  padding: 20px 0;
}
.cable .content .item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 280px;
  height: 14%;
  border-bottom: 1px solid #31404b;
}
.cable .content .item .key{
  display: flex;
  align-items: center;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 240px;
  font-size: 14px;
  text-align: left;
}
.cable .content .item .key .icon {
  width: 24px;
  height: 26px;
  background-image: url('/img/nvisual/dashboard/cableTitleBg.svg');
  background-size: contain;
  background-repeat: no-repeat;
  transform: translateY(6px);
  text-align: center;
}
.cable .content .item .key .icon .order {
  transform: translateY(-6px);
}
.cable .content .item .key .str {
  overflow: hidden;
  width: 100%;
  padding-left: 8px;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.cable .content .item .value{
  width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 22px;
  text-align: right;
  font-family: 'Impact';
}
/* 线缆 结束*/

/* 容量分析 开始*/
.capacityAnalysis {
  height: 36%;
  min-height: 175px;
}
/* 容量分析 结束*/

/* 告警 开始*/
.alarm {
  height: 20%;
  min-height: 140px;
}
/* 告警 结束*/

/* 工单 开始*/
.workOrder {
  height: 40%;
  min-height: 210px;
}
/* 工单 结束*/

/* PUE 开始*/
.PUE {
  height: 40%;
  min-height: 250px;
}
/* PUE 结束*/

/* 控制按钮 开始*/
.control {
  display: flex;
  position: absolute;
  justify-content: space-around;
  align-items: center;
  left: 0;
  right: 0;
  bottom: 70px;
  width: fit-content;
  height: 54px;
  padding: 0 8px;
  border-radius: 30px;
  margin: 0 auto;
  font-size: 24px;
  background: #57575799;
  transform: translateY(124px);
  transition: transform 0.4s ease-in-out;
  pointer-events: none;
}
.control.requesting {
  pointer-events: auto;
  transform: translateY(0);
}
.control-item {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #777777;
  color: #cccccc;
}
.control-item.is3d {
  margin: 0 10px;
}
.control-item.theme {
  margin-left: 10px;
}
.control-item.theme.light {
  background-color: #8a8a8a;
}
.control-item.theme.light:hover {
  background-color: #2672b7;
}
.control-item.is2d:hover,
.control-item.is3d:hover,
.control-item.active,
.control-item.theme.dark {
  background: #2672b7;
}
.control-item:hover {
  background: #8a8a8a;
  cursor: pointer;
  color: #ffffff;
}
/* 控制按钮 结束*/
</style>

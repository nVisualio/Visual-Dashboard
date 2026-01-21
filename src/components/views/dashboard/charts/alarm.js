import utils from '@/utils'

let _data = {};
const getData = () => {
  return _data;
}

const setData = (data) => {
  _data = {
    jinji: data['紧急'] || 0,
    yanzhong: data['严重'] || 0,
    jinggao: data['警告'] || 0,
    tixing: data['提醒'] || 0,
  }
  return _data;
}

const createOption = (data, theme) => {
  // 获取告警图表容器的矩形
  const chartContainerRect = document.querySelector('.main-item.alarm .content')?.getBoundingClientRect();
  if (!chartContainerRect) return;
  // 创建4个系列，每个仪表盘一个
  const gauges = [
    { value: data.jinji, name: '紧急', color: '#ff0000', id: 'jinji' },
    { value: data.yanzhong, name: '严重', color: '#ff7b02', id: 'yanzhong' },
    { value: data.jinggao, name: '警告', color: '#ffd400', id: 'jinggao' },
    { value: data.tixing, name: '提醒', color: '#cfff00', id: 'tixing' }
  ];

  const color = theme === 'dark' ? '#ffffff' : '#000000';
  const positionsMap = {}; // 存储每个仪表盘的位置
  const unitWidth = chartContainerRect.width / 4;
  const gaugeWidth = unitWidth * 0.7;
  const lineWidth = gaugeWidth / 5;
  const gap = (chartContainerRect.width - gaugeWidth * 4) / 5;
  const series = gauges.map((gauge, index) => {
    // 计算每个仪表盘的中心位置（1x4布局）
    const x = gaugeWidth / 2 + gap + index * (gap + gaugeWidth);
    const y = chartContainerRect.height / 2;

    positionsMap[gauge.id] = { x, y };

    return {
      name: gauge.name,
      id: gauge.id,
      type: 'gauge',
      center: [x, '50%'],
      radius: `${gaugeWidth / 2}px`, // 相对大小
      startAngle: 90,
      endAngle: -270,
      splitNumber: 5,

      // 指针设置
      pointer: {
        show: false,
      },

      // 进度条
      progress: {
        show: true,
        width: lineWidth / 2,
        roundCap: true,
        itemStyle: {
          color: gauge.color
        }
      },

      // 轴线
      axisLine: {
        roundCap: true,
        lineStyle: {
          width: lineWidth / 2,
          color: [[1, gauge.color]] // 背景色
        }
      },

      // 刻度线
      axisTick: {
        show: false
      },

      // 分割线
      splitLine: {
        show: false,
      },

      // 刻度标签
      axisLabel: {
        show: false
      },

      // 标题（指标名称）
      title: {
        show: true,
        offsetCenter: [0, gaugeWidth * 3 / 4],
        fontSize: 12,
        color,
      },

      // 详细数值
      detail: {
        show: false,
        offsetCenter: [0, 0],
        fontSize: 18,
        color,
        formatter: '{value}',
        valueAnimation: true,
      },

      // 数据
      data: [{
        value: gauge.value,
        name: gauge.name
      }]
    };
  });

  const fontSize = 12;
  const graphic = gauges.map((gauge, i) => {
    return {
      type: 'text',
      x: positionsMap[gauge.id].x,
      top: ((positionsMap[gauge.id].y - fontSize / 2) / chartContainerRect.height * 100) + '%',
      style: {
        text: gauge.value,
        fill: color,
        textAlign: 'center',
        textVerticalAlign: 'middle',
        overflow: 'truncate',
        width: gaugeWidth * 0.8,
        font: `normal ${fontSize}px Impact`,
        z: 1
      },
      onclick(params) {
        localStorage.setItem('message', JSON.stringify({
          filterValue: ['priority', '=', gauge.name]
        }));
        utils.openPage('/events.html')
      }
    }
  })

  const option = {
    // 确保有足够的间距
    grid: {
      top: '5%',
      bottom: '5%',
      left: '5%',
      right: '5%'
    },
    graphic,

    // 系列配置
    series: series
  };
  return option
}

export default {
  getData,
  setData,
  createOption
}

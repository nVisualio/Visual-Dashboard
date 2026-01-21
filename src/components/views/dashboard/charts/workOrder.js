import i18n from '@/i18n';

let _data = {};
const getData = () => {
  return _data;
}

const setData = (data) => {
  const values = {
    new_task: data['new task'] || 0,
    in_progress_task: data['in progress task'] || 0,
    completed: data.completed || 0,
    closed: data.closed || 0,
    refused_task: data['refused task'] || 0,
  }
  const workOrderSum = values.new_task + values.in_progress_task + values.completed + values.refused_task + values.closed;
  const names = {
    new_task: i18n.getTrans('largeScreen', 'new_task') + ',' + values.new_task,
    in_progress_task: i18n.getTrans('largeScreen', 'in_progress_task') + ',' + values.in_progress_task,
    completed: i18n.getTrans('largeScreen', 'completed') + ',' + values.completed,
    refused_task: i18n.getTrans('largeScreen', 'refused_task') + ',' + values.refused_task,
    closed: i18n.getTrans('largeScreen', 'closed') + ',' + values.closed
  }
  _data = { names, values, workOrderSum }
  return _data;
}

const createOption = (data, theme) => {
  // 获取工作订单图表容器的矩形
  const chartContainerRect = document.querySelector('.main-item.workOrder .content')?.getBoundingClientRect();
  if (!chartContainerRect) return;

  let color;
  let colorStops;
  if (theme === 'dark') {
    color = '#ffffff';
    colorStops = ['#155c78', '#0b161b'];
  } else if (theme === 'light') {
    color = '#000000';
    colorStops = ['#cdcdcd', '#f1f1f1'];
  }
  const gap = 25;
  const radius = 70;
  const center = [radius + gap, chartContainerRect.height / 2];
  const legendLeft = radius * 2 + gap * 1.5;
  const legendItemHeight = 28;
  // legend高度最小占比
  const legendMinHeightRatio = 0.66
  const itemGap = Math.max(0, (chartContainerRect.height * legendMinHeightRatio - legendItemHeight * 5) / 4);
  const offsetY = 5 // 系统自带的偏移量
  const legendTop = (chartContainerRect.height - legendItemHeight * 5 - itemGap * 4) / 2 - offsetY

  const option = {
    color: ['#56ff00', '#4b8dff', '#ffc403', '#818181', '#ff6a00'],
    legend: {
      left: legendLeft,
      top: legendTop,
      orient: 'vertical',
      itemGap,
      itemWidth: 6,
      itemHeight: legendItemHeight,
      data: [data.names.new_task, data.names.in_progress_task, data.names.completed, data.names.refused_task, data.names.closed],
      formatter: function (value) {
        const name = value.split(',')[0];
        const val = value.split(',')[1];
        return '{name|' + name + '}{value|' + val + '}';
      },
      tooltip: {
        show: true,
        formatter: params => {
          const name = params.name.split(',')[0];
          const val = params.name.split(',')[1];
          return name + ': ' + val;
        },
        extraCssText: 'padding: 4px'
      },
      textStyle: {
        color,
        padding: -4,
        overflow: 'truncate',
        width: 130,
        rich: {
          name: {
            width: 120,
            height: legendItemHeight,
            fontSize: 10,
            padding: [0, 0, 0, 4],
            backgroundColor: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 1,
              y2: 0,
              colorStops: [{
                offset: 0, color: colorStops[0] // 0% 处的颜色
              }, {
                offset: 1, color: colorStops[1] // 100% 处的颜色
              }],
              global: false // 缺省为 false
            },
            color
          },
          value: {
            padding: [0, 0, 0, -52],
            fontSize: 16,
            fontWeight: 'normal',
            fontFamily: 'Impact',
            color
          }
        }
      },
    },
    tooltip: {
      show: true,
      trigger: 'item',
      textStyle: {
        fontSize: 12,
      }
    },
    series: [
      {
        type: 'pie',
        center: center,
        radius: [radius - 24, radius - 23],
        itemStyle: {
          color: '#777777' // 圆环颜色
        },
        label: {
          show: true,
          position: 'center',
          width: (radius - 24) * 2,
          overflow: 'truncate',
          formatter: function (params) {
            return [
                  `{value|${params.value}}`,
                  '{hr|}',
                  `{name|${params.name}}`,
            ].join('\n');
          },
          rich: {
            value: {
              padding: [0, 0, 6, 0],
              fontSize: 22,
              fontWeight: 'normal',
              fontFamily: 'Impact',
              color
            },
            hr: {
              width: 50,
              height: 1,
              align: 'center',
              backgroundColor: '#cdcdcd'
            },
            name: {
              padding: [8, 0, 0, 0],
              fontSize: 12,
              color
            }
          }
        },
        data: [{ value: data.workOrderSum, name: '总数' }] // 占位数据
      },
      {
        type: 'pie',
        center: center,
        radius: [radius - 16, radius],
        avoidLabelOverlap: false,
        label: { show: false },
        emphasis: { label: { show: false } },
        labelLine: { show: false },
        data: [
          { value: data.values.new_task, name: data.names.new_task },
          { value: data.values.in_progress_task, name: data.names.in_progress_task },
          { value: data.values.completed, name: data.names.completed },
          { value: data.values.closed, name: data.names.closed },
          { value: data.values.refused_task, name: data.names.refused_task }
        ]
      }
    ]
  };
  return option
}

export default {
  getData,
  setData,
  createOption
}

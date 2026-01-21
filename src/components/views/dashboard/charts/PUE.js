let _data = [];
const getData = () => {
  return _data;
}

const setData = (data) => {
  _data = [
    {
      key: 'PUE',
      name: 'PUE',
      value: data.PUE || 0,
    },
    {
      key: 'data_center',
      name: '数据中心总能耗',
      value: data.data_center || 0,
    },
    {
      key: 'IT_device',
      name: 'IT设备能耗',
      value: data.IT_device || 0,
    },
    {
      key: 'cooling_device',
      name: '冷却设备能耗',
      value: data.cooling_device || 0,
    }
  ]
  return _data;
}

const createOption = (data, theme) => {
  // 获取工作订单图表容器的矩形
  const chartContainerRect = document.querySelector('.main-item.PUE .content')?.getBoundingClientRect();
  if (!chartContainerRect) return;

  const color = theme === 'dark' ? '#ffffff' : '#000000';
  const radius = 90;
  const x = chartContainerRect.width / 2;
  const y = Math.max(radius, chartContainerRect.height / 2 - radius * 1 / 3)
  const center = [x, y];

  // 字体设置后缀
  const fontSuffix = 'px Arial, sans-serif';
  const graphic = data.slice(1).map((item, i) => {
    return {
      type: 'group',
      x: x - radius * 1.2,
      y: 40 + y + i * (Math.min(40, chartContainerRect.height / 230 * 18)),
      width: radius * 2.4,
      children: [
        {
          type: 'image',
          left: 0,
          y: -3,
          width: 16,
          height: 16,
          style: {
            image: `/img/nvisual/largeScreenImg/icon-${item.key}.svg`,
          },
        },
        {
          type: 'text',
          left: 18,
          top: 0,
          width: '50%',
          style: {
            text: item.name,
            fill: color,
            textAlign: 'left',
            overflow: 'truncate',
            width: radius * 1.4,
            font: 12 + fontSuffix,
            z: 1
          },
        },
        {
          type: 'text',
          right: 12,
          top: -6,
          style: {
            text: item.value,
            fill: color,
            textAlign: 'right',
            textVerticalAlign: 'middle',
            overflow: 'truncate',
            width: radius * 0.8,
            font: 'normal ' + 20 + 'px Impact',
            z: 1
          },
        }, {
          type: 'text',
          right: -16,
          top: 0,
          style: {
            text: 'KWh',
            fill: color,
            textAlign: 'center',
            textVerticalAlign: 'middle',
            overflow: 'truncate',
            width: radius * 2 * 0.8,
            font: 12 + fontSuffix,
            z: 1
          },
        }
      ],
    }
  })

  const option = {
    graphic,
    tooltip: {
      show: true,
      trigger: 'item',
      textStyle: {
        fontSize: 12,
      }
    },
    series: [
      {
        type: 'gauge',
        center,
        radius: radius,
        startAngle: 180,
        endAngle: 0,
        min: 0,
        max: 240,
        splitNumber: 12,
        itemStyle: {
          color: '#ba99ff',
          shadowColor: 'rgba(255, 255, 255, 0.45)',
          shadowBlur: 10,
          shadowOffsetX: 2,
          shadowOffsetY: 2
        },
        progress: {
          show: true,
          roundCap: true,
          width: 14
        },
        pointer: {
          show: false,
        },
        axisLine: {
          roundCap: true,
          lineStyle: {
            width: 14,
            color: [[1, theme === 'dark' ? '#4c4c4c' : '#1a1a1a10']] // 背景色
          }
        },
        axisTick: {
          show: true,
          splitNumber: 2,
          lineStyle: {
            width: 1,
            color: theme === 'dark' ? '#666666' : '#1a1a1a30'
          }
        },
        splitLine: {
          show: false,
        },
        axisLabel: {
          show: false,
        },
        title: {
          show: false
        },
        detail: {
          width: '60%',
          borderRadius: 8,
          offsetCenter: [0, -16],
          valueAnimation: true,
          formatter: function (value) {
            return '{value|' + value.toFixed(0) + '\n}{unit1|PUE}{unit2|值}';
          },
          rich: {
            value: {
              fontSize: 40,
              fontFamily: 'Impact',
              color: color
            },
            unit1: {
              fontSize: 14,
              color: color,
              verticalAlign: 'middle'
            },
            unit2: {
              fontSize: 10,
              color: color,
              verticalAlign: 'middle',
              padding: [0, 0, 0, 2]
            }
          }
        },
        data: [
          {
            value: data[0].value,
          }
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

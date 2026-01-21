import i18n from '@/i18n';

let _data = [];
const getData = () => {
  return _data;
}

const setData = (data) => {
  _data = [
    { value: data.rack_capacity || 0, name: i18n.getTrans('largeScreen', 'rackCapacity'), color: '#5470c6' },
    { value: data.rack_power || 0, name: i18n.getTrans('largeScreen', 'rackPower'), color: '#91cc75' },
    { value: data.patch_panel_port || 0, name: i18n.getTrans('largeScreen', 'patchPanelPort'), color: '#fac858' },
    { value: data.switch_port || 0, name: i18n.getTrans('largeScreen', 'switchPort'), color: '#ee6666' }
  ];
  return _data;
}

const createOption = (data, theme) => {
  // 获取工作订单图表容器的矩形
  const chartContainerRect = document.querySelector('.main-item.capacityAnalysis .content')?.getBoundingClientRect();
  if (!chartContainerRect) return;

  const color = theme === 'dark' ? '#ffffff' : '#000000';
  const radius = 36;
  const lineWidth = 8;
  const centerY = chartContainerRect.height / 2 - lineWidth;

  const series = data.map((gauge, index) => {
    // 计算每个仪表盘的中心位置（2x2布局）
    const col = index % 2; // 0或1
    const row = Math.floor(index / 2); // 0或1

    // 每个仪表盘占25%的宽度和高度
    const left = 15 + col * 50;
    const gapY = 10 // Math.min(radius, (chartContainerRect.height - radius * 4) / 2)
    const top = Math.max(radius, centerY - radius - gapY + row * (radius * 2 + gapY));

    return {
      type: 'gauge',
      center: [`${left}%`, top],
      radius,
      startAngle: 90,
      endAngle: -270,
      min: 0,
      max: 100,
      splitNumber: 5,

      // 指针设置
      pointer: {
        show: false,
      },

      // 进度条
      progress: {
        show: true,
        width: lineWidth,
        roundCap: true,
        itemStyle: {
          color: gauge.color
        }
      },

      // 轴线
      axisLine: {
        roundCap: true,
        lineStyle: {
          width: lineWidth,
          color: [[1, theme === 'dark' ? '#464b4c' : '#1a1a1a10']] // 背景色
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
        offsetCenter: ['200%', 0],
        fontSize: 12,
        color,
      },

      // 详细数值
      detail: {
        show: true,
        offsetCenter: [0, 0],
        fontSize: 18,
        fontWeight: 'normal',
        fontFamily: 'Impact',
        color,
        formatter: '{value}%',
        valueAnimation: true,
      },

      // 数据
      data: [{
        value: gauge.value.toFixed(0),
        name: gauge.name
      }]
    };
  })

  const option = {
    // 确保有足够的间距
    grid: {
      top: '5%',
      bottom: '5%',
      left: '5%',
      right: '5%'
    },

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

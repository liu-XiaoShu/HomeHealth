<template>
  <div class="chart-container" ref="chartContainer"></div>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted } from 'vue'
import * as echarts from 'echarts'
// import type { EChartsOption, LineSeriesOption } from 'echarts'

const props = defineProps({
  dates[]
  data[] | number[][]
  labels?[]
  unit?
  title?
}: {}()

const chartContainer = ref(null)
let chart: echarts.ECharts | null = null

const initChart = () => {
  if (!chartContainer.value) return
  
  chart = echarts.init(chartContainer.value)
  updateChart()
}

const updateChart = () => {
  if (!chart) return

  const series: LineSeriesOption[] = Array.isArray(props.data[0])
    ? (props.data ).map((data, index) => ({
        name: props.labels?.[index] || `数据${index + 1}`,
        type: 'line',
        data: data,
        smooth: true
      }))
    : [{
        name: props.labels?.[0] || '数据',
        type: 'line',
        data: props.data ,
        smooth: true
      }]

  const option: EChartsOption = {
    title: {
      text: props.title,
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        const date = props.dates[params[0].dataIndex]
        let result = `${date}<br/>`
        params.forEach((param) => {
          result += `${param.seriesName}: ${param.value}${props.unit || ''}<br/>`
        })
        return result
      }
    },
    xAxis: {
      type: 'category',
      data: props.dates,
      axisLabel: {
        rotate: 45
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: `{value}${props.unit || ''}`
      }
    },
    series,
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true
    }
  }

  chart.setOption(option)
}

// 监听数据变化
watch(() => props.data, updateChart, { deep: true })
watch(() => props.dates, updateChart)

// 监听容器大小变化
const handleResize = () => {
  chart?.resize()
}

onMounted(() => {
  initChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  chart?.dispose()
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 100%;
  min-height: 300px;
}
</style> 
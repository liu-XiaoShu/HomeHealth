<template>
  <div class="chart-container" ref="chartContainer"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import type { EChartsOption, LineSeriesOption } from 'echarts'

const props = defineProps<{
  dates: string[]
  data: number[] | number[][]
  labels?: string[]
  unit?: string
  title?: string
}>()

const chartContainer = ref<HTMLElement | null>(null)
let chart: echarts.ECharts | null = null

const initChart = () => {
  if (!chartContainer.value) return
  
  chart = echarts.init(chartContainer.value)
  updateChart()
}

const updateChart = () => {
  if (!chart) return

  const series: LineSeriesOption[] = Array.isArray(props.data[0])
    ? (props.data as number[][]).map((data, index) => ({
        name: props.labels?.[index] || `数据${index + 1}`,
        type: 'line',
        data: data,
        smooth: true
      }))
    : [{
        name: props.labels?.[0] || '数据',
        type: 'line',
        data: props.data as number[],
        smooth: true
      }]

  const option: EChartsOption = {
    title: {
      text: props.title,
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const date = props.dates[params[0].dataIndex]
        let result = `${date}<br/>`
        params.forEach((param: any) => {
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
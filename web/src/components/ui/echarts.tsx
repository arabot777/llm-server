import React, { useRef, useEffect, useMemo, useState } from 'react'
import { cn } from '@/lib/utils'

// 动态导入echarts类型
type EChartsOption = any
type ECharts = any

export interface EChartProps {
    option: EChartsOption
    style?: React.CSSProperties
    className?: string
    theme?: string | object
    onChartReady?: (chart: ECharts) => void
    onClick?: (params: unknown) => void
}

export const EChart: React.FC<EChartProps> = ({
    option,
    style = { width: '100%', height: '350px' },
    className,
    theme,
    onChartReady,
    onClick,
}) => {
    const chartRef = useRef<HTMLDivElement>(null)
    const [echarts, setEcharts] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    // 动态加载echarts
    useEffect(() => {
        const loadEcharts = async () => {
            try {
                const echartsModule = await import('echarts')
                setEcharts(echartsModule)
                setLoading(false)
            } catch (error) {
                console.error('Failed to load echarts:', error)
                setLoading(false)
            }
        }
        loadEcharts()
    }, [])

    // 防抖的 resize 函数
    const resizeChart = useMemo(() => {
        let timeout: NodeJS.Timeout
        return () => {
            clearTimeout(timeout)
            timeout = setTimeout(() => {
                if (chartRef.current && echarts) {
                    const chart = echarts.getInstanceByDom(chartRef.current)
                    chart?.resize()
                }
            }, 300)
        }
    }, [echarts])

    useEffect(() => {
        if (!chartRef.current || !echarts || loading) return

        // 初始化图表
        const chart = echarts.init(chartRef.current, theme)

        // 设置点击事件
        if (onClick) {
            chart.on('click', onClick)
        }

        // 监听窗口 resize 事件
        const handleResize = () => resizeChart()
        window.addEventListener('resize', handleResize)

        // 使用 ResizeObserver 监听容器大小变化
        const resizeObserver = new ResizeObserver(() => {
            resizeChart()
        })
        resizeObserver.observe(chartRef.current)

        // 图表准备完成回调
        if (onChartReady) {
            onChartReady(chart)
        }

        // 清理函数
        return () => {
            chart?.dispose()
            window.removeEventListener('resize', handleResize)
            if (chartRef.current) {
                resizeObserver.unobserve(chartRef.current)
            }
            resizeObserver.disconnect()
        }
    }, [echarts, loading, theme, onChartReady, onClick, resizeChart])

    useEffect(() => {
        // 更新图表配置
        if (!chartRef.current || !echarts || loading) return

        const chart = echarts.getInstanceByDom(chartRef.current)
        if (chart && option) {
            chart.setOption(option, true)
        }
    }, [echarts, loading, option])

    if (loading) {
        return (
            <div 
                style={style} 
                className={cn("w-full flex items-center justify-center bg-gray-50", className)}
            >
                <div className="text-sm text-gray-500">Loading chart...</div>
            </div>
        )
    }

    return (
        <div 
            ref={chartRef} 
            style={style} 
            className={cn("w-full", className)}
        />
    )
} 
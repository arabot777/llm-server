import { useTranslation } from 'react-i18next'

interface TimingBreakdownProps {
    ttfb: number
    internalProcessTime?: number
    upstreamResponseTime?: number
}

export const TimingBreakdown = ({ ttfb, internalProcessTime, upstreamResponseTime }: TimingBreakdownProps) => {
    const { t } = useTranslation()

    // If we don't have breakdown data, just show TTFB
    if (internalProcessTime === undefined && upstreamResponseTime === undefined) {
        return (
            <div className="text-sm">
                <div className="font-medium mb-1">{t('log.ttfb')}: {ttfb}ms</div>
            </div>
        )
    }

    const internal = internalProcessTime || 0
    const upstream = upstreamResponseTime || 0
    const total = ttfb

    // Calculate percentages
    const internalPercent = total > 0 ? (internal / total) * 100 : 0
    const upstreamPercent = total > 0 ? (upstream / total) * 100 : 0

    return (
        <div className="space-y-2">
            <div className="font-medium text-sm">{t('log.ttfb')}: {ttfb}ms</div>

            {/* Visual bar */}
            <div className="w-full h-6 rounded-md overflow-hidden flex border border-border">
                {internal > 0 && (
                    <div
                        className="bg-blue-500 dark:bg-blue-600 flex items-center justify-center text-xs text-white font-medium"
                        style={{ width: `${internalPercent}%` }}
                        title={`${t('log.internalProcessTime')}: ${internal}ms (${internalPercent.toFixed(1)}%)`}
                    >
                        {internalPercent > 10 && `${internal}ms`}
                    </div>
                )}
                {upstream > 0 && (
                    <div
                        className="bg-purple-500 dark:bg-purple-600 flex items-center justify-center text-xs text-white font-medium"
                        style={{ width: `${upstreamPercent}%` }}
                        title={`${t('log.upstreamResponseTime')}: ${upstream}ms (${upstreamPercent.toFixed(1)}%)`}
                    >
                        {upstreamPercent > 10 && `${upstream}ms`}
                    </div>
                )}
            </div>

            {/* Legend */}
            <div className="flex gap-4 text-xs">
                {internal > 0 && (
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded bg-blue-500 dark:bg-blue-600"></div>
                        <span>{t('log.internalProcessTime')}: {internal}ms ({internalPercent.toFixed(1)}%)</span>
                    </div>
                )}
                {upstream > 0 && (
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded bg-purple-500 dark:bg-purple-600"></div>
                        <span>{t('log.upstreamResponseTime')}: {upstream}ms ({upstreamPercent.toFixed(1)}%)</span>
                    </div>
                )}
            </div>
        </div>
    )
}

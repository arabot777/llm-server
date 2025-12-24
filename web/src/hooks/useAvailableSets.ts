// src/hooks/useAvailableSets.ts
import { useQuery } from '@tanstack/react-query'
import { modelApi } from '@/api/model'
import { useMemo } from 'react'

/**
 * 获取所有可用的 sets（从渠道中提取）
 * 这个 hook 可以被用户组和渠道共享使用
 */
export const useAvailableSets = () => {
    const { data: modelSets, isLoading } = useQuery({
        queryKey: ['modelSets'],
        queryFn: () => modelApi.getModelSets(),
    })

    const availableSets = useMemo(() => {
        if (!modelSets) return []

        // 从 modelSets 中提取所有的 set names
        const setsSet = new Set<string>()

        Object.values(modelSets).forEach(modelData => {
            Object.keys(modelData).forEach(setName => {
                setsSet.add(setName)
            })
        })

        return Array.from(setsSet).sort()
    }, [modelSets])

    return {
        availableSets,
        isLoading,
    }
}

// src/feature/group/hooks.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { groupApi } from '@/api/group'
import { useState } from 'react'
import { GroupCreateRequest, GroupUpdateRequest, GroupStatusRequest } from '@/types/group'
import { toast } from 'sonner'

// Re-export useAvailableSets from shared hooks
export { useAvailableSets } from '@/hooks/useAvailableSets'

// 获取分组列表
export const useGroups = (page: number = 1, perPage: number = 20, order?: string) => {
    return useQuery({
        queryKey: ['groups', page, perPage, order],
        queryFn: () => groupApi.getGroups(page, perPage, order),
    })
}

// 搜索分组
export const useSearchGroups = (keyword: string, page: number = 1, perPage: number = 20) => {
    return useQuery({
        queryKey: ['groups', 'search', keyword, page, perPage],
        queryFn: () => groupApi.searchGroups(keyword, page, perPage),
        enabled: keyword.length > 0,
    })
}

// 获取单个分组
export const useGroup = (id: string) => {
    return useQuery({
        queryKey: ['group', id],
        queryFn: () => groupApi.getGroup(id),
        enabled: !!id,
    })
}

// 创建分组
export const useCreateGroup = () => {
    const queryClient = useQueryClient()
    const [error, setError] = useState<ApiError | null>(null)

    const mutation = useMutation({
        mutationFn: (data: GroupCreateRequest) => {
            return groupApi.createGroup(data)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['groups'] })
            setError(null)
            toast.success('分组创建成功')
        },
        onError: (err: ApiError) => {
            setError(err)
            toast.error(err.message || '创建分组失败')
        },
    })

    return {
        createGroup: mutation.mutate,
        isLoading: mutation.isPending,
        error,
        clearError: () => setError(null),
    }
}

// 更新分组
export const useUpdateGroup = () => {
    const queryClient = useQueryClient()
    const [error, setError] = useState<ApiError | null>(null)

    const mutation = useMutation({
        mutationFn: ({ id, data }: { id: string, data: GroupUpdateRequest }) => {
            return groupApi.updateGroup(id, data)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['groups'] })
            queryClient.invalidateQueries({ queryKey: ['group'] })
            setError(null)
            toast.success('分组更新成功')
        },
        onError: (err: ApiError) => {
            setError(err)
            toast.error(err.message || '更新分组失败')
        },
    })

    return {
        updateGroup: mutation.mutate,
        isLoading: mutation.isPending,
        error,
        clearError: () => setError(null),
    }
}

// 删除分组
export const useDeleteGroup = () => {
    const queryClient = useQueryClient()
    const [error, setError] = useState<ApiError | null>(null)

    const mutation = useMutation({
        mutationFn: (id: string) => {
            return groupApi.deleteGroup(id)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['groups'] })
            setError(null)
            toast.success('分组删除成功')
        },
        onError: (err: ApiError) => {
            setError(err)
            toast.error(err.message || '删除分组失败')
        },
    })

    return {
        deleteGroup: mutation.mutate,
        isLoading: mutation.isPending,
        error,
        clearError: () => setError(null),
    }
}

// 批量删除分组
export const useBatchDeleteGroups = () => {
    const queryClient = useQueryClient()
    const [error, setError] = useState<ApiError | null>(null)

    const mutation = useMutation({
        mutationFn: (ids: string[]) => {
            return groupApi.batchDelete(ids)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['groups'] })
            setError(null)
            toast.success('批量删除成功')
        },
        onError: (err: ApiError) => {
            setError(err)
            toast.error(err.message || '批量删除失败')
        },
    })

    return {
        batchDelete: mutation.mutate,
        isLoading: mutation.isPending,
        error,
        clearError: () => setError(null),
    }
}

// 更新分组状态
export const useUpdateGroupStatus = () => {
    const queryClient = useQueryClient()
    const [error, setError] = useState<ApiError | null>(null)

    const mutation = useMutation({
        mutationFn: ({ id, status }: { id: string, status: GroupStatusRequest }) => {
            return groupApi.updateStatus(id, status)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['groups'] })
            setError(null)
            toast.success('状态更新成功')
        },
        onError: (err: ApiError) => {
            setError(err)
            toast.error(err.message || '状态更新失败')
        },
    })

    return {
        updateStatus: mutation.mutate,
        isLoading: mutation.isPending,
        error,
        clearError: () => setError(null),
    }
}

// 批量更新状态
export const useBatchUpdateGroupsStatus = () => {
    const queryClient = useQueryClient()
    const [error, setError] = useState<ApiError | null>(null)

    const mutation = useMutation({
        mutationFn: ({ ids, status }: { ids: string[], status: number }) => {
            return groupApi.batchUpdateStatus(ids, status)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['groups'] })
            setError(null)
            toast.success('批量更新状态成功')
        },
        onError: (err: ApiError) => {
            setError(err)
            toast.error(err.message || '批量更新状态失败')
        },
    })

    return {
        batchUpdateStatus: mutation.mutate,
        isLoading: mutation.isPending,
        error,
        clearError: () => setError(null),
    }
}

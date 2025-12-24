// src/api/group.ts
import { get, post, del, put } from './index'
import {
    GroupsResponse,
    Group,
    GroupCreateRequest,
    GroupUpdateRequest,
    GroupStatusRequest
} from '@/types/group'

export const groupApi = {
    getGroups: async (page: number, perPage: number, order?: string): Promise<GroupsResponse> => {
        const params: Record<string, any> = {
            page,
            per_page: perPage
        }
        if (order) {
            params.order = order
        }
        const response = await get<GroupsResponse>('groups/', { params })
        return response
    },

    searchGroups: async (keyword: string, page: number, perPage: number): Promise<GroupsResponse> => {
        const response = await get<GroupsResponse>('groups/search', {
            params: {
                keyword,
                page,
                per_page: perPage
            }
        })
        return response
    },

    getGroup: async (id: string): Promise<Group> => {
        const response = await get<Group>(`group/${id}`)
        return response
    },

    createGroup: async (data: GroupCreateRequest): Promise<Group> => {
        const response = await post<Group>(`group/${data.id}`, data)
        return response
    },

    updateGroup: async (id: string, data: GroupUpdateRequest): Promise<Group> => {
        const response = await put<Group>(`group/${id}`, data)
        return response
    },

    deleteGroup: async (id: string): Promise<void> => {
        await del(`group/${id}`)
        return
    },

    batchDelete: async (ids: string[]): Promise<void> => {
        await post('groups/batch_delete', { ids })
        return
    },

    updateStatus: async (id: string, status: GroupStatusRequest): Promise<void> => {
        await post(`group/${id}/status`, status)
        return
    },

    batchUpdateStatus: async (ids: string[], status: number): Promise<void> => {
        await post('groups/batch_status', { ids, status })
        return
    },

    updateRPMRatio: async (id: string, ratio: number): Promise<void> => {
        await post(`group/${id}/rpm_ratio`, { rpm_ratio: ratio })
        return
    },

    updateTPMRatio: async (id: string, ratio: number): Promise<void> => {
        await post(`group/${id}/tpm_ratio`, { tpm_ratio: ratio })
        return
    }
}

import { get, post } from './index'
import { AxiosRequestConfig } from 'axios'
import { ChannelTypeMeta } from '@/types/channel'

// Login response interface
export interface LoginResponse {
    success: boolean
    user_type: 'admin' | 'regular'
    token: string
    balance?: number
}

// Auth API endpoints
export const authApi = {
    // New login endpoint
    login: (token: string): Promise<LoginResponse> => {
        return post<LoginResponse>('/auth/login', { token })
    },

    // Get channel type metas (legacy - kept for compatibility)
    getChannelTypeMetas: (token?: string): Promise<ChannelTypeMeta[]> => {
        const config: AxiosRequestConfig = {}

        if (token) {
            config.headers = {
                Authorization: `${token}`
            }
        }

        return get<ChannelTypeMeta[]>('/channels/type_metas', config)
    },

} 
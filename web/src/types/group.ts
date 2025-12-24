// src/types/group.ts
export interface Group {
    id: string
    created_at: number
    accessed_at: number
    status: number // 1=启用, 2=禁用, 3=内部
    rpm_ratio?: number
    tpm_ratio?: number
    used_amount: number
    request_count: number
    available_sets: string[] | null
    balance_alert_enabled: boolean
    balance_alert_threshold: number
}

export interface GroupsResponse {
    groups: Group[]
    total: number
}

export interface GroupCreateRequest {
    id: string
    rpm_ratio?: number
    tpm_ratio?: number
    available_sets?: string[]
    balance_alert_enabled?: boolean
    balance_alert_threshold?: number
}

export interface GroupUpdateRequest {
    rpm_ratio?: number
    tpm_ratio?: number
    available_sets?: string[]
    balance_alert_enabled?: boolean
    balance_alert_threshold?: number
    status?: number
}

export interface GroupStatusRequest {
    status: number
}

export interface GroupRatioRequest {
    rpm_ratio?: number
    tpm_ratio?: number
}

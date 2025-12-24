// src/validation/group.ts
import { z } from 'zod'

export const groupCreateSchema = z.object({
    id: z.string().min(1, 'Group ID is required').max(64, 'Group ID must be at most 64 characters'),
    rpm_ratio: z.number().nonnegative('RPM ratio must be non-negative').optional(),
    tpm_ratio: z.number().nonnegative('TPM ratio must be non-negative').optional(),
    available_sets: z.array(z.string()).optional(),
    balance_alert_enabled: z.boolean().optional(),
    balance_alert_threshold: z.number().nonnegative('Threshold must be non-negative').optional(),
})

export const groupUpdateSchema = z.object({
    rpm_ratio: z.number().nonnegative('RPM ratio must be non-negative').optional(),
    tpm_ratio: z.number().nonnegative('TPM ratio must be non-negative').optional(),
    available_sets: z.array(z.string()).optional(),
    balance_alert_enabled: z.boolean().optional(),
    balance_alert_threshold: z.number().nonnegative('Threshold must be non-negative').optional(),
    status: z.number().min(1).max(3).optional(),
})

export type GroupCreateForm = z.infer<typeof groupCreateSchema>
export type GroupUpdateForm = z.infer<typeof groupUpdateSchema>

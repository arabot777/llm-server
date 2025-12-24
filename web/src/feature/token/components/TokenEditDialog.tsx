// src/feature/token/components/TokenEditDialog.tsx
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useUpdateToken } from '../hooks'
import { Token } from '@/types/token'
import { useTranslation } from 'react-i18next'

const tokenEditSchema = z.object({
    quota: z.number().nonnegative('Quota must be non-negative').optional(),
})

type TokenEditForm = z.infer<typeof tokenEditSchema>

interface TokenEditDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    token: Token | null
}

export function TokenEditDialog({ open, onOpenChange, token }: TokenEditDialogProps) {
    const { t } = useTranslation()
    const { updateToken, isLoading } = useUpdateToken()

    const form = useForm<TokenEditForm>({
        resolver: zodResolver(tokenEditSchema),
        defaultValues: {
            quota: 0,
        },
    })

    // 当 token 改变时更新表单值
    useEffect(() => {
        if (token) {
            form.reset({
                quota: token.quota,
            })
        }
    }, [token, form])

    const onSubmit = (data: TokenEditForm) => {
        if (!token) return

        updateToken(
            {
                id: token.id,
                data: {
                    quota: data.quota,
                },
            },
            {
                onSuccess: () => {
                    onOpenChange(false)
                    form.reset()
                },
            }
        )
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{t('token.editQuota')}</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* Token 名称（只读） */}
                        <div className="space-y-2">
                            <FormLabel>{t('token.name')}</FormLabel>
                            <Input value={token?.name || ''} disabled />
                        </div>

                        {/* 当前已使用金额（只读） */}
                        <div className="space-y-2">
                            <FormLabel>{t('token.usedAmount')}</FormLabel>
                            <Input
                                value={token ? `¥${token.used_amount.toFixed(4)}` : ''}
                                disabled
                            />
                        </div>

                        {/* Quota 配置 */}
                        <FormField
                            control={form.control}
                            name="quota"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('token.quota')}</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            placeholder="0"
                                            step="0.01"
                                            {...field}
                                            onChange={(e) => {
                                                const value = e.target.value
                                                field.onChange(value === '' ? undefined : Number(value))
                                            }}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        {t('token.quotaDescription')}
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* 可用余额（计算值） */}
                        <div className="space-y-2">
                            <FormLabel>{t('token.available')}</FormLabel>
                            <Input
                                value={token && form.watch('quota') !== undefined
                                    ? `¥${((form.watch('quota') || 0) - token.used_amount).toFixed(4)}`
                                    : ''
                                }
                                disabled
                            />
                        </div>

                        <div className="flex justify-end gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={isLoading}
                            >
                                {t('common.cancel')}
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? t('common.saving') : t('common.save')}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

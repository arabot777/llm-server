// src/feature/group/components/GroupDialog.tsx
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
import { Switch } from '@/components/ui/switch'
import { MultiSelectCombobox } from '@/components/select/MultiSelectCombobox'
import { useCreateGroup, useUpdateGroup, useAvailableSets } from '../hooks'
import { Group } from '@/types/group'
import { groupCreateSchema, GroupCreateForm } from '@/validation/group'
import { useTranslation } from 'react-i18next'

interface GroupDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    group?: Group | null
    mode: 'create' | 'update'
}

export function GroupDialog({ open, onOpenChange, group, mode }: GroupDialogProps) {
    const { t } = useTranslation()
    const { createGroup, isLoading: isCreating } = useCreateGroup()
    const { updateGroup, isLoading: isUpdating } = useUpdateGroup()
    const { availableSets, isLoading: setsLoading } = useAvailableSets()

    const isLoading = isCreating || isUpdating

    const form = useForm<GroupCreateForm>({
        resolver: zodResolver(groupCreateSchema),
        defaultValues: {
            id: '',
            available_sets: [],
            balance_alert_enabled: false,
            balance_alert_threshold: 0,
        },
    })

    useEffect(() => {
        if (group && mode === 'update') {
            form.reset({
                id: group.id,
                rpm_ratio: group.rpm_ratio,
                tpm_ratio: group.tpm_ratio,
                available_sets: group.available_sets || [],
                balance_alert_enabled: group.balance_alert_enabled,
                balance_alert_threshold: group.balance_alert_threshold,
            })
        } else if (mode === 'create') {
            form.reset({
                id: '',
                available_sets: [],
                balance_alert_enabled: false,
                balance_alert_threshold: 0,
            })
        }
    }, [group, mode, form])

    const onSubmit = (data: GroupCreateForm) => {
        if (mode === 'create') {
            createGroup(data, {
                onSuccess: () => {
                    onOpenChange(false)
                    form.reset()
                },
            })
        } else if (group) {
            // For update, extract only the fields that can be updated
            const { id, ...updateData } = data
            updateGroup(
                { id: group.id, data: updateData },
                {
                    onSuccess: () => {
                        onOpenChange(false)
                    },
                }
            )
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {mode === 'create' ? t('group.dialog.createTitle') : t('group.dialog.editTitle')}
                    </DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* Group ID (only for create) */}
                        {mode === 'create' && (
                            <FormField
                                control={form.control}
                                name="id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('group.id')}</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder={t('group.dialog.idPlaceholder')}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            {t('group.dialog.idDescription')}
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        {/* Group ID (read-only for update) */}
                        {mode === 'update' && group && (
                            <div className="space-y-2">
                                <FormLabel>{t('group.id')}</FormLabel>
                                <Input value={group.id} disabled />
                            </div>
                        )}

                        {/* Available Sets - Using MultiSelectCombobox */}
                        <FormField
                            control={form.control}
                            name="available_sets"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <MultiSelectCombobox<string>
                                            dropdownItems={availableSets}
                                            selectedItems={field.value || []}
                                            setSelectedItems={(sets) => {
                                                field.onChange(sets)
                                            }}
                                            handleFilteredDropdownItems={(dropdownItems, selectedItems, inputValue) => {
                                                // Filter out already selected items
                                                const filtered = dropdownItems.filter(
                                                    item => !selectedItems.includes(item)
                                                )

                                                // Allow user to create new sets
                                                if (inputValue &&
                                                    !selectedItems.includes(inputValue) &&
                                                    !dropdownItems.includes(inputValue)) {
                                                    return [inputValue, ...filtered]
                                                }

                                                // Filter by input value
                                                if (inputValue) {
                                                    return filtered.filter(item =>
                                                        item.toLowerCase().includes(inputValue.toLowerCase())
                                                    )
                                                }

                                                return filtered
                                            }}
                                            handleDropdownItemDisplay={(item) => item}
                                            handleSelectedItemDisplay={(item) => item}
                                            allowUserCreatedItems={true}
                                            placeholder={t('group.dialog.setsPlaceholder')}
                                            label={t('group.availableSets')}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        {t('group.dialog.setsDescription')}
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* RPM Ratio */}
                        <FormField
                            control={form.control}
                            name="rpm_ratio"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('group.rpmRatio')}</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            step="0.1"
                                            placeholder="1.0"
                                            {...field}
                                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        {t('group.dialog.rpmRatioDescription')}
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* TPM Ratio */}
                        <FormField
                            control={form.control}
                            name="tpm_ratio"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('group.tpmRatio')}</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            step="0.1"
                                            placeholder="1.0"
                                            {...field}
                                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        {t('group.dialog.tpmRatioDescription')}
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Balance Alert */}
                        <FormField
                            control={form.control}
                            name="balance_alert_enabled"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">{t('group.balanceAlert')}</FormLabel>
                                        <FormDescription>
                                            {t('group.dialog.balanceAlertDescription')}
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        {/* Balance Threshold */}
                        {form.watch('balance_alert_enabled') && (
                            <FormField
                                control={form.control}
                                name="balance_alert_threshold"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('group.balanceThreshold')}</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                placeholder={t('group.dialog.thresholdPlaceholder')}
                                                {...field}
                                                onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        <div className="flex justify-end gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={isLoading}
                            >
                                {t('common.cancel')}
                            </Button>
                            <Button type="submit" disabled={isLoading || setsLoading}>
                                {isLoading ? t('common.saving') : t('common.save')}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

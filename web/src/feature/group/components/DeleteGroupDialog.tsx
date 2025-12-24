// src/feature/group/components/DeleteGroupDialog.tsx
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'
import { useDeleteGroup } from '../hooks'
import { useTranslation } from 'react-i18next'

interface DeleteGroupDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    groupId: string | null
    groupName?: string
    onDeleted?: () => void
}

export function DeleteGroupDialog({
    open,
    onOpenChange,
    groupId,
    groupName,
    onDeleted
}: DeleteGroupDialogProps) {
    const { t } = useTranslation()
    const { deleteGroup, isLoading } = useDeleteGroup()

    const handleDelete = () => {
        if (!groupId) return

        deleteGroup(groupId, {
            onSuccess: () => {
                onOpenChange(false)
                onDeleted?.()
            },
        })
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                        {t('group.deleteDialog.title')}
                    </DialogTitle>
                    <DialogDescription className="space-y-2">
                        <p>
                            {t('group.deleteDialog.description', { name: groupName || groupId })}
                        </p>
                        <p className="text-destructive font-medium">
                            {t('group.deleteDialog.warning')}
                        </p>
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isLoading}
                    >
                        {t('common.cancel')}
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isLoading}
                    >
                        {isLoading ? t('common.deleting') : t('group.deleteDialog.confirm')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

// src/feature/group/components/GroupTable.tsx
import { useState } from 'react'
import {
    useReactTable,
    getCoreRowModel,
    ColumnDef,
} from '@tanstack/react-table'
import { useGroups, useUpdateGroupStatus } from '../hooks'
import { Group } from '@/types/group'
import { Button } from '@/components/ui/button'
import {
    MoreHorizontal, Plus, Trash2, RefreshCcw,
    PowerOff, Power, Edit
} from 'lucide-react'
import {
    DropdownMenu, DropdownMenuContent,
    DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Card } from '@/components/ui/card'
import { GroupDialog } from './GroupDialog'
import { DeleteGroupDialog } from './DeleteGroupDialog'
import { DataTable } from '@/components/table/motion-data-table'
import { useTranslation } from 'react-i18next'
import { AnimatedButton } from '@/components/ui/animation/components/animated-button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export function GroupTable() {
    const { t } = useTranslation()

    const [groupDialogOpen, setGroupDialogOpen] = useState(false)
    const [editingGroup, setEditingGroup] = useState<Group | null>(null)
    const [dialogMode, setDialogMode] = useState<'create' | 'update'>('create')
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
    const [page, setPage] = useState(1)
    const perPage = 20

    const { data, isLoading, refetch } = useGroups(page, perPage)
    const { updateStatus, isLoading: isStatusUpdating } = useUpdateGroupStatus()

    const openCreateDialog = () => {
        setEditingGroup(null)
        setDialogMode('create')
        setGroupDialogOpen(true)
    }

    const openEditDialog = (group: Group) => {
        setEditingGroup(group)
        setDialogMode('update')
        setGroupDialogOpen(true)
    }

    const openDeleteDialog = (id: string) => {
        setSelectedGroupId(id)
        setDeleteDialogOpen(true)
    }

    const handleStatusChange = (id: string, currentStatus: number) => {
        const newStatus = currentStatus === 2 ? 1 : 2
        updateStatus({ id, status: { status: newStatus } })
    }

    const formatDateTime = (timestamp: number) => {
        if (timestamp <= 0) return t('group.never')
        return new Intl.DateTimeFormat('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        }).format(new Date(timestamp))
    }

    const columns: ColumnDef<Group>[] = [
        {
            accessorKey: 'id',
            header: () => <div className="font-medium py-3.5">{t("group.id")}</div>,
            cell: ({ row }) => <div className="font-medium">{row.original.id}</div>,
        },
        {
            accessorKey: 'status',
            header: () => <div className="font-medium py-3.5">{t("group.status")}</div>,
            cell: ({ row }) => (
                <div>
                    {row.original.status === 2 ? (
                        <Badge variant="outline" className={cn("text-white dark:text-white/90", "bg-destructive dark:bg-red-600/90")}>
                            {t("group.disabled")}
                        </Badge>
                    ) : row.original.status === 3 ? (
                        <Badge variant="outline" className={cn("text-white dark:text-white/90", "bg-blue-600 dark:bg-blue-600/90")}>
                            {t("group.internal")}
                        </Badge>
                    ) : (
                        <Badge variant="outline" className={cn("text-white dark:text-white/90", "bg-primary dark:bg-[#4A4DA0]")}>
                            {t("group.enabled")}
                        </Badge>
                    )}
                </div>
            ),
        },
        {
            accessorKey: 'used_amount',
            header: () => <div className="font-medium py-3.5">{t("group.usedAmount")}</div>,
            cell: ({ row }) => <div className="font-mono">¥{row.original.used_amount.toFixed(4)}</div>,
        },
        {
            accessorKey: 'request_count',
            header: () => <div className="font-medium py-3.5">{t("group.requestCount")}</div>,
            cell: ({ row }) => <div>{row.original.request_count}</div>,
        },
        {
            accessorKey: 'available_sets',
            header: () => <div className="font-medium py-3.5">{t("group.availableSets")}</div>,
            cell: ({ row }) => {
                const sets = row.original.available_sets || []
                return (
                    <div className="flex flex-wrap gap-1">
                        {sets.length === 0 ? (
                            <Badge variant="secondary">default</Badge>
                        ) : (
                            sets.map(set => (
                                <Badge key={set} variant="secondary">{set}</Badge>
                            ))
                        )}
                    </div>
                )
            },
        },
        {
            accessorKey: 'accessed_at',
            header: () => <div className="font-medium py-3.5">{t("group.lastUsed")}</div>,
            cell: ({ row }) => <div className="text-sm">{formatDateTime(row.original.accessed_at)}</div>,
        },
        {
            id: 'actions',
            cell: ({ row }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(row.original)}>
                            <Edit className="mr-2 h-4 w-4 text-blue-600 dark:text-blue-500" />
                            {t("group.edit")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => handleStatusChange(row.original.id, row.original.status)}
                            disabled={isStatusUpdating}
                        >
                            {row.original.status === 2 ? (
                                <>
                                    <Power className="mr-2 h-4 w-4 text-emerald-600 dark:text-emerald-500" />
                                    {t("group.enable")}
                                </>
                            ) : (
                                <>
                                    <PowerOff className="mr-2 h-4 w-4 text-yellow-600 dark:text-yellow-500" />
                                    {t("group.disable")}
                                </>
                            )}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openDeleteDialog(row.original.id)}>
                            <Trash2 className="mr-2 h-4 w-4 text-red-600 dark:text-red-500" />
                            {t("group.delete")}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ]

    const table = useReactTable({
        data: data?.groups || [],
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    return (
        <>
            <Card className="border-none shadow-none p-6 flex flex-col h-full">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-primary dark:text-[#6A6DE6]">
                        {t("group.management")}
                    </h2>
                    <div className="flex gap-2">
                        <AnimatedButton>
                            <Button variant="outline" size="sm" onClick={() => refetch()}>
                                <RefreshCcw className="h-4 w-4 mr-2" />
                                {t("group.refresh")}
                            </Button>
                        </AnimatedButton>
                        <AnimatedButton>
                            <Button
                                size="sm"
                                onClick={openCreateDialog}
                                className="flex items-center gap-1 bg-primary hover:bg-primary/90 dark:bg-[#4A4DA0] dark:hover:bg-[#5155A5]"
                            >
                                <Plus className="h-3.5 w-3.5" />
                                {t("group.add")}
                            </Button>
                        </AnimatedButton>
                    </div>
                </div>

                <div className="flex-1 overflow-auto">
                    <DataTable
                        table={table}
                        loadingStyle="skeleton"
                        columns={columns}
                        isLoading={isLoading}
                        fixedHeader={true}
                        animatedRows={true}
                        showScrollShadows={true}
                    />
                </div>

                {/* Pagination */}
                {data && data.total > perPage && (
                    <div className="flex items-center justify-between mt-4">
                        <div className="text-sm text-muted-foreground">
                            Total: {data.total} groups
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => p + 1)}
                                disabled={page * perPage >= data.total}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </Card>

            <GroupDialog
                open={groupDialogOpen}
                onOpenChange={setGroupDialogOpen}
                group={editingGroup}
                mode={dialogMode}
            />

            <DeleteGroupDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                groupId={selectedGroupId}
                groupName={selectedGroupId || undefined}
                onDeleted={() => setSelectedGroupId(null)}
            />
        </>
    )
}

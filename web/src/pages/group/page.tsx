// src/pages/group/page.tsx
import { AnimatedRoute } from '@/components/layout/AnimatedRoute'
import { GroupTable } from '@/feature/group/components/GroupTable'

export default function GroupPage() {
    return (
        <AnimatedRoute>
            <div className="container mx-auto h-full">
                <GroupTable />
            </div>
        </AnimatedRoute>
    )
}

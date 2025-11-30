'use client'

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import type { RestartLog } from '../actions/logs'

interface Props {
    logs: RestartLog[]
}

export function LogsTable({ logs }: Props) {
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'success':
                return <Badge variant="default">Success</Badge>
            case 'failed':
                return <Badge variant="destructive">Failed</Badge>
            case 'pending':
                return <Badge variant="secondary">Pending</Badge>
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    const getTriggerBadge = (triggerType: string) => {
        return triggerType === 'auto' ? (
            <Badge variant="secondary">Auto</Badge>
        ) : (
            <Badge variant="outline">Manual</Badge>
        )
    }

    return (
        <div className="rounded-md border">
            {logs.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No logs found</p>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Node</TableHead>
                            <TableHead>Action</TableHead>
                            <TableHead>Trigger</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Started</TableHead>
                            <TableHead>Duration</TableHead>
                            <TableHead>Triggered By</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {logs.map((log) => (
                            <TableRow key={log.id}>
                                <TableCell className="font-medium">{log.node_name}</TableCell>
                                <TableCell className="capitalize">{log.action}</TableCell>
                                <TableCell>{getTriggerBadge(log.trigger_type)}</TableCell>
                                <TableCell>{getStatusBadge(log.status)}</TableCell>
                                <TableCell>
                                    {new Date(log.started_at).toLocaleString()}
                                </TableCell>
                                <TableCell>
                                    {log.duration_seconds ? `${log.duration_seconds}s` : '-'}
                                </TableCell>
                                <TableCell>{log.triggered_by}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </div>
    )
}

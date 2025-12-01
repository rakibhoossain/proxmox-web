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
import { Button } from '@/components/ui/button'
import { FileText } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'

interface Log {
    id: number
    vmid: number
    resource_name: string
    node: string
    action: string
    trigger_type: string
    triggered_by: string
    status: string
    error_message?: string
    output?: string
    started_at: string
    completed_at?: string
    duration_seconds?: number
}

export function LogsTable({ logs }: { logs: Log[] }) {
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Time</TableHead>
                        <TableHead>Resource</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Trigger</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Output</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {logs.map((log) => (
                        <TableRow key={log.id}>
                            <TableCell className="whitespace-nowrap">
                                {new Date(log.started_at).toLocaleString()}
                            </TableCell>
                            <TableCell>
                                <div className="font-medium">{log.resource_name}</div>
                                <div className="text-xs text-muted-foreground">
                                    {log.vmid} ({log.node})
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge variant="outline">{log.action}</Badge>
                            </TableCell>
                            <TableCell>
                                <div className="text-sm">{log.trigger_type}</div>
                                <div className="text-xs text-muted-foreground">
                                    by {log.triggered_by}
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge
                                    variant={
                                        log.status === 'success'
                                            ? 'default'
                                            : log.status === 'failed'
                                                ? 'destructive'
                                                : 'secondary'
                                    }
                                >
                                    {log.status}
                                </Badge>
                                {log.error_message && (
                                    <div className="text-xs text-red-500 mt-1 max-w-[200px] truncate" title={log.error_message}>
                                        {log.error_message}
                                    </div>
                                )}
                            </TableCell>
                            <TableCell>
                                {log.duration_seconds ? `${log.duration_seconds}s` : '-'}
                            </TableCell>
                            <TableCell>
                                {log.output && (
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="ghost" size="sm">
                                                <FileText className="h-4 w-4" />
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                                            <DialogHeader>
                                                <DialogTitle>Command Output</DialogTitle>
                                                <DialogDescription>
                                                    Output from {log.action} on {log.resource_name} ({log.vmid})
                                                </DialogDescription>
                                            </DialogHeader>
                                            <pre className="bg-muted p-4 rounded-md overflow-x-auto text-xs font-mono whitespace-pre-wrap">
                                                {log.output}
                                            </pre>
                                        </DialogContent>
                                    </Dialog>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}

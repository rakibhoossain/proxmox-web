import { notFound } from 'next/navigation'
import { getNode, restartNode, stopNode, startNode } from '@/app/actions/nodes'
import { getLogs } from '@/app/actions/logs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { NodeControls } from './node-controls'
import { LogsTable } from '@/app/logs/logs-table'

export const dynamic = 'force-dynamic'

function formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    return `${days}d ${hours}h ${mins}m`
}

function formatBytes(bytes: number): string {
    return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`
}

export default async function NodePage({ params }: { params: Promise<{ name: string }> }) {
    const { name } = await params
    const [node, logs] = await Promise.all([
        getNode(name),
        getLogs({ node_name: name, limit: 20 }),
    ])

    if (!node) {
        notFound()
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
            <div className="container mx-auto p-8">
                <div className="mb-6">
                    <Link href="/">
                        <Button variant="ghost" className="mb-4">← Back to Nodes</Button>
                    </Link>
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl font-bold">{node.node_name}</h1>
                        <Badge variant={node.status === 'online' ? 'default' : 'destructive'} className="text-lg px-3 py-1">
                            {node.status}
                        </Badge>
                    </div>
                    <p className="text-muted-foreground">
                        Manage and monitor this Proxmox node
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    {/* Node Stats */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Uptime</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatUptime(node.uptime)}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>CPU Usage</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{(node.cpu_usage * 100).toFixed(1)}%</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Memory Usage</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {formatBytes(node.memory_used)}
                            </div>
                            <p className="text-sm text-muted-foreground">
                                of {formatBytes(node.memory_total)}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Controls */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Node Controls</CardTitle>
                        <CardDescription>
                            Manually control this node. Note: Start requires IPMI/WOL setup.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <NodeControls nodeName={node.node_name} />
                    </CardContent>
                </Card>

                {/* Recent Logs */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Logs</CardTitle>
                        <CardDescription>
                            Last {logs.length} operations for this node
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {logs.length === 0 ? (
                            <p className="text-center text-muted-foreground py-8">
                                No logs found for this node
                            </p>
                        ) : (
                            <LogsTable logs={logs} />
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

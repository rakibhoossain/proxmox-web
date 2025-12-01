import { notFound } from 'next/navigation'
import { getResourceByVMID } from '@/app/actions/resources'
import { getLogs } from '@/app/actions/logs'
import { getContainerServices } from '@/app/actions/services'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ResourceControls } from './resource-controls'
import { ResourceActions } from './resource-actions'
import { InstalledServices } from './installed-services'
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

export default async function ResourcePage({
    params,
    searchParams
}: {
    params: Promise<{ vmid: string }>
    searchParams: Promise<{ node: string }>
}) {
    const { vmid } = await params
    const { node: nodeName } = await searchParams

    if (!nodeName) {
        return (
            <div className="container mx-auto p-8">
                <div className="alert alert-error">Node parameter is required</div>
                <Link href="/">
                    <Button variant="ghost">← Back to Resources</Button>
                </Link>
            </div>
        )
    }

    const vmidInt = parseInt(vmid)
    const [resource, logs, services] = await Promise.all([
        getResourceByVMID(vmidInt, nodeName),
        getLogs({ vmid: vmidInt, limit: 20 }),
        getContainerServices(vmidInt, nodeName),
    ])

    if (!resource) {
        notFound()
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
            <div className="container mx-auto p-8">
                <div className="mb-6">
                    <Link href="/">
                        <Button variant="ghost" className="mb-4">← Back to Resources</Button>
                    </Link>
                    <div className="flex items-center gap-3 mb-2">
                        <Badge variant="outline" className="text-lg px-3 py-1 font-mono">
                            {resource.vmid}
                        </Badge>
                        <h1 className="text-3xl font-bold">{resource.name}</h1>
                        <Badge variant="secondary" className="uppercase">
                            {resource.type}
                        </Badge>
                        <Badge
                            variant={resource.status === 'running' ? 'default' : 'secondary'}
                            className={`text-lg px-3 py-1 ${resource.status !== 'running' ? 'bg-slate-500' : ''}`}
                        >
                            {resource.status}
                        </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                        <ResourceActions vmid={vmidInt} node={nodeName} resourceName={resource.name} />
                    </div>
                    <p className="text-muted-foreground">
                        Running on node <span className="font-semibold text-foreground">{resource.node}</span>
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
                    {/* Resource Stats */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Uptime</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatUptime(resource.uptime)}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>CPU Usage</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{(resource.cpu_usage * 100).toFixed(1)}%</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Memory Usage</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {formatBytes(resource.memory_used)}
                            </div>
                            <p className="text-sm text-muted-foreground">
                                of {formatBytes(resource.memory_total)}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Disk Usage</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {formatBytes(resource.disk_used)}
                            </div>
                            <p className="text-sm text-muted-foreground">
                                of {formatBytes(resource.disk_total)}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Controls */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Resource Controls</CardTitle>
                        <CardDescription>
                            Manually control this VM/Container.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResourceControls
                            vmid={resource.vmid}
                            node={resource.node}
                            currentStatus={resource.status}
                        />
                    </CardContent>
                </Card>

                {/* Installed Services */}
                <InstalledServices services={services} vmid={vmidInt} node={nodeName} />

                {/* Recent Logs */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Logs</CardTitle>
                        <CardDescription>
                            Last {logs?.length || 0} operations for this resource
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {!logs?.length ? (
                            <p className="text-center text-muted-foreground py-8">
                                No logs found for this resource
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

import Link from 'next/link'
import { getNodes } from './actions/nodes'
import { getWhitelist } from './actions/whitelist'
import { getSystemStatus } from './actions/logs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Activity, Server, Clock, BarChart } from 'lucide-react'

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

export default async function Home() {
  const [nodes, whitelist, status] = await Promise.all([
    getNodes(),
    getWhitelist(),
    getSystemStatus(),
  ])

  const whitelistedNames = new Set(whitelist.map((w) => w.node_name))

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            Proxmox Auto-Restart System
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Monitor and manage Proxmox node restarts
          </p>
        </div>

        {/* Quick Stats */}
        {status && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Total Nodes</CardTitle>
                <Server className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{status.total_nodes}</div>
                <p className="text-xs text-muted-foreground">
                  {status.online_nodes} online
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Whitelisted</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{status.whitelisted_nodes}</div>
                <p className="text-xs text-muted-foreground">Auto-restart enabled</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Total Restarts</CardTitle>
                <BarChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{status.total_restarts}</div>
                <p className="text-xs text-muted-foreground">
                  {status.failed_restarts} failed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Next Restart</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {new Date(status.next_restart_time).toLocaleTimeString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(status.next_restart_time).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-4 mb-6">
          <Link href="/">
            <Button variant="default">Nodes</Button>
          </Link>
          <Link href="/whitelist">
            <Button variant="outline">Whitelist</Button>
          </Link>
          <Link href="/logs">
            <Button variant="outline">Logs</Button>
          </Link>
        </div>

        {/* Nodes List */}
        <Card>
          <CardHeader>
            <CardTitle>Proxmox Nodes</CardTitle>
            <CardDescription>View and manage all Proxmox nodes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {nodes.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No nodes found. Waiting for sync...
                </p>
              ) : (
                nodes.map((node) => (
                  <div
                    key={node.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{node.node_name}</h3>
                        <Badge
                          variant={node.status === 'online' ? 'default' : 'destructive'}
                        >
                          {node.status}
                        </Badge>
                        {whitelistedNames.has(node.node_name) && (
                          <Badge variant="secondary">Auto-restart</Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                        <div>
                          <span className="font-medium">Uptime:</span>{' '}
                          {formatUptime(node.uptime)}
                        </div>
                        <div>
                          <span className="font-medium">CPU:</span>{' '}
                          {(node.cpu_usage * 100).toFixed(1)}%
                        </div>
                        <div>
                          <span className="font-medium">Memory:</span>{' '}
                          {formatBytes(node.memory_used)} / {formatBytes(node.memory_total)}
                        </div>
                        <div>
                          <span className="font-medium">Last Sync:</span>{' '}
                          {new Date(node.last_synced_at).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/nodes/${node.node_name}`}>
                        <Button size="sm">Manage</Button>
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

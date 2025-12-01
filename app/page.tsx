import Link from 'next/link'
import { getResources } from './actions/resources'
import { getWhitelist } from './actions/whitelist'
import { getSystemStatus } from './actions/logs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Activity, Server, Clock, BarChart, HardDrive } from 'lucide-react'
import { Navigation } from '@/components/navigation'

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
  const [resources, whitelist, status] = await Promise.all([
    getResources(),
    getWhitelist(),
    getSystemStatus(),
  ])

  const whitelistedIds = new Set(whitelist.map((w) => w.vmid))

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            Proxmox Auto-Restart System
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Monitor and manage Proxmox VMs and Containers
          </p>
        </div>

        {/* Quick Stats */}
        {status && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Total Resources</CardTitle>
                <Server className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{status.total_resources}</div>
                <p className="text-xs text-muted-foreground">
                  {status.running_resources} running
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Whitelisted</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{status.whitelisted_count}</div>
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
        <Navigation />

        {/* Resources List */}
        <Card>
          <CardHeader>
            <CardTitle>VMs & Containers</CardTitle>
            <CardDescription>View and manage all Proxmox resources</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {resources.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No resources found. Check connection to Proxmox.
                </p>
              ) : (
                resources.map((resource) => (
                  <div
                    key={`${resource.node}-${resource.vmid}`}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="font-mono">
                          {resource.vmid}
                        </Badge>
                        <h3 className="font-semibold text-lg">{resource.name}</h3>
                        <Badge variant="secondary" className="uppercase text-xs">
                          {resource.type}
                        </Badge>
                        <Badge
                          variant={resource.status === 'running' ? 'default' : 'secondary'}
                          className={resource.status !== 'running' ? 'bg-slate-500 hover:bg-slate-600' : ''}
                        >
                          {resource.status}
                        </Badge>
                        {whitelistedIds.has(resource.vmid) && (
                          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                            Auto-restart
                          </Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm text-muted-foreground">
                        <div>
                          <span className="font-medium">Node:</span> {resource.node}
                        </div>
                        <div>
                          <span className="font-medium">Uptime:</span>{' '}
                          {formatUptime(resource.uptime)}
                        </div>
                        <div>
                          <span className="font-medium">CPU:</span>{' '}
                          {(resource.cpu_usage * 100).toFixed(1)}%
                        </div>
                        <div>
                          <span className="font-medium">Memory:</span>{' '}
                          {formatBytes(resource.memory_used)} / {formatBytes(resource.memory_total)}
                        </div>
                        <div>
                          <span className="font-medium">Disk:</span>{' '}
                          {formatBytes(resource.disk_used)} / {formatBytes(resource.disk_total)}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Link href={`/resources/${resource.vmid}?node=${resource.node}`}>
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

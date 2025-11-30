import { getLogs } from '../actions/logs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { LogsTable } from './logs-table'

export const dynamic = 'force-dynamic'

export default async function LogsPage() {
    const logs = await getLogs({ limit: 100 })

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
            <div className="container mx-auto p-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold mb-2">Restart Logs</h1>
                    <p className="text-muted-foreground">
                        View audit trail of all restart operations
                    </p>
                </div>

                <div className="flex gap-4 mb-6">
                    <Link href="/">
                        <Button variant="outline">Resources</Button>
                    </Link>
                    <Link href="/whitelist">
                        <Button variant="outline">Whitelist</Button>
                    </Link>
                    <Link href="/logs">
                        <Button variant="default">Logs</Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Recent Logs</CardTitle>
                        <CardDescription>Last {logs?.length || 0} restart operations</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <LogsTable logs={logs} />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

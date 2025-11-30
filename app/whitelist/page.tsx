import { getWhitelist } from '../actions/whitelist'
import { getResources } from '../actions/resources'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { WhitelistManager } from './whitelist-manager'

export const dynamic = 'force-dynamic'

export default async function WhitelistPage() {
    const [whitelist, resources] = await Promise.all([getWhitelist(), getResources()])

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
            <div className="container mx-auto p-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold mb-2">Auto-Restart Whitelist</h1>
                    <p className="text-muted-foreground">
                        Manage which VMs and Containers will be automatically restarted every 6 hours
                    </p>
                </div>

                <div className="flex gap-4 mb-6">
                    <Link href="/">
                        <Button variant="outline">Resources</Button>
                    </Link>
                    <Link href="/whitelist">
                        <Button variant="default">Whitelist</Button>
                    </Link>
                    <Link href="/logs">
                        <Button variant="outline">Logs</Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Whitelisted Resources</CardTitle>
                        <CardDescription>
                            {whitelist?.length || 0} resource{whitelist?.length > 1 ? 's' : ''} configured for auto-restart
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <WhitelistManager initialWhitelist={whitelist} availableResources={resources} />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

import { getWhitelist } from '@/app/actions/whitelist'
import { getResources } from '@/app/actions/resources'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Navigation } from '@/components/navigation'
import { WhitelistManager } from './whitelist-manager'
import { AddToWhitelistDialog } from './add-dialog'

export const dynamic = 'force-dynamic'

export default async function WhitelistPage() {
    const [whitelist, resources] = await Promise.all([getWhitelist(), getResources()])

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
            <div className="container mx-auto p-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold mb-2">Auto-Restart Whitelist</h1>
                    <p className="text-muted-foreground">
                        Manage which VMs and Containers will be automatically restarted.
                        Default interval is 6 hours, but can be configured per resource.
                    </p>
                </div>

                <Navigation />

                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>Whitelisted Resources</CardTitle>
                                <CardDescription>
                                    {whitelist?.length || 0} resource{whitelist?.length !== 1 ? 's' : ''} configured for auto-restart
                                </CardDescription>
                            </div>
                            <AddToWhitelistDialog />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <WhitelistManager initialWhitelist={whitelist} availableResources={resources} />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

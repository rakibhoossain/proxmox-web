'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Plus, Trash2, Power, PowerOff } from 'lucide-react'
import { addToWhitelist, deleteFromWhitelist, updateWhitelist, type WhitelistEntry } from '../actions/whitelist'
import type { Resource } from '../actions/resources'
import { useRouter } from 'next/navigation'

interface Props {
    initialWhitelist: WhitelistEntry[]
    availableResources: Resource[]
}

export function WhitelistManager({ initialWhitelist, availableResources }: Props) {
    const router = useRouter()
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [selectedResourceId, setSelectedResourceId] = useState('')
    const [notes, setNotes] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleAdd = async () => {
        if (!selectedResourceId) return

        const resource = availableResources?.find(r => r.vmid.toString() === selectedResourceId)
        if (!resource) return

        setIsSubmitting(true)
        try {
            await addToWhitelist(resource.vmid, resource.name, resource.node, notes)
            setIsAddDialogOpen(false)
            setSelectedResourceId('')
            setNotes('')
            router.refresh()
        } catch (error) {
            console.error('Failed to add to whitelist:', error)
            alert('Failed to add to whitelist')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleToggle = async (id: number, currentEnabled: boolean, currentNotes: string) => {
        try {
            await updateWhitelist(id, !currentEnabled, currentNotes)
            router.refresh()
        } catch (error) {
            console.error('Failed to toggle whitelist:', error)
            alert('Failed to toggle whitelist')
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to remove this resource from the whitelist?')) return
        try {
            await deleteFromWhitelist(id)
            router.refresh()
        } catch (error) {
            console.error('Failed to delete from whitelist:', error)
            alert('Failed to delete from whitelist')
        }
    }

    const whitelistedVmids = new Set(initialWhitelist?.map((w) => w.vmid))
    const availableToAdd = availableResources?.filter((r) => !whitelistedVmids.has(r.vmid))

    return (
        <div className="space-y-4">
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                    <Button className="w-full">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Resource to Whitelist
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Resource to Whitelist</DialogTitle>
                        <DialogDescription>
                            Select a VM or Container to enable automatic restart every 6 hours
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                        <div>
                            <label className="text-sm font-medium mb-2 block">Resource</label>
                            <Select value={selectedResourceId} onValueChange={setSelectedResourceId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a resource" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableToAdd.map((resource) => (
                                        <SelectItem key={resource.vmid} value={resource.vmid.toString()}>
                                            <span className="font-mono mr-2">[{resource.vmid}]</span>
                                            {resource.name} ({resource.type} on {resource.node})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-2 block">Notes (optional)</label>
                            <Textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Add any notes about this resource..."
                            />
                        </div>
                        <Button onClick={handleAdd} disabled={!selectedResourceId || isSubmitting} className="w-full">
                            {isSubmitting ? 'Adding...' : 'Add to Whitelist'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {!initialWhitelist?.length ? (
                <p className="text-center text-muted-foreground py-8">
                    No resources in whitelist. Add resources to enable auto-restart.
                </p>
            ) : (
                <div className="space-y-3">
                    {initialWhitelist?.map((item) => (
                        <div
                            key={item.id}
                            className="flex items-center justify-between p-4 border rounded-lg"
                        >
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <Badge variant="outline" className="font-mono">
                                        {item.vmid}
                                    </Badge>
                                    <h3 className="font-semibold">{item.resource_name}</h3>
                                    <Badge variant="secondary" className="text-xs">
                                        {item.node}
                                    </Badge>
                                    <Badge variant={item.enabled ? 'default' : 'secondary'}>
                                        {item.enabled ? 'Enabled' : 'Disabled'}
                                    </Badge>
                                </div>
                                {item.notes && (
                                    <p className="text-sm text-muted-foreground">{item.notes}</p>
                                )}
                                <p className="text-xs text-muted-foreground mt-1">
                                    Added by {item.created_by} on {new Date(item.created_at).toLocaleDateString()}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleToggle(item.id, item.enabled, item.notes)}
                                >
                                    {item.enabled ? (
                                        <PowerOff className="h-4 w-4" />
                                    ) : (
                                        <Power className="h-4 w-4" />
                                    )}
                                </Button>
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleDelete(item.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

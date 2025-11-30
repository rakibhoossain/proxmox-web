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
import { addToWhitelist, deleteFromWhitelist, updateWhitelist, type Whitelist } from '../actions/whitelist'
import type { Node } from '../actions/nodes'
import { useRouter } from 'next/navigation'

interface Props {
    initialWhitelist: Whitelist[]
    availableNodes: Node[]
}

export function WhitelistManager({ initialWhitelist, availableNodes }: Props) {
    const router = useRouter()
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [selectedNode, setSelectedNode] = useState('')
    const [notes, setNotes] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleAdd = async () => {
        if (!selectedNode) return
        setIsSubmitting(true)
        try {
            await addToWhitelist(selectedNode, 'ui', notes)
            setIsAddDialogOpen(false)
            setSelectedNode('')
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
        if (!confirm('Are you sure you want to remove this node from the whitelist?')) return
        try {
            await deleteFromWhitelist(id)
            router.refresh()
        } catch (error) {
            console.error('Failed to delete from whitelist:', error)
            alert('Failed to delete from whitelist')
        }
    }

    const whitelistedNames = new Set(initialWhitelist.map((w) => w.node_name))
    const availableToAdd = availableNodes.filter((n) => !whitelistedNames.has(n.node_name))

    return (
        <div className="space-y-4">
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                    <Button className="w-full">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Node to Whitelist
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Node to Whitelist</DialogTitle>
                        <DialogDescription>
                            Select a node to enable automatic restart every 6 hours
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                        <div>
                            <label className="text-sm font-medium mb-2 block">Node</label>
                            <Select value={selectedNode} onValueChange={setSelectedNode}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a node" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableToAdd.map((node) => (
                                        <SelectItem key={node.id} value={node.node_name}>
                                            {node.node_name}
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
                                placeholder="Add any notes about this node..."
                            />
                        </div>
                        <Button onClick={handleAdd} disabled={!selectedNode || isSubmitting} className="w-full">
                            {isSubmitting ? 'Adding...' : 'Add to Whitelist'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {initialWhitelist.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                    No nodes in whitelist. Add nodes to enable auto-restart.
                </p>
            ) : (
                <div className="space-y-3">
                    {initialWhitelist.map((item) => (
                        <div
                            key={item.id}
                            className="flex items-center justify-between p-4 border rounded-lg"
                        >
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-semibold">{item.node_name}</h3>
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

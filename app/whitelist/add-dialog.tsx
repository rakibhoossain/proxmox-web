'use client'

import { addToWhitelist } from '@/app/actions/whitelist'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'

export function AddToWhitelistDialog() {
    const router = useRouter()
    const [vmid, setVmid] = useState('')
    const [resourceName, setResourceName] = useState('')
    const [node, setNode] = useState('')
    const [notes, setNotes] = useState('')
    const [restartInterval, setRestartInterval] = useState('6')
    const [isLoading, setIsLoading] = useState(false)
    const [isOpen, setIsOpen] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const vmidInt = parseInt(vmid)
            if (isNaN(vmidInt)) throw new Error('Invalid VMID')

            await addToWhitelist(vmidInt, resourceName, node, notes, parseInt(restartInterval))
            setIsOpen(false)
            setVmid('')
            setResourceName('')
            setNode('')
            setNotes('')
            setRestartInterval('6')
            router.refresh()
        } catch (error) {
            console.error('Failed to add to whitelist:', error)
            alert('Failed to add to whitelist')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add to Whitelist
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Resource to Whitelist</DialogTitle>
                    <DialogDescription>
                        Configure auto-restart for a VM or Container.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="vmid">VMID</Label>
                        <Input
                            id="vmid"
                            value={vmid}
                            onChange={(e) => setVmid(e.target.value)}
                            placeholder="100"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="name">Resource Name</Label>
                        <Input
                            id="name"
                            value={resourceName}
                            onChange={(e) => setResourceName(e.target.value)}
                            placeholder="my-container"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="node">Node</Label>
                        <Input
                            id="node"
                            value={node}
                            onChange={(e) => setNode(e.target.value)}
                            placeholder="pve"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="interval">Restart Interval (Hours)</Label>
                        <select
                            id="interval"
                            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={restartInterval}
                            onChange={(e) => setRestartInterval(e.target.value)}
                        >
                            {[1, 2, 3, 4, 5, 6].map((h) => (
                                <option key={h} value={h}>
                                    Every {h} hour{h > 1 ? 's' : ''}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes (Optional)</Label>
                        <Input
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Production node"
                        />
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Adding...' : 'Add to Whitelist'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

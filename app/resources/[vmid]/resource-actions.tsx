'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Copy, Trash2 } from 'lucide-react'
import { cloneContainer, deleteContainer } from '@/app/actions/containers'
import { getSuggestedVMID } from '@/app/actions/vmid'

interface Props {
    vmid: number
    node: string
    resourceName: string
}

export function ResourceActions({ vmid, node, resourceName }: Props) {
    const router = useRouter()
    const [isCloning, setIsCloning] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [cloneDialogOpen, setCloneDialogOpen] = useState(false)
    const [newVMID, setNewVMID] = useState('')
    const [hostname, setHostname] = useState('')
    const [error, setError] = useState('')

    const handleCloneDialogOpen = async () => {
        const suggested = await getSuggestedVMID()
        setNewVMID(suggested.toString())
        setHostname(`${resourceName}-clone`)
        setCloneDialogOpen(true)
    }

    const handleClone = async () => {
        if (!newVMID) {
            setError('New VMID is required')
            return
        }

        setError('')
        setIsCloning(true)

        const result = await cloneContainer(vmid, parseInt(newVMID), node, hostname)

        if (result.success) {
            setCloneDialogOpen(false)
            router.push(`/resources/${newVMID}?node=${node}`)
            router.refresh()
        } else {
            setError(result.error || 'Clone failed')
            setIsCloning(false)
        }
    }

    const handleDelete = async () => {
        setIsDeleting(true)

        const result = await deleteContainer(vmid, node)

        if (result.success) {
            router.push('/')
            router.refresh()
        } else {
            alert(result.error || 'Delete failed')
            setIsDeleting(false)
        }
    }

    return (
        <div className="flex gap-2">
            <Dialog open={cloneDialogOpen} onOpenChange={setCloneDialogOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm" onClick={handleCloneDialogOpen}>
                        <Copy className="h-4 w-4 mr-2" />
                        Clone
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Clone Container</DialogTitle>
                        <DialogDescription>
                            Create a copy of CT{vmid} ({resourceName})
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="new-vmid">New Container ID *</Label>
                            <Input
                                id="new-vmid"
                                type="number"
                                placeholder="Auto-suggested"
                                value={newVMID}
                                onChange={(e) => setNewVMID(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="hostname">Hostname (Optional)</Label>
                            <Input
                                id="hostname"
                                type="text"
                                placeholder="e.g., clone-name"
                                value={hostname}
                                onChange={(e) => setHostname(e.target.value)}
                            />
                        </div>
                        {error && (
                            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                        )}
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setCloneDialogOpen(false)}
                            disabled={isCloning}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleClone} disabled={isCloning || !newVMID}>
                            {isCloning ? 'Cloning...' : 'Clone Container'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete CT{vmid} ({resourceName}) and remove it from the whitelist.
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {isDeleting ? 'Deleting...' : 'Delete Container'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

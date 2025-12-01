'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import Link from 'next/link'
import { deployBlockchainNode } from '../actions/containers'
import { getSuggestedVMID } from '../actions/vmid'
import { Badge } from '@/components/ui/badge'
import { Navigation } from '@/components/navigation'

const BLOCKCHAIN_TEMPLATES = {
    grow: `bash <(curl -s https://download.growblockchain.net/node-binaries/v2.6.1-b/linux.sh)`,
    connect: `bash <(wget -qO- https://static.connectblockchain.net/go-node/install/linux_amd64.sh) -b win`,
    custom: '',
}

export default function DeployPage() {
    const router = useRouter()
    const [sourceVMID, setSourceVMID] = useState(200)
    const [newVMID, setNewVMID] = useState('')
    const [targetNode, setTargetNode] = useState('www')
    const [hostname, setHostname] = useState('')
    const [template, setTemplate] = useState<keyof typeof BLOCKCHAIN_TEMPLATES>('grow')
    const [customCommands, setCustomCommands] = useState('')
    const [isDeploying, setIsDeploying] = useState(false)
    const [error, setError] = useState('')

    // Fetch suggested VMID on mount
    useEffect(() => {
        const fetchSuggestedVMID = async () => {
            const suggested = await getSuggestedVMID()
            setNewVMID(suggested.toString())
        }
        fetchSuggestedVMID()
    }, [])

    const handleDeploy = async () => {
        if (!newVMID || !targetNode) {
            setError('New VMID and Target Node are required')
            return
        }

        setError('')
        setIsDeploying(true)

        // Backend automatically handles base setup (locales, UTF-8, curl)
        const blockchainCommands = template === 'custom'
            ? customCommands.split('\n').filter(cmd => cmd.trim())
            : BLOCKCHAIN_TEMPLATES[template].split('\n').filter(cmd => cmd.trim())

        const result = await deployBlockchainNode(
            sourceVMID,
            parseInt(newVMID),
            targetNode,
            blockchainCommands,
            hostname || `blockchain-node-${newVMID}`
        )

        if (result.success) {
            router.push(`/resources/${newVMID}?node=${targetNode}`)
        } else {
            setError(result.error || 'Deployment failed')
            setIsDeploying(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
            <div className="container mx-auto p-8">
                <div className="mb-6">
                    <Link href="/">
                        <Button variant="ghost" className="mb-4">← Back to Dashboard</Button>
                    </Link>
                    <h1 className="text-3xl font-bold mb-2">Deploy Blockchain Node</h1>
                    <p className="text-muted-foreground">
                        Deploy a new blockchain node from a template container
                    </p>
                </div>

                <Navigation />

                <Card>
                    <CardHeader>
                        <CardTitle>Deployment Configuration</CardTitle>
                        <CardDescription>
                            Clone CT{sourceVMID} and deploy a blockchain node
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="source">Source Container ID</Label>
                                <Input
                                    id="source"
                                    type="number"
                                    value={sourceVMID}
                                    onChange={(e) => setSourceVMID(parseInt(e.target.value) || 200)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="new-vmid">New Container ID * <span className="text-xs text-muted-foreground">(auto-suggested)</span></Label>
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
                                <Label htmlFor="node">Target Node *</Label>
                                <Input
                                    id="node"
                                    type="text"
                                    placeholder="e.g., www"
                                    value={targetNode}
                                    onChange={(e) => setTargetNode(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="hostname">Hostname (Optional)</Label>
                                <Input
                                    id="hostname"
                                    type="text"
                                    placeholder="e.g., blockchain-node-1"
                                    value={hostname}
                                    onChange={(e) => setHostname(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Blockchain Template</Label>
                            <Select value={template} onValueChange={(value) => setTemplate(value as keyof typeof BLOCKCHAIN_TEMPLATES)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value=" grow">
                                        <div className="flex items-center gap-2">
                                            <span>Grow Blockchain</span>
                                            <Badge variant="secondary" className="text-xs">v2.6.1-b</Badge>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="connect">
                                        <div className="flex items-center gap-2">
                                            <span>Connect Blockchain</span>
                                            <Badge variant="secondary" className="text-xs">linux_amd64</Badge>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="custom">Custom Commands</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="commands">Deployment Commands</Label>
                            {template === 'custom' ? (
                                <Textarea
                                    id="commands"
                                    placeholder="Enter commands (one per line)"
                                    value={customCommands}
                                    onChange={(e) => setCustomCommands(e.target.value)}
                                    rows={10}
                                    className="font-mono text-sm"
                                />
                            ) : (
                                <Textarea
                                    id="commands"
                                    value={BLOCKCHAIN_TEMPLATES[template]}
                                    readOnly
                                    rows={5}
                                    className="font-mono text-sm bg-slate-50 dark:bg-slate-900"
                                />
                            )}
                            <p className="text-xs text-muted-foreground">
                                Base setup (locales, UTF-8, curl, wget) is automatically handled by the backend
                            </p>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-800 dark:text-red-200 text-sm">
                                {error}
                            </div>
                        )}

                        <Button
                            onClick={handleDeploy}
                            disabled={isDeploying || !newVMID || !targetNode}
                            className="w-full"
                            size="lg"
                        >
                            {isDeploying ? 'Deploying...' : 'Deploy Blockchain Node'}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Power, PowerOff, RotateCw } from 'lucide-react'
import { restartResource, stopResource, startResource } from '@/app/actions/resources'
import { useRouter } from 'next/navigation'

interface Props {
    vmid: number
    node: string
    currentStatus: string
}

export function ResourceControls({ vmid, node, currentStatus }: Props) {
    const router = useRouter()
    const [loading, setLoading] = useState<string | null>(null)

    const handleRestart = async () => {
        if (!confirm(`Are you sure you want to restart resource ${vmid}?`)) return
        setLoading('restart')
        try {
            await restartResource(vmid, node, 'ui')
            alert(`Restart triggered for ${vmid}`)
            router.refresh()
        } catch (error) {
            console.error(error)
            alert('Failed to restart resource')
        } finally {
            setLoading(null)
        }
    }

    const handleStop = async () => {
        if (!confirm(`Are you sure you want to stop resource ${vmid}?`)) return
        setLoading('stop')
        try {
            await stopResource(vmid, node, 'ui')
            alert(`Stop triggered for ${vmid}`)
            router.refresh()
        } catch (error) {
            console.error(error)
            alert('Failed to stop resource')
        } finally {
            setLoading(null)
        }
    }

    const handleStart = async () => {
        if (!confirm(`Are you sure you want to start resource ${vmid}?`)) return
        setLoading('start')
        try {
            await startResource(vmid, node, 'ui')
            alert(`Start triggered for ${vmid}`)
            router.refresh()
        } catch (error) {
            console.error(error)
            alert('Failed to start resource')
        } finally {
            setLoading(null)
        }
    }

    return (
        <div className="flex gap-3">
            <Button
                onClick={handleRestart}
                disabled={loading !== null || currentStatus === 'stopped'}
                className="flex-1"
            >
                <RotateCw className="mr-2 h-4 w-4" />
                {loading === 'restart' ? 'Restarting...' : 'Restart'}
            </Button>
            <Button
                onClick={handleStop}
                disabled={loading !== null || currentStatus === 'stopped'}
                variant="destructive"
                className="flex-1"
            >
                <PowerOff className="mr-2 h-4 w-4" />
                {loading === 'stop' ? 'Stopping...' : 'Stop'}
            </Button>
            <Button
                onClick={handleStart}
                disabled={loading !== null || currentStatus === 'running'}
                variant="secondary"
                className="flex-1"
            >
                <Power className="mr-2 h-4 w-4" />
                {loading === 'start' ? 'Starting...' : 'Start'}
            </Button>
        </div>
    )
}

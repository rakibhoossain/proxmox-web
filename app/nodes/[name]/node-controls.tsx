'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Power, PowerOff, RotateCw } from 'lucide-react'
import { restartNode, stopNode, startNode } from '@/app/actions/nodes'
import { useRouter } from 'next/navigation'

interface Props {
    nodeName: string
}

export function NodeControls({ nodeName }: Props) {
    const router = useRouter()
    const [loading, setLoading] = useState<string | null>(null)

    const handleRestart = async () => {
        if (!confirm(`Are you sure you want to restart ${nodeName}?`)) return
        setLoading('restart')
        try {
            await restartNode(nodeName, 'ui')
            alert(`Restart triggered for ${nodeName}`)
            router.refresh()
        } catch (error) {
            console.error(error)
            alert('Failed to restart node')
        } finally {
            setLoading(null)
        }
    }

    const handleStop = async () => {
        if (!confirm(`Are you sure you want to stop ${nodeName}?`)) return
        setLoading('stop')
        try {
            await stopNode(nodeName, 'ui')
            alert(`Stop triggered for ${nodeName}`)
            router.refresh()
        } catch (error) {
            console.error(error)
            alert('Failed to stop node')
        } finally {
            setLoading(null)
        }
    }

    const handleStart = async () => {
        if (!confirm(`Are you sure you want to start ${nodeName}?`)) return
        setLoading('start')
        try {
            await startNode(nodeName, 'ui')
            alert(`Start triggered for ${nodeName}`)
            router.refresh()
        } catch (error) {
            console.error(error)
            alert('Failed to start node')
        } finally {
            setLoading(null)
        }
    }

    return (
        <div className="flex gap-3">
            <Button
                onClick={handleRestart}
                disabled={loading !== null}
                className="flex-1"
            >
                <RotateCw className="mr-2 h-4 w-4" />
                {loading === 'restart' ? 'Restarting...' : 'Restart'}
            </Button>
            <Button
                onClick={handleStop}
                disabled={loading !== null}
                variant="destructive"
                className="flex-1"
            >
                <PowerOff className="mr-2 h-4 w-4" />
                {loading === 'stop' ? 'Stopping...' : 'Stop'}
            </Button>
            <Button
                onClick={handleStart}
                disabled={loading !== null}
                variant="secondary"
                className="flex-1"
            >
                <Power className="mr-2 h-4 w-4" />
                {loading === 'start' ? 'Starting...' : 'Start'}
            </Button>
        </div>
    )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Clock, Package } from 'lucide-react'

interface ContainerService {
    id: number
    vmid: number
    node: string
    service_name: string
    service_type: string
    installed_at: string
}

interface Props {
    services: ContainerService[]
    vmid: number
    node: string
}

export function InstalledServices({ services, vmid, node }: Props) {
    if (!services || services.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Installed Services
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground text-center py-8">
                        No services installed on this container
                    </p>
                </CardContent>
            </Card>
        )
    }

    const getServiceTypeBadge = (type: string) => {
        const variants: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
            grow: { label: 'Grow Blockchain', variant: 'default' },
            connect: { label: 'Connect Blockchain', variant: 'secondary' },
            custom: { label: 'Custom', variant: 'outline' },
        }
        return variants[type] || { label: type, variant: 'outline' }
    }

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr)
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
        const diffDays = Math.floor(diffHours / 24)

        if (diffHours < 1) return 'Just now'
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
        return date.toLocaleDateString()
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Installed Services ({services.length})
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {services.map((service) => {
                        const typeBadge = getServiceTypeBadge(service.service_type)
                        return (
                            <div
                                key={service.id}
                                className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-medium">{service.service_name}</span>
                                        <Badge variant={typeBadge.variant}>{typeBadge.label}</Badge>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Clock className="h-3 w-3" />
                                        <span>Installed {formatDate(service.installed_at)}</span>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    )
}

'use server'

import { getAuthHeaders } from '@/lib/auth'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export interface RestartLog {
    id: number
    vmid: number
    resource_name: string
    node: string
    action: string
    trigger_type: string
    triggered_by: string
    status: string
    error_message?: string
    started_at: string
    completed_at?: string
    duration_seconds?: number
}

export interface SystemStatus {
    total_resources: number
    running_resources: number
    whitelisted_count: number
    last_sync_time: string
    next_restart_time: string
    total_restarts: number
    failed_restarts: number
}

export interface LogsFilter {
    vmid?: number
    resource_name?: string
    node?: string
    action?: string
    trigger_type?: string
    status?: string
    start_date?: string
    end_date?: string
    limit?: number
    offset?: number
}

export async function getLogs(filter: LogsFilter = {}): Promise<RestartLog[]> {
    const authHeaders = getAuthHeaders()

    const params = new URLSearchParams()
    if (filter.vmid) params.append('vmid', filter.vmid.toString())
    if (filter.resource_name) params.append('resource_name', filter.resource_name)
    if (filter.node) params.append('node', filter.node)
    if (filter.action) params.append('action', filter.action)
    if (filter.trigger_type) params.append('trigger_type', filter.trigger_type)
    if (filter.status) params.append('status', filter.status)
    if (filter.start_date) params.append('start_date', filter.start_date)
    if (filter.end_date) params.append('end_date', filter.end_date)
    if (filter.limit) params.append('limit', filter.limit.toString())
    if (filter.offset) params.append('offset', filter.offset.toString())

    const url = `${API_URL}/api/logs${params.toString() ? `?${params.toString()}` : ''}`

    try {
        const res = await fetch(url, {
            headers: authHeaders,
            cache: 'no-store',
        })

        if (!res.ok) {
            throw new Error('Failed to fetch logs')
        }

        return res.json()
    } catch (error) {
        console.error('Error fetching logs:', error)
        return []
    }
}

export async function getSystemStatus(): Promise<SystemStatus | null> {
    const authHeaders = getAuthHeaders()

    try {
        const res = await fetch(`${API_URL}/api/status`, {
            headers: authHeaders,
            cache: 'no-store',
        })

        if (!res.ok) {
            throw new Error('Failed to fetch system status')
        }

        return res.json()
    } catch (error) {
        console.error('Error fetching system status:', error)
        return null
    }
}

'use server'

import { getAuthHeaders } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export interface Resource {
    id: number
    vmid: number
    name: string
    type: 'qemu' | 'lxc'
    node: string
    status: string
    uptime: number
    cpu_usage: number
    memory_used: number
    memory_total: number
    disk_used: number
    disk_total: number
    last_synced_at: string
    created_at: string
    updated_at: string
}

export async function getResources(): Promise<Resource[]> {
    const authHeaders = getAuthHeaders()

    try {
        const res = await fetch(`${API_URL}/api/resources`, {
            headers: authHeaders,
            cache: 'no-store',
        })

        if (!res.ok) {
            throw new Error(`Failed to fetch resources: ${res.statusText}`)
        }

        return res.json()
    } catch (error) {
        console.error('Error fetching resources:', error)
        return []
    }
}

export async function getResourceByVMID(vmid: number, node: string): Promise<Resource | null> {
    const authHeaders = getAuthHeaders()

    try {
        const res = await fetch(`${API_URL}/api/resources/${vmid}?node=${node}`, {
            headers: authHeaders,
            cache: 'no-store',
        })

        if (!res.ok) {
            if (res.status === 404) return null
            throw new Error(`Failed to fetch resource: ${res.statusText}`)
        }

        return res.json()
    } catch (error) {
        console.error('Error fetching resource:', error)
        return null
    }
}

export async function restartResource(vmid: number, node: string, triggeredBy: string = 'dashboard') {
    const authHeaders = getAuthHeaders()

    try {
        const res = await fetch(`${API_URL}/api/resources/${vmid}/restart?node=${node}`, {
            method: 'POST',
            headers: {
                ...authHeaders,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ triggered_by: triggeredBy }),
        })

        if (!res.ok) {
            const error = await res.json()
            throw new Error(error.error || 'Failed to restart resource')
        }

        revalidatePath('/')
        return { success: true }
    } catch (error: any) {
        console.error('Error restarting resource:', error)
        return { success: false, error: error.message }
    }
}

export async function stopResource(vmid: number, node: string, triggeredBy: string = 'dashboard') {
    const authHeaders = getAuthHeaders()

    try {
        const res = await fetch(`${API_URL}/api/resources/${vmid}/stop?node=${node}`, {
            method: 'POST',
            headers: {
                ...authHeaders,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ triggered_by: triggeredBy }),
        })

        if (!res.ok) {
            const error = await res.json()
            throw new Error(error.error || 'Failed to stop resource')
        }

        revalidatePath('/')
        return { success: true }
    } catch (error: any) {
        console.error('Error stopping resource:', error)
        return { success: false, error: error.message }
    }
}

export async function startResource(vmid: number, node: string, triggeredBy: string = 'dashboard') {
    const authHeaders = getAuthHeaders()

    try {
        const res = await fetch(`${API_URL}/api/resources/${vmid}/start?node=${node}`, {
            method: 'POST',
            headers: {
                ...authHeaders,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ triggered_by: triggeredBy }),
        })

        if (!res.ok) {
            const error = await res.json()
            throw new Error(error.error || 'Failed to start resource')
        }

        revalidatePath('/')
        return { success: true }
    } catch (error: any) {
        console.error('Error starting resource:', error)
        return { success: false, error: error.message }
    }
}

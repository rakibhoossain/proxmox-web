'use server'

import { getAuthHeaders } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export interface WhitelistEntry {
    id: number
    vmid: number
    resource_name: string
    node: string
    enabled: boolean
    created_at: string
    created_by: string
    notes: string
}

export async function getWhitelist(): Promise<WhitelistEntry[]> {
    const authHeaders = getAuthHeaders()

    try {
        const res = await fetch(`${API_URL}/api/whitelist`, {
            headers: authHeaders,
            cache: 'no-store',
        })

        if (!res.ok) {
            throw new Error('Failed to fetch whitelist')
        }

        return res.json()
    } catch (error) {
        console.error('Error fetching whitelist:', error)
        return []
    }
}

export async function addToWhitelist(vmid: number, resourceName: string, node: string, notes: string = '') {
    const authHeaders = getAuthHeaders()

    try {
        const res = await fetch(`${API_URL}/api/whitelist`, {
            method: 'POST',
            headers: {
                ...authHeaders,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                vmid,
                resource_name: resourceName,
                node,
                created_by: 'dashboard',
                notes,
            }),
        })

        if (!res.ok) {
            const error = await res.json()
            throw new Error(error.error || 'Failed to add to whitelist')
        }

        revalidatePath('/whitelist')
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

export async function updateWhitelist(id: number, enabled: boolean, notes: string) {
    const authHeaders = getAuthHeaders()

    try {
        const res = await fetch(`${API_URL}/api/whitelist/${id}`, {
            method: 'PUT',
            headers: {
                ...authHeaders,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ enabled, notes }),
        })

        if (!res.ok) {
            const error = await res.json()
            throw new Error(error.error || 'Failed to update whitelist')
        }

        revalidatePath('/whitelist')
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

export async function deleteFromWhitelist(id: number) {
    const authHeaders = getAuthHeaders()

    try {
        const res = await fetch(`${API_URL}/api/whitelist/${id}`, {
            method: 'DELETE',
            headers: authHeaders,
        })

        if (!res.ok) {
            const error = await res.json()
            throw new Error(error.error || 'Failed to delete from whitelist')
        }

        revalidatePath('/whitelist')
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

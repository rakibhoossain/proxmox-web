'use server'

import { getAuthHeaders } from '@/lib/auth'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export async function getContainerServices(vmid: number, node: string) {
    const authHeaders = getAuthHeaders()

    try {
        const res = await fetch(`${API_URL}/api/containers/${vmid}/services?node=${node}`, {
            headers: authHeaders,
            cache: 'no-store',
        })

        if (!res.ok) {
            return []
        }

        return await res.json()
    } catch (error) {
        console.error('Error fetching services:', error)
        return []
    }
}

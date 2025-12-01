'use server'

import { getAuthHeaders } from '@/lib/auth'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export async function getSuggestedVMID(): Promise<number> {
    const authHeaders = getAuthHeaders()

    try {
        const res = await fetch(`${API_URL}/api/containers/next-vmid`, {
            headers: authHeaders,
            cache: 'no-store',
        })

        if (!res.ok) {
            return 201 // Default fallback
        }

        const data = await res.json()
        return data.suggested_vmid || 201
    } catch (error) {
        console.error('Error fetching suggested VMID:', error)
        return 201 // Default fallback
    }
}

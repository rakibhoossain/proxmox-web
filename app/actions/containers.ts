'use server'

import { getAuthHeaders } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export async function cloneContainer(
    sourceVMID: number,
    newVMID: number,
    targetNode: string,
    hostname?: string
) {
    const authHeaders = getAuthHeaders()

    try {
        const res = await fetch(`${API_URL}/api/containers/clone`, {
            method: 'POST',
            headers: {
                ...authHeaders,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                source_vmid: sourceVMID,
                new_vmid: newVMID,
                target_node: targetNode,
                hostname: hostname || '',
            }),
        })

        if (!res.ok) {
            const error = await res.json()
            throw new Error(error.error || 'Failed to clone container')
        }

        revalidatePath('/')
        return { success: true }
    } catch (error: any) {
        console.error('Error cloning container:', error)
        return { success: false, error: error.message }
    }
}

export async function deleteContainer(vmid: number, node: string) {
    const authHeaders = getAuthHeaders()

    try {
        const res = await fetch(`${API_URL}/api/containers/${vmid}?node=${node}`, {
            method: 'DELETE',
            headers: authHeaders,
        })

        if (!res.ok) {
            const error = await res.json()
            throw new Error(error.error || 'Failed to delete container')
        }

        revalidatePath('/')
        return { success: true }
    } catch (error: any) {
        console.error('Error deleting container:', error)
        return { success: false, error: error.message }
    }
}

export async function deployBlockchainNode(
    sourceVMID: number,
    newVMID: number,
    targetNode: string,
    commands: string[],
    hostname?: string
) {
    const authHeaders = getAuthHeaders()

    try {
        const res = await fetch(`${API_URL}/api/containers/deploy-node`, {
            method: 'POST',
            headers: {
                ...authHeaders,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                source_vmid: sourceVMID,
                new_vmid: newVMID,
                target_node: targetNode,
                hostname: hostname || '',
                commands,
            }),
        })

        if (!res.ok) {
            const error = await res.json()
            throw new Error(error.error || 'Failed to deploy blockchain node')
        }

        revalidatePath('/')
        revalidatePath('/logs')
        return { success: true }
    } catch (error: any) {
        console.error('Error deploying blockchain node:', error)
        return { success: false, error: error.message }
    }
}

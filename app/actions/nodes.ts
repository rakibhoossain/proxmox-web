'use server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
const AUTH_USERNAME = process.env.AUTH_USERNAME || 'admin'
const AUTH_PASSWORD = process.env.AUTH_PASSWORD || 'proxmox2024'

// Helper to get auth headers
function getAuthHeaders() {
  const credentials = Buffer.from(`${AUTH_USERNAME}:${AUTH_PASSWORD}`).toString('base64')
  return {
    'Authorization': `Basic ${credentials}`,
    'Content-Type': 'application/json',
  }
}

export interface Node {
  id: number
  node_name: string
  status: string
  uptime: number
  cpu_usage: number
  memory_used: number
  memory_total: number
  last_synced_at: string
  created_at: string
  updated_at: string
}

export async function getNodes(): Promise<Node[]> {
  try {
    const res = await fetch(`${API_URL}/api/nodes`, {
      cache: 'no-store',
      headers: getAuthHeaders()
    })
    if (!res.ok) throw new Error('Failed to fetch nodes')
    return await res.json()
  } catch (error) {
    console.error('Error fetching nodes:', error)
    return []
  }
}

export async function getNode(nodeName: string): Promise<Node | null> {
  try {
    const res = await fetch(`${API_URL}/api/nodes/${nodeName}`, {
      cache: 'no-store',
      headers: getAuthHeaders()
    })
    if (!res.ok) return null
    return await res.json()
  } catch (error) {
    console.error(`Error fetching node ${nodeName}:`, error)
    return null
  }
}

export async function restartNode(nodeName: string, triggeredBy: string = 'ui') {
  const res = await fetch(`${API_URL}/api/nodes/${nodeName}/restart`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ triggered_by: triggeredBy }),
  })
  if (!res.ok) throw new Error('Failed to restart node')
  return await res.json()
}

export async function stopNode(nodeName: string, triggeredBy: string = 'ui') {
  const res = await fetch(`${API_URL}/api/nodes/${nodeName}/stop`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ triggered_by: triggeredBy }),
  })
  if (!res.ok) throw new Error('Failed to stop node')
  return await res.json()
}

export async function startNode(nodeName: string, triggeredBy: string = 'ui') {
  const res = await fetch(`${API_URL}/api/nodes/${nodeName}/start`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ triggered_by: triggeredBy }),
  })
  if (!res.ok) throw new Error('Failed to start node')
  return await res.json()
}

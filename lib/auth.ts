export function getAuthHeaders() {
    const username = process.env.AUTH_USERNAME || 'admin'
    const password = process.env.AUTH_PASSWORD || 'proxmox2024'
    const auth = Buffer.from(`${username}:${password}`).toString('base64')

    return {
        'Authorization': `Basic ${auth}`,
    }
}

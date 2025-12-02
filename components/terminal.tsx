'use client'

import { useEffect, useRef, useState } from 'react'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import 'xterm/css/xterm.css'

interface TerminalProps {
    vmid: number
    node: string
    type: 'lxc' | 'qemu'
    username: string
    password: string
}

export function TerminalComponent({ vmid, node, type, username, password }: TerminalProps) {
    const terminalRef = useRef<HTMLDivElement>(null)
    const xtermRef = useRef<Terminal | null>(null)
    const wsRef = useRef<WebSocket | null>(null)
    const fitAddonRef = useRef<FitAddon | null>(null)
    const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('connecting')
    const mountedRef = useRef(false)

    useEffect(() => {
        // Prevent double initialization in React Strict Mode
        if (mountedRef.current) return
        mountedRef.current = true

        if (!terminalRef.current) return

        let term: Terminal | null = null
        let ws: WebSocket | null = null
        let fitAddon: FitAddon | null = null

        // Small delay to ensure DOM is ready
        const initTimeout = setTimeout(() => {
            if (!terminalRef.current) return

            // Create terminal
            term = new Terminal({
                cursorBlink: true,
                fontSize: 14,
                fontFamily: 'Menlo, Monaco, "Courier New", monospace',
                theme: {
                    background: '#1e1e1e',
                    foreground: '#d4d4d4',
                },
            })

            fitAddon = new FitAddon()
            term.loadAddon(fitAddon)

            try {
                term.open(terminalRef.current)
                fitAddon.fit()
            } catch (error) {
                console.error('Failed to initialize terminal:', error)
                return
            }

            xtermRef.current = term
            fitAddonRef.current = fitAddon

            // Connect WebSocket
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
            const wsUrl = apiUrl.replace('http', 'ws')

            // Get auth credentials (same as used for HTTP requests)
            // const username = 'admin' // TODO: Get from env or context
            // const password = 'proxmox2024' // TODO: Get from env or context

            ws = new WebSocket(`${wsUrl}/api/ws/terminal?vmid=${vmid}&node=${node}&type=${type}&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`)
            wsRef.current = ws

            ws.onopen = () => {
                setStatus('connected')
                if (term) {
                    term.writeln('\x1b[1;32mTerminal session started\x1b[0m')
                    term.writeln('')
                }
            }

            ws.onmessage = (event) => {
                if (!term) return
                if (event.data instanceof Blob) {
                    event.data.arrayBuffer().then((buffer) => {
                        if (term) {
                            term.write(new Uint8Array(buffer))
                        }
                    })
                } else {
                    term.write(event.data)
                }
            }

            ws.onerror = (error) => {
                console.error('WebSocket error:', error)
                setStatus('error')
                if (term) {
                    term.writeln('\x1b[1;31mConnection error\x1b[0m')
                }
            }

            ws.onclose = () => {
                setStatus('disconnected')
                if (term) {
                    term.writeln('\x1b[1;33m\r\nConnection closed\x1b[0m')
                }
            }

            // Handle terminal input
            term.onData((data) => {
                if (ws && ws.readyState === WebSocket.OPEN) {
                    ws.send(data)
                }
            })

            // Handle resize
            const handleResize = () => {
                if (fitAddon) {
                    try {
                        fitAddon.fit()
                    } catch (error) {
                        // Ignore resize errors during cleanup
                    }
                }
            }
            window.addEventListener('resize', handleResize)

            // Store cleanup function
            return () => {
                window.removeEventListener('resize', handleResize)
                if (ws) {
                    ws.close()
                }
                if (term) {
                    term.dispose()
                }
            }
        }, 100)

        // Cleanup
        return () => {
            clearTimeout(initTimeout)
            if (ws) {
                ws.close()
            }
            if (term) {
                term.dispose()
            }
            mountedRef.current = false
        }
    }, [vmid, node, type])

    return (
        <div className="relative">
            <div className="absolute top-2 right-2 z-10">
                <div className={`px-2 py-1 rounded text-xs font-medium ${status === 'connected' ? 'bg-green-500 text-white' :
                    status === 'connecting' ? 'bg-yellow-500 text-white' :
                        status === 'error' ? 'bg-red-500 text-white' :
                            'bg-gray-500 text-white'
                    }`}>
                    {status}
                </div>
            </div>
            <div
                ref={terminalRef}
                className="w-full h-[500px] bg-[#1e1e1e] rounded-lg overflow-hidden"
            />
        </div>
    )
}

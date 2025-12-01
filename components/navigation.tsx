'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'
import { LogOut } from 'lucide-react'

export function Navigation() {
    const pathname = usePathname()
    const { logout } = useAuth()

    return (
        <div className="flex gap-4 items-center">
            <Link href="/">
                <Button variant={pathname === '/' ? 'default' : 'outline'}>
                    Resources
                </Button>
            </Link>
            <Link href="/whitelist">
                <Button variant={pathname === '/whitelist' ? 'default' : 'outline'}>
                    Whitelist
                </Button>
            </Link>
            <Link href="/logs">
                <Button variant={pathname === '/logs' ? 'default' : 'outline'}>
                    Logs
                </Button>
            </Link>
            <Link href="/deploy">
                <Button variant={pathname === '/deploy' ? 'default' : 'outline'}>
                    Deploy
                </Button>
            </Link>
            <div className="flex-1" />
            <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="ml-auto"
            >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
            </Button>
        </div>
    )
}

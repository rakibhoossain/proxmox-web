'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface AuthContextType {
    isAuthenticated: boolean
    login: (username: string, password: string) => boolean
    logout: () => void
    isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        // Check if user is already logged in
        const authToken = localStorage.getItem('proxmox_auth_token')
        if (authToken) {
            setIsAuthenticated(true)
        }
        setIsLoading(false)
    }, [])

    const login = (username: string, password: string) => {
        // Use hardcoded credentials for simplicity
        const validUsername = 'admin'
        const validPassword = 'ItopVms'

        if (username === validUsername && password === validPassword) {
            // Store simple auth flag
            localStorage.setItem('proxmox_auth_token', 'authenticated')
            setIsAuthenticated(true)
            return true
        }
        return false
    }

    const logout = () => {
        localStorage.removeItem('proxmox_auth_token')
        setIsAuthenticated(false)
        router.push('/login')
    }

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

export function getAuthToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('proxmox_auth_token')
}

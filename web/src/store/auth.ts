import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface AuthState {
    token: string | null
    isAuthenticated: boolean
    isAuthenticating: boolean
    userType: 'admin' | 'regular' | null
    balance: number | null
    login: (token: string, userType: 'admin' | 'regular', balance?: number) => void
    logout: () => void
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            token: null,
            isAuthenticated: false,
            isAuthenticating: false,
            userType: null,
            balance: null,

            login: (token: string, userType: 'admin' | 'regular', balance?: number) => {
                set({
                    token,
                    isAuthenticated: true,
                    userType,
                    balance: balance ?? null,
                })
            },

            logout: () => {
                set({
                    token: null,
                    isAuthenticated: false,
                    userType: null,
                    balance: null,
                })
            },

            setToken: (token: string) => {
                set({
                    token,
                })
            },
        }),
        {
            name: 'auth-storage',
            // Only persist these fields
            partialize: (state) => ({
                token: state.token,
                isAuthenticated: state.isAuthenticated,
                userType: state.userType,
                balance: state.balance,
            }),
        }
    )
)

export default useAuthStore 
// src/feature/auth/hooks.ts
import { useMutation } from '@tanstack/react-query'
import { useNavigate, useLocation } from 'react-router'
import { authApi } from '@/api/services'
import { useAuthStore } from '@/store/auth'
import { toast } from 'sonner'
import { ApiError } from '@/api/index'

export function useLoginMutation() {
    const navigate = useNavigate()
    const location = useLocation()
    const { login } = useAuthStore()

    // get redirect url from location
    const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/'

    return useMutation({
        mutationFn: async (token: string) => {
            // Call new login endpoint
            const result = await authApi.login(token)
            return { token, result }
        },
        onSuccess: ({ token, result }) => {
            // login success, save token with user type and balance
            login(token, result.user_type, result.balance)
            toast.success('Login successful')
            // redirect to previous page or home page
            navigate(from, { replace: true })
        },
        onError: (error: unknown) => {
            if (error instanceof ApiError) {
                if (error.code === 401) {
                    toast.error('Invalid token, please try again')
                } else {
                    toast.error(`API error (${error.code}): ${error.message}`)
                }
            } else {
                toast.error('Login failed, please retry')
            }
        }
    })
}
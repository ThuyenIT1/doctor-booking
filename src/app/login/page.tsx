'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { signup } from '@/app/auth/actions'
import { useFormStatus } from 'react-dom'

// A new component for the submit button that uses useFormStatus for server actions
function SignUpSubmitButton({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { pending } = useFormStatus()

  return (
    <button {...props} disabled={pending} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
      {pending ? 'Đang xử lý...' : children}
    </button>
  )
}

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  // State for client-side login form
  const [loginError, setLoginError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setLoginError(null)

    const formData = new FormData(event.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      if (error.message === 'Email not confirmed') {
        setLoginError('Email chưa được xác nhận. Vui lòng kiểm tra hộp thư của bạn.');
      } else {
        setLoginError('Email hoặc mật khẩu không đúng. Vui lòng thử lại.');
      }
      setLoading(false);
      return;
    }

    // On successful login, redirect to home and refresh the page to update server components
    router.push('/')
    router.refresh()
  }

  // Clear errors when switching tabs
  const handleTabChange = (isSigningUp: boolean) => {
    setLoginError(null)
    // To clear server-side messages from URL, we can manipulate the URL without reloading
    router.replace('/login', { scroll: false })
    setIsSignUp(isSigningUp)
  }

  const error = searchParams.get('error')
  const success = searchParams.get('success')

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg">
        {/* Tab buttons */}
        <div className="flex border-b mb-6">
          <button
            onClick={() => handleTabChange(false)}
            className={`w-1/2 py-3 font-semibold text-center transition-colors ${
              !isSignUp
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Đăng nhập
          </button>
          <button
            onClick={() => handleTabChange(true)}
            className={`w-1/2 py-3 font-semibold text-center transition-colors ${
              isSignUp
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Đăng ký
          </button>
        </div>

        {/* Display server-side messages (for signup) */}
        {isSignUp && error && (
          <p className="p-3 text-center text-red-800 bg-red-100 rounded-md">{error}</p>
        )}
        {success && (
          <p className="p-3 text-center text-green-800 bg-green-100 rounded-md">{success}</p>
        )}
        {/* Display client-side errors (for login) */}
        {!isSignUp && loginError && (
          <p className="p-3 text-center text-red-800 bg-red-100 rounded-md">{loginError}</p>
        )}

        {isSignUp ? (
          <form action={signup} className="space-y-6">
            <h2 className="text-xl font-semibold text-center text-gray-800">Tạo tài khoản mới</h2>
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Họ và Tên</label>
              <input id="fullName" name="fullName" type="text" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">Số điện thoại</label>
              <input id="phoneNumber" name="phoneNumber" type="tel" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Địa chỉ email</label>
              <input id="email" name="email" type="email" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Mật khẩu</label>
              <input id="password" name="password" type="password" required minLength={6} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <SignUpSubmitButton type="submit">Đăng ký</SignUpSubmitButton>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="space-y-6">
            <h2 className="text-xl font-semibold text-center text-gray-800">Đăng nhập vào tài khoản</h2>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Địa chỉ email</label>
              <input id="email" name="email" type="email" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Mật khẩu</label>
              <input id="password" name="password" type="password" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
              {loading ? 'Đang xử lý...' : 'Đăng nhập'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

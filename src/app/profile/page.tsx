'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { updateProfile } from '@/app/auth/actions'
import type { User } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'

type Profile = {
  full_name: string | null
  phone_number: string | null
  updated_at: string | null
}

export default function ProfilePage() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [message, setMessage] = useState<{ type?: 'success' | 'error'; content?: string }>({})

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching profile:', error)
          setMessage({ type: 'error', content: 'Lỗi tải hồ sơ.' })
        } else {
          setProfile(data)
        }
      } else {
        // If no user, redirect to login
        router.push('/login')
      }
      setLoading(false)
    }

    fetchUserAndProfile()
  }, [router, supabase])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setMessage({})

    const formData = new FormData(event.currentTarget)
    const result = await updateProfile(formData)

    if (result.success) {
      setMessage({ type: 'success', content: result.message })
      // Refresh server components
      router.refresh()
    } else {
      setMessage({ type: 'error', content: result.message })
    }
    setLoading(false)
  }

  if (loading && !profile) {
    return <p className="text-center py-8">Đang tải hồ sơ của bạn...</p>
  }

  if (!user) {
    return null // Or a loading spinner, as the redirect will happen shortly
  }

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4 md:px-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Hồ sơ của tôi</h1>
      </div>
      
      {message.content && (
        <div className={`p-4 mb-6 text-center rounded-lg border ${
          message.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {message.content}
        </div>
      )}

      <div className="bg-white rounded-lg border shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="text"
                value={user.email || ''}
                disabled
                className="w-full px-3 py-2 bg-gray-50 border rounded-md text-gray-500"
              />
            </div>

            <div>
              <label htmlFor="id" className="block text-sm font-medium mb-1.5">
                ID Người dùng
              </label>
              <input
                id="id"
                type="text"
                value={user.id}
                disabled
                className="w-full px-3 py-2 bg-gray-50 border rounded-md text-gray-500"
              />
            </div>

            <div>
              <label htmlFor="fullName" className="block text-sm font-medium mb-1.5">
                Họ và Tên
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                defaultValue={profile?.full_name || ''}
                className="w-full px-3 py-2 border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium mb-1.5">
                Số điện thoại
              </label>
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="text"
                defaultValue={profile?.phone_number || ''}
                className="w-full px-3 py-2 border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="updated_at" className="block text-sm font-medium mb-1.5">
                Cập nhật lần cuối
              </label>
              <input
                id="updated_at"
                type="text"
                value={profile?.updated_at ? new Date(profile.updated_at).toLocaleString('vi-VN') : 'Chưa có'}
                disabled
                className="w-full px-3 py-2 bg-gray-50 border rounded-md text-gray-500"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Đang cập nhật...' : 'Cập nhật Hồ sơ'}
          </Button>
        </form>
      </div>
    </div>
  )
}
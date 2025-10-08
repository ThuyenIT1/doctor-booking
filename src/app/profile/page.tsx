'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { updateProfile } from '@/app/auth/actions'
import type { User } from '@supabase/supabase-js'

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
    return <p>Đang tải hồ sơ của bạn...</p>
  }

  if (!user) {
    return null // Or a loading spinner, as the redirect will happen shortly
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-6">Hồ sơ của bạn</h1>
      
      {message.content && (
        <p className={`p-4 mb-4 text-center rounded-md ${message.type === 'success' ? 'text-green-800 bg-green-100' : 'text-red-800 bg-red-100'}`}>
          {message.content}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
          <input id="email" type="text" value={user.email || ''} disabled className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm sm:text-sm" />
        </div>

        <div>
          <label htmlFor="id" className="block text-sm font-medium text-gray-700">ID Người dùng</label>
          <input id="id" type="text" value={user.id} disabled className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm sm:text-sm" />
        </div>

        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Họ và Tên</label>
          <input id="fullName" name="fullName" type="text" defaultValue={profile?.full_name || ''} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
        </div>

        <div>
          <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">Số điện thoại</label>
          <input id="phoneNumber" name="phoneNumber" type="text" defaultValue={profile?.phone_number || ''} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
        </div>

        <div>
          <label htmlFor="updated_at" className="block text-sm font-medium text-gray-700">Cập nhật lần cuối</label>
          <input id="updated_at" type="text" value={profile?.updated_at ? new Date(profile.updated_at).toLocaleString('vi-VN') : 'Chưa có'} disabled className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm sm:text-sm" />
        </div>

        <div>
          <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
            {loading ? 'Đang cập nhật...' : 'Cập nhật Hồ sơ'}
          </button>
        </div>
      </form>
    </div>
  )
}
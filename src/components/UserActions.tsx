'use client'

import Link from 'next/link'
import { useFormStatus } from 'react-dom'
import { logout } from '@/app/auth/actions'

function LogoutButton() {
  const { pending } = useFormStatus()

  return (
    <button className="py-2 px-4 rounded-md no-underline bg-gray-200 hover:bg-gray-300 disabled:bg-gray-400 disabled:cursor-not-allowed" disabled={pending}>
      {pending ? 'Đang đăng xuất...' : 'Đăng xuất'}
    </button>
  )
}

export default function UserActions({ displayName }: { displayName: string }) {
  return (
    <div className="flex items-center gap-4">
      <span className="hidden sm:inline">Chào, {displayName}!</span>
      <Link href="/profile" className="py-2 px-4 rounded-md no-underline bg-blue-600 text-white hover:bg-blue-700">
        Hồ sơ
      </Link>
      <form action={logout}>
        <LogoutButton />
      </form>
    </div>
  )
}

'use client'

import Link from 'next/link'
import { useFormStatus, useFormState } from 'react-dom'
import { logout } from '@/app/auth/actions'
import { Button } from './ui/button'

function LogoutButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" variant="outline" disabled={pending}>
      {pending ? 'Đang đăng xuất...' : 'Đăng xuất'}
    </Button>
  )
}

export default function UserActions({ displayName }: { displayName: string }) {
  return (
    <div className="flex items-center gap-4">
      <span className="hidden sm:inline text-sm font-medium">Chào, {displayName}!</span>
      <Button asChild>
        <Link href="/profile">Hồ sơ</Link>
      </Button>
      <Button asChild variant="outline">
        <Link href="/my-appointments">Lịch hẹn</Link>
      </Button>
      <form action={logout}>
        <LogoutButton />
      </form>
    </div>
  )
}

import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import UserActions from './UserActions' // Import the new client component
import { Button } from './ui/button' // Import the new Button

export default async function AuthButton() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let profile = null;
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();
    profile = data;
  }

  const displayName = profile?.full_name || user?.email || 'Người dùng';

  return user ? (
    <UserActions displayName={displayName} />
  ) : (
    <Button asChild>
      <Link href="/login">Đăng nhập</Link>
    </Button>
  )
}

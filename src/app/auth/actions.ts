'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function logout() {
  const supabase = createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}

export async function updateProfile(formData: FormData) {
  'use server'

  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, message: 'Người dùng không được xác thực' }
  }

  const fullName = formData.get('fullName') as string
  const phoneNumber = formData.get('phoneNumber') as string

  const { error } = await supabase.from('profiles').update({
    full_name: fullName,
    phone_number: phoneNumber,
    updated_at: new Date().toISOString(),
  }).eq('id', user.id)

  if (error) {
    console.error('Error updating profile:', error)
    return { success: false, message: 'Không thể cập nhật hồ sơ' }
  }

  revalidatePath('/profile')
  return { success: true, message: 'Hồ sơ đã được cập nhật thành công' }
}

export async function signup(formData: FormData) {
  'use server'

  const supabase = createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string
  const phoneNumber = formData.get('phoneNumber') as string

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone_number: phoneNumber,
      },
    },
  })

  if (error) {
    console.error('Error signing up:', error)
    return redirect('/login?error=Không thể xác thực người dùng')
  }

  // Redirect to a page that tells the user to check their email
  return redirect('/login?success=Kiểm tra email để tiếp tục quá trình đăng nhập')
}

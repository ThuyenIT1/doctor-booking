'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { cancelAppointment } from './actions'

export function CancelAppointmentDialog({ appointmentId }: { appointmentId: number }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  async function handleCancel() {
    try {
      setIsLoading(true)
      const result = await cancelAppointment(appointmentId)
      
      if (result.success) {
        setIsOpen(false)
        // Force a hard refresh of the page
        router.refresh()
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error)
      alert('Có lỗi xảy ra khi hủy lịch hẹn. Vui lòng thử lại.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className="w-full">
          Hủy lịch hẹn
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Bạn có chắc chắn muốn hủy lịch hẹn này?</AlertDialogTitle>
          <AlertDialogDescription>
            Hành động này không thể hoàn tác. Lịch hẹn sẽ bị xóa khỏi hệ thống.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Không, giữ lại</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleCancel} 
            className="bg-red-500 hover:bg-red-600"
            disabled={isLoading}
          >
            {isLoading ? 'Đang hủy...' : 'Có, hủy lịch hẹn'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
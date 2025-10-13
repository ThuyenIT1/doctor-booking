'use server'

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function cancelAppointment(appointmentId: number) {
  console.log('Starting cancelAppointment with appointmentId:', appointmentId);
  const supabase = createClient();

  try {
    // 1. Lấy thông tin appointment để lấy schedule_id
    const { data: appointment, error: fetchError } = await supabase
      .from('appointments')
      .select('id, schedule_id')
      .eq('id', appointmentId)
      .single();

    if (fetchError || !appointment) {
      console.error('Error fetching appointment:', fetchError);
      throw new Error('Không thể tìm thấy lịch hẹn');
    }

    console.log('Found appointment:', appointment);

    // 2. Gọi stored procedure để hủy lịch hẹn
    const { data, error: cancelError } = await supabase
      .rpc('cancel_appointment', {
        p_appointment_id: appointmentId,
        p_schedule_id: appointment.schedule_id
      });

    if (cancelError) {
      console.error('Error cancelling appointment:', cancelError);
      throw new Error('Không thể hủy lịch hẹn');
    }

    console.log('Cancel appointment result:', data);

    // 3. Kiểm tra trạng thái cuối cùng
    const { data: finalCheck, error: checkError } = await supabase
      .from('schedules')
      .select('is_booked')
      .eq('id', appointment.schedule_id)
      .single();

    console.log('Final schedule state:', finalCheck);

    revalidatePath('/my-appointments');
    return { success: true };

  } catch (error) {
    console.error('Error in cancelAppointment:', error);
    throw error;
  }
}
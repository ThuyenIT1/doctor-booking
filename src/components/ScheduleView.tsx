'use client'

import { createClient } from '@/utils/supabase/client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Define types for clarity
type Schedule = {
  id: number;
  start_time: string;
  end_time: string;
};

type User = {
  id: string;
};

export default function ScheduleView({ doctorId }: { doctorId: number }) {
  const supabase = createClient()
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [message, setMessage] = useState('');
  const [bookedScheduleIds, setBookedScheduleIds] = useState<number[]>([]);
  const router = useRouter();

  useEffect(() => {
    // Fetch available schedules
    const fetchSchedules = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('schedules')
        .select('id, start_time, end_time')
        .eq('doctor_id', doctorId)
        .eq('is_booked', false)
        .order('start_time', { ascending: true });

      if (error) {
        console.error('Error fetching schedules:', error);
        setMessage('Lỗi tải lịch làm việc.');
      } else {
        setSchedules(data);
      }
      setLoading(false);
    };

    // Check for logged in user
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user as User | null);
    };

    fetchSchedules();
    checkUser();
  }, [doctorId, supabase]);

  const handleBooking = async (scheduleId: number) => {
    if (!user) {
      setMessage('Vui lòng đăng nhập để đặt lịch.');
      // Optional: redirect to login after a delay
      setTimeout(() => router.push('/login'), 2000);
      return;
    }

    setMessage('Đang xử lý...');

    // Insert the new appointment
    const { error } = await supabase.from('appointments').insert({
      patient_id: user.id,
      schedule_id: scheduleId,
    });

    if (error) {
      console.error('Error creating appointment:', error);
      // This can happen if the slot was booked by someone else simultaneously
      if (error.code === '23505') { // Unique constraint violation
        setMessage('Rất tiếc, khung giờ này vừa được người khác đặt. Vui lòng chọn khung giờ khác.');
        // Refetch schedules to get the latest availability
        const { data } = await supabase
          .from('schedules')
          .select('id, start_time, end_time')
          .eq('doctor_id', doctorId)
          .eq('is_booked', false)
          .order('start_time', { ascending: true });
        setSchedules(data || []);
      } else {
        setMessage('Đã có lỗi xảy ra. Vui lòng thử lại.');
      }
    } else {
      setMessage('Đặt lịch thành công! Cảm ơn bạn.');
      // Add the successfully booked schedule to the booked list
      setBookedScheduleIds(prev => [...prev, scheduleId]);
    }
  };

  if (loading) {
    return <p>Đang tải lịch làm việc...</p>;
  }

  return (
    <div>
      {message && <p className={`text-center font-semibold p-3 rounded-md mb-4 ${message.includes('thành công') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{message}</p>}
      {schedules.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {schedules.map(schedule => {
            const isBooked = bookedScheduleIds.includes(schedule.id);
            return (
              <button
                key={schedule.id}
                onClick={() => handleBooking(schedule.id)}
                className={`p-4 border rounded-lg text-center transition-colors ${
                  isBooked
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
                disabled={isBooked || (!!message && message.includes('Đang xử lý'))}
              >
                <p className="font-bold">{new Date(schedule.start_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</p>
                <p className="text-sm">{new Date(schedule.start_time).toLocaleDateString('vi-VN')}</p>
              </button>
            )
          })}
        </div>
      ) : (
        <p className="text-gray-500">Bác sĩ này hiện không có lịch làm việc nào.
        Vui lòng thêm lịch trong bảng &apos;schedules&apos; trên Supabase.</p>
      )}
    </div>
  );
}

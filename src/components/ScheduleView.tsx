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

type Doctor = {
  name: string;
}

type GroupedSchedules = {
  [date: string]: Schedule[];
};

export default function ScheduleView({ doctorId }: { doctorId: number }) {
  const supabase = createClient()
  const [groupedSchedules, setGroupedSchedules] = useState<GroupedSchedules>({});
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [message, setMessage] = useState('');
  const [bookedScheduleIds, setBookedScheduleIds] = useState<number[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchDoctorAndSchedules = async () => {
      setLoading(true);

      // Fetch doctor's name
      const { data: doctorData, error: doctorError } = await supabase
        .from('doctors')
        .select('name')
        .eq('id', doctorId)
        .single();

      if (doctorError) {
        console.error('Error fetching doctor:', doctorError);
        setMessage('Không tìm thấy thông tin bác sĩ.');
      } else {
        setDoctor(doctorData);
      }

      // Fetch available schedules
      const { data: schedulesData, error: schedulesError } = await supabase
        .from('schedules')
        .select('id, start_time, end_time')
        .eq('doctor_id', doctorId)
        .eq('is_booked', false)
        .order('start_time', { ascending: true });

      if (schedulesError) {
        console.error('Error fetching schedules:', schedulesError);
        setMessage('Lỗi tải lịch làm việc.');
      } else {
        // Group schedules by date
        const grouped = schedulesData.reduce((acc: GroupedSchedules, schedule) => {
          const date = new Date(schedule.start_time).toLocaleDateString('vi-VN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
          if (!acc[date]) {
            acc[date] = [];
          }
          acc[date].push(schedule);
          return acc;
        }, {});
        setGroupedSchedules(grouped);
      }
      setLoading(false);
    };

    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user as User | null);
    };

    fetchDoctorAndSchedules();
    checkUser();
  }, [doctorId, supabase]);

  const handleBooking = async (scheduleId: number) => {
    if (!user) {
      setMessage('Vui lòng đăng nhập để đặt lịch.');
      setTimeout(() => router.push('/login'), 2000);
      return;
    }

    setMessage('Đang xử lý...');

    const { error } = await supabase.from('appointments').insert({
      patient_id: user.id,
      schedule_id: scheduleId,
    });

    if (error) {
      console.error('Error creating appointment:', error);
      if (error.code === '23505') {
        setMessage('Rất tiếc, khung giờ này vừa được người khác đặt. Vui lòng chọn khung giờ khác.');
        // Refetch schedules to update UI
        const { data: schedulesData } = await supabase
          .from('schedules')
          .select('id, start_time, end_time')
          .eq('doctor_id', doctorId)
          .eq('is_booked', false)
          .order('start_time', { ascending: true });
        
        const grouped = (schedulesData || []).reduce((acc: GroupedSchedules, schedule) => {
          const date = new Date(schedule.start_time).toLocaleDateString('vi-VN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
          if (!acc[date]) {
            acc[date] = [];
          }
          acc[date].push(schedule);
          return acc;
        }, {});
        setGroupedSchedules(grouped);

      } else {
        setMessage('Đã có lỗi xảy ra. Vui lòng thử lại.');
      }
    } else {
      setMessage('Đặt lịch thành công! Cảm ơn bạn.');
      setBookedScheduleIds(prev => [...prev, scheduleId]);
    }
  };

  if (loading) {
    return <p className="text-center text-gray-500">Đang tải lịch làm việc...</p>;
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      {doctor && <h2 className="text-2xl font-bold text-center mb-4 text-blue-600">Lịch làm việc của Bác sĩ {doctor.name}</h2>}
      {message && <p className={`text-center font-semibold p-3 rounded-md mb-4 ${message.includes('thành công') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{message}</p>}
      
      {Object.keys(groupedSchedules).length > 0 ? (
        <div className="space-y-6">
          {Object.entries(groupedSchedules).map(([date, schedules]) => (
            <div key={date}>
              <h3 className="text-lg font-semibold text-gray-700 border-b-2 border-gray-200 pb-2 mb-3">{date}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {schedules.map(schedule => {
                  const isBooked = bookedScheduleIds.includes(schedule.id);
                  const startTime = new Date(schedule.start_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                  const endTime = new Date(schedule.end_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

                  return (
                    <button
                      key={schedule.id}
                      onClick={() => handleBooking(schedule.id)}
                      className={`p-3 border rounded-lg text-center transition-all duration-200 ease-in-out transform hover:scale-105 ${
                        isBooked
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed shadow-inner'
                          : 'bg-blue-500 text-white hover:bg-blue-600 shadow-md'
                      }`}
                      disabled={isBooked || (!!message && message.includes('Đang xử lý'))}
                    >
                      <span className="font-bold text-sm">{startTime} - {endTime}</span>
                      {isBooked && <p className="text-xs font-medium mt-1">Đã đặt</p>}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 mt-6">
          Bác sĩ này hiện không có lịch làm việc nào.
          <br />
          Vui lòng quay lại sau.
        </p>
      )}
    </div>
  );
}

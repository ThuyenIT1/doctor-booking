import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, User as UserIcon } from 'lucide-react';
import { CancelAppointmentDialog } from './CancelAppointmentDialog';

interface Doctor {
  id: any;
  name: any;
  specialty: any;
  education: any;
  experience_years: any;
}

interface Schedule {
  id: any;
  start_time: any;
  end_time: any;
  doctor: Doctor[];
}

interface DatabaseAppointment {
  id: any;
  patient_id: any;
  schedule_id: any;
  created_at: any;
  schedule: Schedule[];
}

export default async function MyAppointmentsPage() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?message=Bạn cần đăng nhập để xem lịch hẹn của mình.');
  }

  const { data: appointments, error } = await supabase
    .from('appointments')
    .select(`
      id,
      patient_id,
      schedule_id,
      created_at,
      schedule:schedule_id (
        id,
        start_time,
        end_time,
        doctor:doctor_id (
          id,
          name,
          specialty,
          education,
          experience_years
        )
      )
    `)
    .eq('patient_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching appointments:', error);
    return <p className="text-center text-red-500">Đã có lỗi xảy ra khi tải lịch hẹn của bạn: {error.message}</p>;
  }

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4 md:px-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Lịch hẹn của tôi</h1>
        <Button asChild variant="outline">
          <Link href="/" className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>
            Đặt lịch mới
          </Link>
        </Button>
      </div>

      {appointments && appointments.length > 0 ? (
        <div className="grid gap-6">
          {(appointments as DatabaseAppointment[]).map((appointment) => {
            const schedule = appointment.schedule[0];
            if (!schedule) return null;

            const doctor = schedule.doctor[0];
            const { start_time, end_time } = schedule;
            const appointmentDate = new Date(start_time);
            const today = new Date();
            const isUpcoming = appointmentDate > today;

            // Format dates
            const dateStr = appointmentDate.toLocaleDateString('vi-VN', {
              weekday: 'long', 
              day: 'numeric', 
              month: 'long', 
              year: 'numeric'
            });
            const startTime = appointmentDate.toLocaleTimeString('vi-VN', { 
              hour: '2-digit', 
              minute: '2-digit' 
            });
            const endTime = new Date(end_time).toLocaleTimeString('vi-VN', { 
              hour: '2-digit', 
              minute: '2-digit' 
            });

            // Calculate time until appointment
            const timeUntil = appointmentDate.getTime() - today.getTime();
            const daysUntil = Math.ceil(timeUntil / (1000 * 60 * 60 * 24));
            let timeStatus = '';
            if (isUpcoming) {
              if (daysUntil === 0) timeStatus = 'Hôm nay';
              else if (daysUntil === 1) timeStatus = 'Ngày mai';
              else timeStatus = `${daysUntil} ngày nữa`;
            }

            return (
              <Card key={appointment.id} className={`overflow-hidden ${
                isUpcoming 
                  ? 'border-primary border-2 shadow-primary/10' 
                  : 'border-gray-200 opacity-75'
              } hover:shadow-lg transition-all duration-300`}>
                <CardHeader className={`border-b ${
                  isUpcoming ? 'bg-primary/5' : 'bg-gray-50'
                }`}>
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <UserIcon className={`h-6 w-6 ${isUpcoming ? 'text-primary' : 'text-gray-600'}`} />
                      <span className={isUpcoming ? 'text-primary' : 'text-gray-700'}>
                        Bác sĩ {doctor?.name ?? 'Không rõ'}
                      </span>
                    </CardTitle>
                    {isUpcoming && (
                      <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                        {timeStatus}
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid gap-4">
                    <div className="flex items-center gap-3 text-gray-600 bg-gray-50/80 p-3 rounded-lg">
                      <Calendar className="h-5 w-5 text-primary" />
                      <div>
                        <span className="text-sm text-gray-500">Ngày khám</span>
                        <p className="font-medium">{dateStr}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600 bg-gray-50/80 p-3 rounded-lg">
                      <Clock className="h-5 w-5 text-primary" />
                      <div>
                        <span className="text-sm text-gray-500">Thời gian</span>
                        <p className="font-medium">{startTime} - {endTime}</p>
                      </div>
                    </div>
                    
                    {doctor && (
                      <>
                        {doctor.specialty && (
                          <div className="flex items-center gap-3 text-gray-600">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21.54 15.88L13.12 7.46a2 2 0 00-2.83 0l-6.36 6.36a2 2 0 000 2.83L12.34 25a2 2 0 002.83 0l6.37-6.36a2 2 0 000-2.83z"></path>
                              <path d="M7.46 12.46l5.66 5.66"></path>
                              <path d="M15.88 4.12l5.66 5.66"></path>
                            </svg>
                            <span className="font-medium">{doctor.specialty}</span>
                          </div>
                        )}
                        {doctor.education && (
                          <div className="flex items-center gap-3 text-gray-600">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.084a1 1 0 0 0 0 1.838l8.57 3.908a2 2 0 0 0 1.66 0z"/>
                              <path d="M22 10v6"/>
                              <path d="M6 12v5a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3v-5"/>
                            </svg>
                            <span className="font-medium">{doctor.education}</span>
                          </div>
                        )}
                        {doctor.experience_years && (
                          <div className="flex items-center gap-3 text-gray-600">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10"/>
                              <polyline points="12 6 12 12 16 14"/>
                            </svg>
                            <span className="font-medium">{doctor.experience_years} năm kinh nghiệm</span>
                          </div>
                        )}
                      </>
                    )}

                    <div className="flex items-center gap-3 text-gray-600">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                      <span className="font-medium">Đã đặt lịch</span>
                    </div>

                    <div className="flex items-center gap-3 text-gray-600">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
                        <line x1="16" x2="16" y1="2" y2="6"></line>
                        <line x1="8" x2="8" y1="2" y2="6"></line>
                        <line x1="3" x2="21" y1="10" y2="10"></line>
                      </svg>
                      <span className="text-sm text-gray-500">
                        Đặt lịch vào: {new Date(appointment.created_at).toLocaleDateString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit',
                          day: 'numeric',
                          month: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>

                  {isUpcoming && doctor && (
                    <div className="mt-6 flex gap-3">
                      <Button className="w-full" asChild>
                        <Link href={`/doctors/${doctor.id}`}>
                          Xem thông tin bác sĩ
                        </Link>
                      </Button>
                      <CancelAppointmentDialog appointmentId={appointment.id} />
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 px-6 bg-gray-50 rounded-lg shadow-inner">
          <div className="mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-700 mb-3">Bạn chưa có lịch hẹn nào</h2>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Hãy bắt đầu tìm kiếm bác sĩ và đặt lịch hẹn ngay hôm nay để được chăm sóc sức khỏe tốt nhất.
          </p>
          <Button asChild size="lg">
            <Link href="/" className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
              Tìm bác sĩ ngay
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}

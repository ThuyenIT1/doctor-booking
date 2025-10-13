import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, User as UserIcon } from 'lucide-react';

// Correct the type to match the actual object structure from Supabase
type Appointment = {
  id: number;
  schedules: {
    start_time: string;
    end_time: string;
    doctors: {
      name: string;
    } | null;
  } | null;
};

export default async function MyAppointmentsPage() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?message=Bạn cần đăng nhập để xem lịch hẹn của mình.');
  }

  // The query remains the same, as it correctly describes the relationship
  const { data: appointments, error } = await supabase
    .from('appointments')
    .select(`
      id,
      schedules (
        start_time,
        end_time,
        doctors (name)
      )
    `)
    .eq('patient_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching appointments:', error);
    return <p className="text-center text-red-500">Đã có lỗi xảy ra khi tải lịch hẹn của bạn.</p>;
  }

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4 md:px-6">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Lịch hẹn của tôi</h1>
      {appointments && appointments.length > 0 ? (
        <div className="grid gap-6">
          {(appointments as Appointment[]).map((appointment) => {
            // Access properties as objects, which matches the real data structure
            const schedule = appointment.schedules;
            if (!schedule) return null;

            const { start_time, end_time, doctors } = schedule;
            const appointmentDate = new Date(start_time).toLocaleDateString('vi-VN', {
              weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
            });
            const startTime = new Date(start_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
            const endTime = new Date(end_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

            return (
              <Card key={appointment.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="bg-gray-50 border-b">
                  <CardTitle className="flex items-center gap-3 text-xl text-blue-700">
                    <UserIcon className="h-6 w-6" />
                    <span>Bác sĩ: {doctors?.name ?? 'Không rõ'}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 grid gap-4">
                  <div className="flex items-center gap-3 text-gray-600">
                    <Calendar className="h-5 w-5" />
                    <span className="font-medium">{appointmentDate}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <Clock className="h-5 w-5" />
                    <span className="font-medium">{startTime} - {endTime}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 px-6 bg-gray-50 rounded-lg shadow-inner">
          <h2 className="text-2xl font-semibold text-gray-700 mb-3">Bạn chưa có lịch hẹn nào</h2>
          <p className="text-gray-500 mb-6">Hãy bắt đầu tìm kiếm bác sĩ và đặt lịch hẹn ngay hôm nay.</p>
          <Button asChild size="lg">
            <Link href="/">Tìm bác sĩ</Link>
          </Button>
        </div>
      )}
    </div>
  );
}

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
// Import AppointmentTabs component
import { AppointmentTabs } from './AppointmentTabs';

interface Doctor {
  id: number;
  name: string;
  specialty: string | null;
  education: string | null;
  experience_years: number | null;
}

interface Schedule {
  id: number;
  start_time: string;
  end_time: string;
  doctor: Doctor;
}

interface DatabaseAppointment {
  id: number;
  patient_id: string;
  schedule_id: number;
  created_at: string;
  schedule: Schedule;
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

  // Phân tách lịch sắp tới và lịch sử
  const now = new Date();
  const typedAppointments = appointments as unknown as DatabaseAppointment[];
  
  const upcomingAppointments = typedAppointments.filter(apt => 
    apt.schedule && new Date(apt.schedule.start_time) > now
  );
  
  const pastAppointments = typedAppointments.filter(apt => 
    apt.schedule && new Date(apt.schedule.start_time) <= now
  );

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

      {/* Tab Navigation */}
      <AppointmentTabs 
        upcomingAppointments={upcomingAppointments}
        pastAppointments={pastAppointments}
      />
    </div>
  );
}

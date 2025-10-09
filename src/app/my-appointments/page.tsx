import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default async function MyAppointmentsPage() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?message=Bạn cần đăng nhập để xem lịch hẹn của mình.');
  }

  // Simplified data fetching for debugging
  const { data: appointments, error } = await supabase
    .from('appointments')
    .select('id')
    .eq('patient_id', user.id);

  if (error) {
    console.error('Error fetching appointments:', error);
    return <p className="text-center text-destructive">Đã có lỗi xảy ra khi tải lịch hẹn của bạn.</p>;
  }

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4 md:px-6">
      <h1 className="text-3xl font-bold mb-6">Lịch hẹn của tôi (Debug)</h1>
      {appointments && appointments.length > 0 ? (
        <div className="grid gap-6">
          {appointments.map((appointment: any) => (
            <Card key={appointment.id}>
              <CardHeader>
                <CardTitle>Lịch hẹn ID: {appointment.id}</CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Bạn chưa có lịch hẹn nào.</p>
          <Button asChild>
            <Link href="/">Tìm bác sĩ và đặt lịch</Link>
          </Button>
        </div>
      )}
    </div>
  );
}

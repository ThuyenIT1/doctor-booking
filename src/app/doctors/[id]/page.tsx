import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import ScheduleView from '@/components/ScheduleView';

type DoctorDetailPageProps = {
  params: { id: string };
};

export default async function DoctorDetailPage({ params }: DoctorDetailPageProps) {
  const supabase = createClient();

  const { data: doctor, error } = await supabase
    .from('doctors')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !doctor) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-primary mb-2">{doctor.name}</h1>
        <p className="text-xl text-muted-foreground mb-4">{doctor.specialty}</p>
        <div className="prose max-w-none">
          <p>{doctor.bio || 'Chưa có thông tin tiểu sử cho bác sĩ này.'}</p>
          {/* Bạn có thể thêm các thông tin chi tiết khác của bác sĩ ở đây */}
        </div>

        <div className="mt-8 border-t pt-6">
          <h2 className="text-2xl font-bold mb-4 text-primary">Đặt lịch hẹn</h2>
          <ScheduleView doctorId={doctor.id} />
        </div>
      </div>
    </div>
  );
}
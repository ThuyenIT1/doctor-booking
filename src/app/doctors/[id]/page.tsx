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

        <div className="flex flex-wrap gap-4 text-muted-foreground mb-4">
          {doctor.experience_years != null && (
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
              <span>{doctor.experience_years} năm kinh nghiệm</span>
            </div>
          )}
          {doctor.education && (
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.084a1 1 0 0 0 0 1.838l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12v5a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3v-5"/></svg>
              <span>{doctor.education}</span>
            </div>
          )}
        </div>
        
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
import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import ScheduleView from '@/components/ScheduleView'

// This tells Next.js to render pages on demand instead of at build time
export const dynamic = 'force-dynamic'

// Define a type for the page props
type DoctorDetailPageProps = {
  params: {
    id: string;
  };
};

export default async function DoctorDetailPage({ params }: DoctorDetailPageProps) {
  const supabase = createClient()
  const { data: doctor, error } = await supabase
    .from('doctors')
    .select('*')
    .eq('id', params.id)
    .single();

  // If no doctor is found, show a 404 page
  if (error || !doctor) {
    notFound();
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg">
      <div className="flex flex-col md:flex-row items-start">
        {/* You can add an avatar here later using doctor.avatar_url */}
        <div className="md:ml-8 mt-4 md:mt-0">
          <h1 className="text-4xl font-bold text-blue-800">{doctor.name}</h1>
          <p className="mt-2 text-xl text-gray-600 font-semibold">{doctor.specialty}</p>
          <p className="mt-6 text-lg text-gray-700 whitespace-pre-wrap">{doctor.bio || 'Chưa có tiểu sử.'}</p>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-semibold border-b pb-4 mb-6">Lịch làm việc & Đặt hẹn</h2>
        <ScheduleView doctorId={doctor.id} />
      </div>
    </div>
  );
}
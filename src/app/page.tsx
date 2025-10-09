import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import DoctorList from '@/components/DoctorList'

// Define a type for the doctor for TypeScript
export type Doctor = {
  id: number;
  name: string;
  specialty: string | null;
};

export default async function Home() {
  const supabase = createClient()
  // Fetch doctors and specialties from Supabase
  const { data: doctors, error } = await supabase
    .from('doctors')
    .select('id, name, specialty')
    .order('name', { ascending: true });

  const specialties = [...new Set(doctors?.map(d => d.specialty).filter(Boolean) as string[])];

  if (error) {
    console.error('Error fetching doctors:', error);
  }

  return (
    <div className="flex flex-col gap-12">
      {/* Hero Section */}
      <section className="text-center">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
          Chào mừng đến với DoctorBook
        </h1>
        <p className="mx-auto text-muted-foreground md:text-xl mt-4">
          Sức khỏe của bạn, ưu tiên của chúng tôi. Dễ dàng tìm và đặt lịch hẹn với các bác sĩ hàng đầu.
        </p>
        <div className="mt-6">
          <Button asChild size="lg">
            <Link href="#doctors-list">Tìm Bác Sĩ</Link>
          </Button>
        </div>
      </section>

      {/* Doctors List Section */}
      <section id="doctors-list" className="w-full">
        <h2 className="text-3xl font-bold text-center mb-8">Danh sách Bác sĩ</h2>
        <DoctorList doctors={doctors || []} specialties={specialties} error={!!error} />
      </section>
    </div>
  );
}

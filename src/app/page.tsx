import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'

import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

// Define a type for the doctor for TypeScript
type Doctor = {
  id: number;
  name: string;
  specialty: string | null;
};

export default async function Home() {
  const supabase = createClient()
  // Fetch doctors from Supabase
  const { data: doctors, error } = await supabase
    .from('doctors')
    .select('id, name, specialty')
    .order('name', { ascending: true });

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
        <div className="mt-4">
          {error && (
            <p className="text-center text-destructive">Đã có lỗi xảy ra khi tải danh sách bác sĩ.</p>
          )}
          {doctors && doctors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {doctors.map((doctor: Doctor) => (
                <Link href={`/doctors/${doctor.id}`} key={doctor.id} className="h-full">
                  <Card className="h-full transition-all hover:shadow-lg hover:-translate-y-1">
                    <div className="flex flex-col items-center p-6">
                      <img
                        src="/img/doctor.png"
                        alt={`Ảnh của bác sĩ ${doctor.name}`}
                        width="80"
                        height="80"
                        className="rounded-full"
                      />
                      <CardHeader className="text-center">
                        <CardTitle className="text-primary">{doctor.name}</CardTitle>
                        <CardDescription>{doctor.specialty || 'Chuyên khoa chung'}</CardDescription>
                      </CardHeader>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            !error && <p className="text-center text-muted-foreground">Hiện tại chưa có thông tin bác sĩ nào.</p>
          )}
        </div>
      </section>
    </div>
  );
}

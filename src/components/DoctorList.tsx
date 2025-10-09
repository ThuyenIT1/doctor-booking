'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Doctor } from '@/app/page' // Import type từ page.tsx

type DoctorListProps = {
  doctors: Doctor[];
  specialties: string[];
  error: boolean;
};

export default function DoctorList({ doctors, specialties, error }: DoctorListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = !selectedSpecialty || selectedSpecialty === 'all' ? true : doctor.specialty === selectedSpecialty;
    return matchesSearch && matchesSpecialty;
  });

  if (error) {
    return <p className="text-center text-destructive">Đã có lỗi xảy ra khi tải danh sách bác sĩ.</p>;
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <Input
          type="text"
          placeholder="Tìm bác sĩ theo tên..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow"
        />
        <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
          <SelectTrigger className="w-full md:w-[280px]">
            <SelectValue placeholder="Lọc theo chuyên khoa" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả chuyên khoa</SelectItem>
            {specialties.map(specialty => (
              <SelectItem key={specialty} value={specialty}>
                {specialty}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {doctors.length > 0 ? (
        filteredDoctors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredDoctors.map((doctor: Doctor) => (
              <Link href={`/doctors/${doctor.id}`} key={doctor.id} className="h-full block group">
                <Card className="h-full transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-2 border-2 border-transparent group-hover:border-primary">
                  <CardContent className="flex flex-col items-center p-6 text-center">
                    <img
                      src="/img/doctor.png"
                      alt={`Ảnh của bác sĩ ${doctor.name}`}
                      width="90"
                      height="90"
                      className="rounded-full mb-4 border-2 border-gray-200"
                    />
                    <CardHeader className="p-0">
                      <CardTitle className="text-lg font-bold text-primary">{doctor.name}</CardTitle>
                      <CardDescription className="text-base">{doctor.specialty || 'Chuyên khoa chung'}</CardDescription>
                    </CardHeader>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground mt-10">Không tìm thấy bác sĩ nào phù hợp.</p>
        )
      ) : (
        <p className="text-center text-muted-foreground">Hiện tại chưa có thông tin bác sĩ nào.</p>
      )}
    </div>
  );
}
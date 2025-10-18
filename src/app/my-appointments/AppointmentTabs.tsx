'use client'

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, User as UserIcon } from 'lucide-react';
import { CancelAppointmentDialog } from './CancelAppointmentDialog';

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

interface AppointmentTabsProps {
  upcomingAppointments: DatabaseAppointment[];
  pastAppointments: DatabaseAppointment[];
}

export function AppointmentTabs({ upcomingAppointments, pastAppointments }: AppointmentTabsProps) {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  const appointments = activeTab === 'upcoming' ? upcomingAppointments : pastAppointments;

  return (
    <div>
      {/* Tab Headers */}
      <div className="flex gap-2 mb-6 border-b">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`px-6 py-3 font-semibold transition-all duration-200 ${
            activeTab === 'upcoming'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Lịch sắp tới
          {upcomingAppointments.length > 0 && (
            <span className="ml-2 inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-primary rounded-full">
              {upcomingAppointments.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={`px-6 py-3 font-semibold transition-all duration-200 ${
            activeTab === 'past'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Lịch sử
          {pastAppointments.length > 0 && (
            <span className="ml-2 inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-gray-600 bg-gray-200 rounded-full">
              {pastAppointments.length}
            </span>
          )}
        </button>
      </div>

      {/* Tab Content */}
      {appointments.length > 0 ? (
        <div className="grid gap-6">
          {appointments.map((appointment) => {
            const schedule = appointment.schedule;
            if (!schedule) return null;

            const doctor = schedule.doctor;
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
              <Card
                key={appointment.id}
                className={`overflow-hidden ${
                  isUpcoming
                    ? 'border-primary border-2 shadow-primary/10'
                    : 'border-gray-200 opacity-75'
                } hover:shadow-lg transition-all duration-300`}
              >
                <CardHeader
                  className={`border-b ${
                    isUpcoming ? 'bg-primary/5' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <UserIcon className={`h-6 w-6 ${isUpcoming ? 'text-primary' : 'text-gray-600'}`} />
                      <span className={isUpcoming ? 'text-primary' : 'text-gray-700'}>
                        Bác sĩ {doctor?.name ?? 'Không rõ'}
                      </span>
                    </CardTitle>
                    {isUpcoming ? (
                      <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                        {timeStatus}
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-600">
                        Đã hoàn thành
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
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M21.54 15.88L13.12 7.46a2 2 0 00-2.83 0l-6.36 6.36a2 2 0 000 2.83L12.34 25a2 2 0 002.83 0l6.37-6.36a2 2 0 000-2.83z"></path>
                              <path d="M7.46 12.46l5.66 5.66"></path>
                              <path d="M15.88 4.12l5.66 5.66"></path>
                            </svg>
                            <span className="font-medium">{doctor.specialty}</span>
                          </div>
                        )}
                        {doctor.education && (
                          <div className="flex items-center gap-3 text-gray-600">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.084a1 1 0 0 0 0 1.838l8.57 3.908a2 2 0 0 0 1.66 0z" />
                              <path d="M22 10v6" />
                              <path d="M6 12v5a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3v-5" />
                            </svg>
                            <span className="font-medium">{doctor.education}</span>
                          </div>
                        )}
                        {doctor.experience_years && (
                          <div className="flex items-center gap-3 text-gray-600">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <circle cx="12" cy="12" r="10" />
                              <polyline points="12 6 12 12 16 14" />
                            </svg>
                            <span className="font-medium">{doctor.experience_years} năm kinh nghiệm</span>
                          </div>
                        )}
                      </>
                    )}

                    <div className="flex items-center gap-3 text-gray-600">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
                        <line x1="16" x2="16" y1="2" y2="6"></line>
                        <line x1="8" x2="8" y1="2" y2="6"></line>
                        <line x1="3" x2="21" y1="10" y2="10"></line>
                      </svg>
                      <span className="text-sm text-gray-500">
                        Đặt lịch vào:{' '}
                        {new Date(appointment.created_at).toLocaleDateString('vi-VN', {
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

                  {!isUpcoming && doctor && (
                    <div className="mt-6">
                      <Button className="w-full" asChild variant="outline">
                        <Link href={`/doctors/${doctor.id}`}>
                          Đặt lịch lại với bác sĩ này
                        </Link>
                      </Button>
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 mx-auto text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-700 mb-3">
            {activeTab === 'upcoming' ? 'Bạn chưa có lịch hẹn sắp tới' : 'Chưa có lịch sử khám bệnh'}
          </h2>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            {activeTab === 'upcoming'
              ? 'Hãy bắt đầu tìm kiếm bác sĩ và đặt lịch hẹn ngay hôm nay để được chăm sóc sức khỏe tốt nhất.'
              : 'Bạn chưa hoàn thành lịch khám nào. Lịch sử sẽ hiển thị sau khi bạn đã đi khám.'}
          </p>
          {activeTab === 'upcoming' && (
            <Button asChild size="lg">
              <Link href="/" className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                Tìm bác sĩ ngay
              </Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

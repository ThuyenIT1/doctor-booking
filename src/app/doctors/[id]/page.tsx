import { notFound } from 'next/navigation';

type DoctorDetailPageProps = {
  params: { id: string };
};

export default async function DoctorDetailPage({ params }: DoctorDetailPageProps) {
  if (!params.id) {
    notFound();
  }

  return (
    <div>
      <h1>Doctor Details</h1>
      <p>Details for doctor with ID: {params.id}</p>
    </div>
  );
}
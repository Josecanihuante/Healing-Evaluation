"use client";

import { usePatientContext } from '@/context/PatientContext';
import PatientDetailView from '@/components/patient-detail-view';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useParams } from 'next/navigation';

export default function PatientDetailPage() {
  const params = useParams();
  const patientId = Array.isArray(params.id) ? params.id[0] : params.id;
  const { state } = usePatientContext();
  const { patients, isInitialized } = state;

  if (!isInitialized) {
    return (
       <div className="p-4 md:p-8 space-y-6">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-8 w-1/2" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
        </div>
      </div>
    )
  }

  const patient = patients.find((p) => p.id === patientId);

  if (!patient) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <h2 className="text-2xl font-semibold mb-2">Paciente no encontrado</h2>
        <p className="text-muted-foreground mb-6">No se pudo encontrar el paciente solicitado.</p>
        <Button asChild>
          <Link href="/patients">
            Volver a la Lista de Pacientes
          </Link>
        </Button>
      </div>
    );
  }

  return <PatientDetailView patient={patient} />;
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { EditPatientForm } from '@/components/edit-patient-form';
import { usePatientContext } from '@/context/PatientContext';
import { Patient } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const PatientEditPage = () => {
  const params = useParams();
  const patientId = params.id as string;
  const { state } = usePatientContext();
  const [patient, setPatient] = useState<Patient | null>(null);

  useEffect(() => {
    if (state.isInitialized && patientId) {
      const foundPatient = state.patients.find(p => p.id === patientId);
      setPatient(foundPatient || null);
    }
  }, [patientId, state.isInitialized, state.patients]);

  if (!state.isInitialized) {
    return (
      <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }
  
  if (!patient) {
     return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <h2 className="text-2xl font-semibold mb-2">Paciente no encontrado</h2>
        <p className="text-muted-foreground mb-6">No se pudo encontrar el paciente que intenta editar.</p>
        <Button asChild>
          <Link href="/patients">
            Volver a la Lista de Pacientes
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold font-headline">Editar Paciente</h1>
          <p className="text-muted-foreground">Modifique los detalles del paciente a continuación.</p>
        </div>
        <EditPatientForm patient={patient} />
      </div>
    </div>
  );
};

export default PatientEditPage;

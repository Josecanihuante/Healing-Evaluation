"use client"

import { usePatientContext } from '@/context/PatientContext';
import AddEvaluationForm from '@/components/add-evaluation-form';
import { notFound, useParams, useSearchParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AddEvaluationPage() {
  const params = useParams();
  const patientId = Array.isArray(params.id) ? params.id[0] : params.id;
  const searchParams = useSearchParams();
  const type = searchParams.get('type');
  
  const { state } = usePatientContext();
  const { patients, isInitialized } = state;
  
  if (type !== 'treatment' && type !== 'surgical') {
    notFound();
  }

  if (!isInitialized) {
    return (
       <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-6">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-20" />
        <Skeleton className="h-32" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  const patient = patients.find((p) => p.id === patientId);
  
  if (!patient) {
     return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <h2 className="text-2xl font-semibold mb-2">Paciente no encontrado</h2>
        <p className="text-muted-foreground mb-6">No se pudo encontrar el paciente para esta evaluación.</p>
        <Button asChild>
          <Link href="/patients">
            Volver a la Lista de Pacientes
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold font-headline">Añadir Evaluación de {type === 'treatment' ? 'Tratamiento' : 'Cirugía'}</h1>
        <p className="text-muted-foreground">Para el paciente: <span className="font-semibold text-foreground">{patient.name}</span></p>
      </div>
      <AddEvaluationForm patient={patient} evaluationType={type} />
    </div>
  );
}

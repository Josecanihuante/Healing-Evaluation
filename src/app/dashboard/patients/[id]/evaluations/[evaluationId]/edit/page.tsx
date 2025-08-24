"use client"

import { usePatientContext } from '@/context/PatientContext';
import EditEvaluationForm from '@/components/edit-evaluation-form';
import { notFound, useParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function EditEvaluationPage() {
  const params = useParams();
  const patientId = Array.isArray(params.id) ? params.id[0] : params.id;
  const evaluationId = Array.isArray(params.evaluationId) ? params.evaluationId[0] : params.evaluationId;
  
  const { state } = usePatientContext();
  const { patients, isInitialized } = state;

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
  const evaluation = patient?.evaluations.find(e => e.id === evaluationId);
  
  if (!patient || !evaluation) {
     return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <h2 className="text-2xl font-semibold mb-2">Evaluación no encontrada</h2>
        <p className="text-muted-foreground mb-6">No se pudo encontrar la evaluación que intenta editar.</p>
        <Button asChild>
          <Link href={`/dashboard/patients/${patientId}`}>
            Volver a los Detalles del Paciente
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold font-headline">Editar Evaluación de {evaluation.type === 'treatment' ? 'Tratamiento' : 'Cirugía'}</h1>
        <p className="text-muted-foreground">Para el paciente: <span className="font-semibold text-foreground">{patient.name}</span></p>
      </div>
      <EditEvaluationForm patient={patient} evaluation={evaluation} />
    </div>
  );
}

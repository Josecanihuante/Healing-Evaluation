'use client';

import { useParams } from 'next/navigation';
import React from 'react';
import { usePatientContext } from '@/context/PatientContext';
import { type Evaluation, type Patient, type TreatingPhysician } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, ListChecks, ArrowLeft, BarChart2, Scale } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface DoctorEvaluation extends Evaluation {
  patient: {
    id: string;
    name: string;
  };
}

const DoctorEvaluationsPage: React.FC = () => {
  const params = useParams();
  const doctorName = decodeURIComponent(params.id as string);
  const { state } = usePatientContext();

  if (!state.isInitialized) {
    return (
      <div className="p-4 md:p-8 space-y-6">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-8 w-1/2" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  const allEvaluations: DoctorEvaluation[] = [];
  state.patients.forEach(patient => {
    const isDoctorAssigned = patient.treatingPhysicians.some(physician => physician.name === doctorName);
    if (isDoctorAssigned) {
      patient.evaluations.forEach(evaluation => {
        allEvaluations.push({
          ...evaluation,
          patient: { id: patient.id, name: patient.name }
        });
      });
    }
  });

  allEvaluations.sort((a, b) => new Date(b.dateEvaluated).getTime() - new Date(a.dateEvaluated).getTime());

  const doctor = state.doctors.find(d => d.name === doctorName);

  return (
    <div className="p-4 md:p-8">
      <header className="mb-6">
        <Button asChild variant="outline" className="mb-4">
          <Link href="/dashboard/doctors"><ArrowLeft className="w-4 h-4 mr-2" />Volver a la lista de Médicos</Link>
        </Button>
        <h1 className="text-3xl font-bold font-headline">{doctorName}</h1>
        <p className="text-muted-foreground">{doctor?.specialty}</p>
      </header>

      {allEvaluations.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {allEvaluations.map(evaluation => {
            const isTreatment = evaluation.type === 'treatment';
            const date = new Date(evaluation.dateEvaluated);
            return (
              <Card key={evaluation.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex justify-between items-start">
                      <div>
                          <Badge variant={isTreatment ? "default" : "secondary"} className={`${isTreatment ? "bg-accent text-accent-foreground" : "bg-blue-200 text-blue-800"}`}>
                              {evaluation.type === 'treatment' ? 'TRATAMIENTO' : 'QUIRÚRGICO'}
                          </Badge>
                          <CardTitle className="mt-2 text-lg">{evaluation.procedureName}</CardTitle>
                      </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{evaluation.writtenEvaluation}</p>
                  <div className="space-y-4">
                     <div>
                        <div className="flex justify-between items-center mb-1 text-xs">
                            <span className="font-medium flex items-center gap-2"><Scale className="w-3 h-3"/>Calificación</span>
                            <span className="font-bold text-primary">{Math.round(evaluation.scaleRating * 100)}%</span>
                        </div>
                        <Progress value={evaluation.scaleRating * 100} className="h-2"/>
                    </div>
                    <div>
                        <span className="font-medium text-xs flex items-center gap-2"><BarChart2 className="w-3 h-3"/>Valor</span>
                        <p className="text-xl font-bold">{evaluation.continuousValue.toFixed(2)}</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex-col items-start pt-4 border-t">
                  <div className="text-xs text-muted-foreground w-full">
                     <p className="flex items-center gap-2">
                        <User className="w-3 h-3" />
                        Paciente: <Link href={`/dashboard/patients/${evaluation.patient.id}`} className="font-semibold text-primary hover:underline">{evaluation.patient.name}</Link>
                     </p>
                     <p className="flex items-center gap-2 mt-1">
                        <Calendar className="w-3 h-3" /> 
                        Fecha: {date.toLocaleDateString()}
                     </p>
                  </div>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <ListChecks className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-lg font-medium">Sin Evaluaciones</h3>
          <p className="mt-1 text-sm text-muted-foreground">Este médico no tiene evaluaciones asociadas en ningún registro de paciente.</p>
        </div>
      )}
    </div>
  );
};

export default DoctorEvaluationsPage;

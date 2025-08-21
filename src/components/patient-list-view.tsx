"use client";

import Link from 'next/link';
import { type Patient } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Bed, Stethoscope, PlusCircle, ArrowRight, Trash2 } from 'lucide-react';
import { usePatientContext } from '@/context/PatientContext';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface PatientListViewProps {
  patients: Patient[];
}

export default function PatientListView({ patients }: PatientListViewProps) {
  const { dispatch } = usePatientContext();
  const { toast } = useToast();

  const handleDeletePatient = (e: React.MouseEvent, patientId: string, patientName: string) => {
    e.stopPropagation(); // Evita que el click se propague al Card (y navegue a los detalles)
    e.preventDefault();
    
    dispatch({ type: 'REMOVE_PATIENT', payload: patientId });
    toast({
      title: "Paciente Eliminado",
      description: `El registro para ${patientName} ha sido eliminado.`,
      variant: "destructive"
    });
  }

  if (patients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <User className="w-24 h-24 text-muted-foreground/50 mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Aún no hay pacientes</h2>
        <p className="text-muted-foreground mb-6">Comience añadiendo un nuevo paciente.</p>
        <Button asChild>
          <Link href="/patients/add">
            <PlusCircle className="mr-2 h-4 w-4" />
            Añadir Paciente
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold font-headline">Pacientes</h1>
        <Button asChild>
          <Link href="/patients/add">
            <PlusCircle className="mr-2 h-4 w-4" />
            Añadir Paciente
          </Link>
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {patients.map((patient) => (
          <Card key={patient.id} className="hover:shadow-lg transition-shadow duration-300 flex flex-col">
             <CardHeader className="flex flex-row items-start gap-4">
               <Avatar className="mt-1">
                <AvatarFallback className="bg-primary/20 text-primary">
                  {patient.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <CardTitle className="font-headline">{patient.name || 'Paciente sin nombre'}</CardTitle>
                <CardDescription className="flex items-center gap-2 pt-1">
                  <Stethoscope className="w-4 h-4" />
                  {patient.diagnosis || 'Sin diagnóstico'}
                </CardDescription>
              </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                     <Button variant="ghost" size="icon" className="shrink-0" onClick={(e) => e.stopPropagation()}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Está absolutamente seguro?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta acción no se puede deshacer. Esto eliminará permanentemente el registro del paciente y todos sus datos asociados.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction 
                        className="bg-destructive hover:bg-destructive/90"
                        onClick={(e) => handleDeletePatient(e, patient.id, patient.name)}>
                          Sí, eliminar paciente
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="text-sm text-muted-foreground space-y-2">
                <div className="flex items-center gap-2">
                  <Bed className="w-4 h-4 text-primary" />
                  <span>
                    Cama: {patient.bedNumber || 'N/A'} ({patient.bedType || 'N/A'})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">{patient.evaluations.length}</span>
                  <span>Evaluaciones</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
               <Button asChild variant="outline" className="w-full">
                <Link href={`/patients/${patient.id}`}>
                  Ver Detalles <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

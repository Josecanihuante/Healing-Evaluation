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
    e.stopPropagation(); 
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
      <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-gray-50 rounded-lg">
        <User className="w-24 h-24 text-gray-300 mb-4" />
        <h2 className="text-2xl font-semibold mb-2 text-gray-700">Aún no hay pacientes</h2>
        <p className="text-gray-500 mb-6">Comience añadiendo un nuevo registro de paciente.</p>
        <Button asChild>
          <Link href="/dashboard/patients/add">
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
          <Link href="/dashboard/patients/add">
            <PlusCircle className="mr-2 h-4 w-4" />
            Añadir Paciente
          </Link>
        </Button>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {patients.map((patient) => (
          <Card key={patient.id} className="hover:shadow-xl transition-shadow duration-300 flex flex-col bg-white rounded-xl border border-gray-200/80">
             <CardHeader className="flex flex-row items-start gap-4">
               <Avatar className="mt-1 h-12 w-12 border">
                <AvatarFallback className="bg-blue-50 text-blue-600 font-semibold">
                  {patient.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <CardTitle className="font-headline text-lg">{patient.name || 'Paciente sin nombre'}</CardTitle>
                <CardDescription className="flex items-center gap-2 pt-1 text-sm text-gray-500">
                  <Stethoscope className="w-4 h-4 text-gray-400" />
                  {patient.diagnosis || 'Sin diagnóstico'}
                </CardDescription>
              </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                     <Button variant="ghost" size="icon" className="shrink-0 text-gray-400 hover:text-destructive hover:bg-destructive/10 rounded-full" onClick={(e) => e.stopPropagation()}>
                        <Trash2 className="w-4 h-4" />
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
              <div className="text-sm text-gray-600 space-y-3">
                <div className="flex items-center gap-3">
                  <Bed className="w-4 h-4 text-gray-400" />
                  <span>
                    Cama: <strong>{patient.bedNumber || 'N/A'}</strong> ({patient.bedType || 'N/A'})
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-lg text-primary">{patient.evaluations.length}</span>
                  <span className="text-gray-500">Evaluaciones</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-gray-50/50 p-4 mt-4">
               <Button asChild variant="ghost" className="w-full text-primary hover:text-primary hover:bg-blue-100/80">
                <Link href={`/dashboard/patients/${patient.id}`}>
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

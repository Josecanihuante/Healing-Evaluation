"use client";

import { type Patient, type Evaluation, type TreatingPhysician } from '@/lib/types';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
    User, Stethoscope, Bed, Pill, Activity, ShieldPlus, Box, Info, ListChecks, Calendar, Scale, BarChart2, PlusCircle, Trash2, Pencil
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { usePatientContext } from '@/context/PatientContext';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

interface PatientDetailViewProps {
  patient: Patient;
}

const DetailRow = ({ label, value }: { label: string, value: React.ReactNode }) => (
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 border-b last:border-b-0">
    <p className="font-medium text-gray-500">{label}</p>
    <div className="text-right font-medium text-gray-800">{value || <span className="text-gray-400">No especificado</span>}</div>
  </div>
);

const ListCard = ({ title, items, icon: Icon }: { title: string, items: string[] | undefined, icon: React.ElementType }) => {
    if (!items || items.length === 0) return null;
    return (
        <Card className="shadow-sm border-gray-200/80">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-700"><Icon className="w-5 h-5 text-primary" />{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <ul className="space-y-2">
                    {items.map((item, index) => (
                        <li key={index} className="flex items-center gap-3 text-sm text-gray-600">
                            <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                            <span>{item}</span>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
};

const PhysicianListCard = ({ title, items, icon: Icon }: { title: string, items: TreatingPhysician[] | undefined, icon: React.ElementType }) => {
    if (!items || items.length === 0) return null;
    return (
        <Card className="shadow-sm border-gray-200/80">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-700"><Icon className="w-5 h-5 text-primary" />{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <ul className="space-y-3">
                    {items.map((item, index) => (
                        <li key={index} className="flex items-baseline gap-3 text-sm">
                            <div className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-2" />
                            <div>
                                <span className="font-semibold text-gray-800">{item.name}</span>
                                <p className="text-xs text-gray-500">{item.specialty}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
};

const EvaluationCard = ({ patientId, evaluation, onRemove }: { patientId: string, evaluation: Evaluation, onRemove: () => void }) => {
    const router = useRouter();
    const isTreatment = evaluation.type === 'treatment';
    const date = new Date(evaluation.dateEvaluated);
    return (
        <Card className="mb-4 shadow-sm border-gray-200/80">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <Badge variant={isTreatment ? "default" : "secondary"} className={`${isTreatment ? "bg-green-100 text-green-800 border-green-200" : "bg-blue-100 text-blue-800 border-blue-200"}`}>
                            {evaluation.type === 'treatment' ? 'TRATAMIENTO' : 'QUIRÚRGICO'}
                        </Badge>
                        <CardTitle className="mt-2 text-xl">{evaluation.procedureName}</CardTitle>
                        <CardDescription className="flex items-center gap-2 text-sm mt-1 text-gray-500">
                            <Calendar className="w-4 h-4" /> {date.toLocaleDateString()}
                        </CardDescription>
                    </div>
                     <div className="flex items-center gap-1">
                         <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full" onClick={() => router.push(`/dashboard/patients/${patientId}/evaluations/${evaluation.id}/edit`)}>
                            <Pencil className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-destructive hover:bg-destructive/10 rounded-full"><Trash2 className="w-4 h-4" /></Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Esta acción no se puede deshacer. Esto eliminará permanentemente este registro de evaluación.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={onRemove} className="bg-destructive hover:bg-destructive/90">Eliminar</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-gray-600 mb-6">{evaluation.writtenEvaluation}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <div className="flex justify-between items-center mb-1 text-sm">
                            <span className="font-medium text-gray-600 flex items-center gap-2"><Scale className="w-4 h-4"/>Calificación en Escala</span>
                            <span className="font-bold text-primary">{Math.round(evaluation.scaleRating * 100)}%</span>
                        </div>
                        <Progress value={evaluation.scaleRating * 100} className="h-2 bg-gray-200" />
                    </div>
                    <div>
                        <span className="font-medium text-sm text-gray-600 flex items-center gap-2"><BarChart2 className="w-4 h-4"/>Valor Continuo</span>
                        <p className="text-2xl font-bold text-gray-800">{evaluation.continuousValue.toFixed(2)}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default function PatientDetailView({ patient }: PatientDetailViewProps) {
  const router = useRouter();
  const { dispatch } = usePatientContext();
  const { toast } = useToast();

  const handleRemoveEvaluation = (evaluationId: string) => {
    dispatch({ type: 'REMOVE_EVALUATION', payload: { patientId: patient.id, evaluationId }});
    toast({
      title: "Evaluación Eliminada",
      description: "El registro de evaluación ha sido eliminado.",
    });
  };

  return (
    <div className="p-4 md:p-8">
      <header className="mb-8 flex justify-between items-start">
        <div>
            <h1 className="text-3xl font-bold font-headline flex items-center gap-3">
                <User className="w-8 h-8 text-primary"/>
                {patient.name}
            </h1>
            <p className="text-gray-500 flex items-center gap-2 mt-1">
                <Stethoscope className="w-4 h-4" /> {patient.diagnosis}
            </p>
        </div>
        <Button variant="outline" onClick={() => router.push(`/dashboard/patients/${patient.id}/edit`)}>
            <Pencil className="w-4 h-4 mr-2" />
            Editar Paciente
        </Button>
      </header>

      <Tabs defaultValue="details">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="details"><Info className="w-4 h-4 mr-2"/> Detalles</TabsTrigger>
          <TabsTrigger value="evaluations"><ListChecks className="w-4 h-4 mr-2"/> Evaluaciones</TabsTrigger>
        </TabsList>
        <TabsContent value="details" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="shadow-sm border-gray-200/80 lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-700"><User className="w-5 h-5 text-primary" />Información del Paciente</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DetailRow label="Nombre" value={patient.name} />
                        <DetailRow label="Diagnóstico Primario" value={patient.diagnosis} />
                        <DetailRow label="Asignación de Cama" value={`${patient.bedNumber} (${patient.bedType})`} />
                    </CardContent>
                </Card>
                 <Card className="shadow-sm border-gray-200/80 lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-700"><User className="w-5 h-5 text-primary" />Personal Clínico</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DetailRow label="Enfermero Encargado" value={patient.nurseInCharge} />
                        <DetailRow label="Enfermero Supervisor" value={patient.supervisingNurse} />
                    </CardContent>
                </Card>
                <div className="lg:col-span-1 space-y-6">
                 <PhysicianListCard title="Médico(s) Tratante(s)" items={patient.treatingPhysicians} icon={Stethoscope} />
                </div>
                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <ListCard title="Comorbilidades" items={patient.comorbidities} icon={ShieldPlus} />
                  <ListCard title="Medicamentos" items={patient.medications} icon={Pill} />
                  <ListCard title="Tratamientos" items={patient.treatments} icon={Activity} />
                  <ListCard title="Suministros o Insumos" items={patient.supplies} icon={Box} />
                </div>
            </div>
        </TabsContent>
        <TabsContent value="evaluations" className="mt-6">
            <div className="flex justify-end gap-2 mb-4">
                <Button onClick={() => router.push(`/dashboard/patients/${patient.id}/evaluations/add?type=treatment`)}>
                    <PlusCircle className="w-4 h-4 mr-2"/> Añadir Eval. de Tratamiento
                </Button>
                <Button variant="outline" onClick={() => router.push(`/dashboard/patients/${patient.id}/evaluations/add?type=surgical`)}>
                    <PlusCircle className="w-4 h-4 mr-2"/> Añadir Eval. Quirúrgica
                </Button>
            </div>
            {patient.evaluations.length > 0 ? (
                <div>
                    {patient.evaluations.sort((a,b) => new Date(b.dateEvaluated).getTime() - new Date(a.dateEvaluated).getTime()).map(eva => (
                        <EvaluationCard key={eva.id} patientId={patient.id} evaluation={eva} onRemove={() => handleRemoveEvaluation(eva.id)} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 border-2 border-dashed rounded-lg bg-gray-50">
                    <ListChecks className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-lg font-medium text-gray-700">No hay evaluaciones registradas</h3>
                    <p className="mt-1 text-sm text-gray-500">Añade una nueva evaluación para seguir el progreso del paciente.</p>
                </div>
            )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

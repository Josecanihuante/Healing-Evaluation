"use client";

import { type Patient, type Evaluation } from '@/lib/types';
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
    User, Stethoscope, Bed, Pill, Activity, ShieldPlus, Box, Info, ListChecks, Calendar, Scale, BarChart2, PlusCircle, Trash2
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
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 border-b last:border-b-0">
    <p className="font-medium text-muted-foreground">{label}</p>
    <div className="text-right">{value || <span className="text-muted-foreground/70">Not specified</span>}</div>
  </div>
);

const ListCard = ({ title, items, icon: Icon }: { title: string, items: string[], icon: React.ElementType }) => {
    if (items.length === 0) return null;
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg"><Icon className="w-5 h-5 text-primary" />{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <ul className="space-y-2">
                    {items.map((item, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                            <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                            <span>{item}</span>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
};

const EvaluationCard = ({ evaluation, onRemove }: { evaluation: Evaluation, onRemove: () => void }) => {
    const isTreatment = evaluation.type === 'treatment';
    const date = new Date(evaluation.dateEvaluated);
    return (
        <Card className="mb-4">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <Badge variant={isTreatment ? "default" : "secondary"} className={`${isTreatment ? "bg-accent text-accent-foreground" : "bg-blue-200 text-blue-800"}`}>
                            {evaluation.type.toUpperCase()}
                        </Badge>
                        <CardTitle className="mt-2">{evaluation.procedureName}</CardTitle>
                        <CardDescription className="flex items-center gap-2 text-sm mt-1">
                            <Calendar className="w-4 h-4" /> {date.toLocaleDateString()}
                        </CardDescription>
                    </div>
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon"><Trash2 className="w-4 h-4 text-destructive" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete this evaluation record.
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={onRemove} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-sm mb-6">{evaluation.writtenEvaluation}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <div className="flex justify-between items-center mb-1 text-sm">
                            <span className="font-medium flex items-center gap-2"><Scale className="w-4 h-4"/>Scale Rating</span>
                            <span className="font-bold text-primary">{Math.round(evaluation.scaleRating * 100)}%</span>
                        </div>
                        <Progress value={evaluation.scaleRating * 100} />
                    </div>
                    <div>
                        <span className="font-medium text-sm flex items-center gap-2"><BarChart2 className="w-4 h-4"/>Continuous Value</span>
                        <p className="text-2xl font-bold">{evaluation.continuousValue.toFixed(2)}</p>
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
      title: "Evaluation Removed",
      description: "The evaluation record has been deleted.",
    });
  };

  return (
    <div className="p-4 md:p-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold font-headline flex items-center gap-3">
            <User className="w-8 h-8 text-primary"/>
            {patient.name}
        </h1>
        <p className="text-muted-foreground flex items-center gap-2 mt-1">
            <Stethoscope className="w-4 h-4" /> {patient.diagnosis}
        </p>
      </header>

      <Tabs defaultValue="details">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="details"><Info className="w-4 h-4 mr-2"/> Details</TabsTrigger>
          <TabsTrigger value="evaluations"><ListChecks className="w-4 h-4 mr-2"/> Evaluations</TabsTrigger>
        </TabsList>
        <TabsContent value="details" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg"><User className="w-5 h-5 text-primary" />Patient Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DetailRow label="Name" value={patient.name} />
                        <DetailRow label="Primary Diagnosis" value={patient.diagnosis} />
                        <DetailRow label="Bed Assignment" value={`${patient.bedNumber} (${patient.bedType})`} />
                    </CardContent>
                </Card>
                <ListCard title="Comorbidities" items={patient.comorbidities} icon={ShieldPlus} />
                <ListCard title="Medications" items={patient.medications} icon={Pill} />
                <ListCard title="Treatments" items={patient.treatments} icon={Activity} />
                <ListCard title="Surgical Procedures" items={patient.surgicalProcedures} icon={Stethoscope} />
                <ListCard title="Supplies" items={patient.supplies} icon={Box} />
            </div>
        </TabsContent>
        <TabsContent value="evaluations" className="mt-6">
            <div className="flex justify-end gap-2 mb-4">
                <Button onClick={() => router.push(`/patients/${patient.id}/evaluations/add?type=treatment`)}>
                    <PlusCircle className="w-4 h-4 mr-2"/> Add Treatment Eval
                </Button>
                <Button onClick={() => router.push(`/patients/${patient.id}/evaluations/add?type=surgical`)}>
                    <PlusCircle className="w-4 h-4 mr-2"/> Add Surgical Eval
                </Button>
            </div>
            {patient.evaluations.length > 0 ? (
                <div>
                    {patient.evaluations.sort((a,b) => new Date(b.dateEvaluated).getTime() - new Date(a.dateEvaluated).getTime()).map(eva => (
                        <EvaluationCard key={eva.id} evaluation={eva} onRemove={() => handleRemoveEvaluation(eva.id)} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 border-2 border-dashed rounded-lg">
                    <ListChecks className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-lg font-medium">No evaluations recorded</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Add a new evaluation to track patient progress.</p>
                </div>
            )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

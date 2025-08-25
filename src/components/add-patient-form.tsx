"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { usePatientContext } from '@/context/PatientContext';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { User, Stethoscope, Bed, ShieldPlus, Pill, Activity, Box } from 'lucide-react';
import DiagnosisAssistantDialog from './diagnosis-assistant-dialog';
import { EditableList } from './editable-list';
import { EditablePhysicianList } from './editable-physician-list';
import ComorbiditySuggestionDialog from './comorbidity-suggestion-dialog';

const patientSchema = z.object({
  name: z.string().min(1, 'El nombre del paciente es requerido.'),
  diagnosis: z.string().min(1, 'El diagnóstico primario es requerido.'),
  comorbidities: z.array(z.object({ value: z.string() })),
  medications: z.array(z.object({ value: z.string() })),
  treatments: z.array(z.object({ value: z.string() })),
  surgicalProcedures: z.array(z.object({ value: z.string() })),
  supplies: z.array(z.object({ value: z.string() })),
  bedType: z.string(),
  bedNumber: z.string(),
  treatingPhysicians: z.array(z.object({ name: z.string(), specialty: z.string() })),
  nurseInCharge: z.string(),
  supervisingNurse: z.string(),
});

export type PatientFormValues = z.infer<typeof patientSchema>;

const AddPatientFormContent = () => {
  const router = useRouter();
  const { dispatch } = usePatientContext();
  const { toast } = useToast();

  const methods = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      name: '',
      diagnosis: '',
      comorbidities: [],
      medications: [],
      treatments: [],
      surgicalProcedures: [],
      supplies: [],
      bedType: '',
      bedNumber: '',
      treatingPhysicians: [],
      nurseInCharge: '',
      supervisingNurse: '',
    },
  });

  const { control, watch, getValues, setValue, handleSubmit, trigger } = methods;
  const diagnosis = watch('diagnosis');
  const formValues = watch();

  const handleApplyComorbidities = (comorbiditiesToAdd: string[]) => {
    const existing = new Set(getValues('comorbidities').map(c => c.value));
    const toAdd = comorbiditiesToAdd.filter(c => !existing.has(c));

    if (toAdd.length > 0) {
        setValue('comorbidities', [
            ...getValues('comorbidities'),
            ...toAdd.map(value => ({ value }))
        ]);
        toast({ title: "Comorbilidades Añadidas", description: `${toAdd.length} nuevas comorbilidades añadidas.` });
    } else {
        toast({ title: "Sin Cambios", description: "No se añadieron nuevas comorbilidades.", variant: "default" });
    }
  };

  function onSubmit(data: PatientFormValues) {
    const newPatient = {
      id: crypto.randomUUID(),
      name: data.name,
      diagnosis: data.diagnosis,
      bedType: data.bedType,
      bedNumber: data.bedNumber,
      comorbidities: data.comorbidities.map(i => i.value),
      medications: data.medications.map(i => i.value),
      treatments: data.treatments.map(i => i.value),
      surgicalProcedures: data.surgicalProcedures.map(i => i.value),
      supplies: data.supplies.map(i => i.value),
      evaluations: [],
      treatingPhysicians: data.treatingPhysicians,
      nurseInCharge: data.nurseInCharge,
      supervisingNurse: data.supervisingNurse,
    };
    dispatch({ type: 'ADD_PATIENT', payload: newPatient });
    toast({
      title: "Paciente Añadido",
      description: `${data.name} ha sido añadido exitosamente.`,
    });
    router.push('/dashboard/patients');
  }

  const handleApplyDiagnoses = (diagnoses: string[]) => {
    if (diagnoses.length === 0) return;

    const [primary, ...comorbidities] = diagnoses;
    setValue('diagnosis', primary, { shouldValidate: true });

    const existingComorbidities = new Set(getValues('comorbidities').map(c => c.value));
    const newComorbidities = comorbidities.filter(c => !existingComorbidities.has(c));
    
    if (newComorbidities.length > 0) {
      setValue('comorbidities', [
        ...getValues('comorbidities'),
        ...newComorbidities.map(value => ({ value }))
      ]);
    }
    
    toast({
        title: 'Diagnósticos Aplicados',
        description: `Diagnóstico principal establecido y ${newComorbidities.length} comorbilidades añadidas.`
    });
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <Card className="shadow-sm border-gray-200/80">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-700">Información del Paciente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Paciente</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input placeholder="John Doe" {...field} className="pl-10" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="diagnosis"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Diagnóstico Primario</FormLabel>
                  <div className="flex gap-2 items-start">
                    <div className="relative flex-grow">
                      <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input placeholder="ej., Diabetes Tipo 2" {...field} className="pl-10" />
                    </div>
                    <DiagnosisAssistantDialog
                      currentValues={formValues}
                      onApplyDiagnoses={handleApplyDiagnoses}
                    />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={control}
                name="bedType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Cama</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Bed className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input placeholder="ej., UCI, General" {...field} className="pl-10" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="bedNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de Cama</FormLabel>
                    <FormControl>
                      <Input placeholder="ej., 101-B" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-gray-200/80">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-700">Personal Clínico</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <FormField
                control={control}
                name="nurseInCharge"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Enfermero Encargado</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input placeholder="Nombre del enfermero" {...field} className="pl-10" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="supervisingNurse"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Enfermero Supervisor</FormLabel>
                     <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input placeholder="Nombre del supervisor" {...field} className="pl-10" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
             <EditablePhysicianList />
          </CardContent>
        </Card>


        <div className="space-y-6">
          <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
            <p className="text-sm font-medium text-gray-600">Sugerencias de IA</p>
            <ComorbiditySuggestionDialog 
              diagnosis={diagnosis}
              existingComorbidities={formValues.comorbidities}
              onApplyComorbidities={handleApplyComorbidities}
            />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <EditableList name="comorbidities" title="Comorbilidades" icon={ShieldPlus} />
            <EditableList name="medications" title="Medicamentos" icon={Pill} />
            <EditableList name="treatments" title="Tratamientos" icon={Activity} />
            <EditableList name="surgicalProcedures" title="Procedimientos Quirúrgicos" icon={Stethoscope} />
            <EditableList name="supplies" title="Suministros o Insumos" icon={Box} />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button type="submit" size="lg">Guardar Paciente</Button>
        </div>
      </form>
    </FormProvider>
  );
}

export default function AddPatientForm() {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        return null;
    }

    return <AddPatientFormContent />;
}

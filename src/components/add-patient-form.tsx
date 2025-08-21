"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { usePatientContext } from '@/context/PatientContext';
import { suggestComorbidities } from '@/ai/flows/comorbidity-suggestion';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Lightbulb, Loader2, User, Stethoscope, Bed, ShieldPlus, Pill, Activity, Box } from 'lucide-react';
import DiagnosisAssistantDialog from './diagnosis-assistant-dialog';
import { EditableList } from './editable-list';

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
});

export type PatientFormValues = z.infer<typeof patientSchema>;

const AddPatientFormContent = () => {
  const router = useRouter();
  const { dispatch } = usePatientContext();
  const { toast } = useToast();
  const [isSuggesting, setIsSuggesting] = useState(false);

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
    },
  });

  const { control, watch, getValues, setValue } = methods;
  const diagnosis = watch('diagnosis');
  const formValues = watch();

  const handleSuggestComorbidities = async () => {
    if (!diagnosis) {
      toast({ title: "Diagnóstico Requerido", description: "Por favor, ingrese un diagnóstico primario primero.", variant: "destructive" });
      return;
    }
    setIsSuggesting(true);
    try {
      const result = await suggestComorbidities({ diagnosis });
      const existing = new Set(getValues('comorbidities').map(c => c.value));
      const toAdd = result.comorbidities.filter(c => !existing.has(c)).map(c => ({ value: c }));

      if (toAdd.length > 0) {
        setValue('comorbidities', [...getValues('comorbidities'), ...toAdd]);
      }
      toast({ title: "Sugerencias Añadidas", description: `${toAdd.length} nuevas comorbilidades sugeridas y añadidas.` });
    } catch (error) {
      toast({ title: "Error de IA", description: "No se pudieron obtener sugerencias.", variant: "destructive" });
    } finally {
      setIsSuggesting(false);
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
    };
    dispatch({ type: 'ADD_PATIENT', payload: newPatient });
    toast({
      title: "Paciente Añadido",
      description: `${data.name} ha sido añadido exitosamente.`,
    });
    router.push('/patients');
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Información del Paciente</CardTitle>
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
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
                      <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="ej., Diabetes Tipo 2" {...field} className="pl-10" />
                    </div>
                    <DiagnosisAssistantDialog
                      currentValues={formValues}
                      setDiagnosis={(value) => setValue('diagnosis', value, { shouldValidate: true })}
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
                        <Bed className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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

        <div className="space-y-4">
          <div className="flex justify-end">
            <Button type="button" variant="outline" onClick={handleSuggestComorbidities} disabled={isSuggesting || !diagnosis}>
              {isSuggesting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lightbulb className="mr-2 h-4 w-4" />}
              Sugerir Comorbilidades
            </Button>
          </div>
          <EditableList name="comorbidities" title="Comorbilidades" icon={ShieldPlus} />
          <EditableList name="medications" title="Medicamentos" icon={Pill} />
          <EditableList name="treatments" title="Tratamientos" icon={Activity} />
          <EditableList name="surgicalProcedures" title="Procedimientos Quirúrgicos" icon={Stethoscope} />
          <EditableList name="supplies" title="Suministros" icon={Box} />
        </div>

        <div className="flex justify-end">
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
        return null; // O un esqueleto/spinner
    }

    return <AddPatientFormContent />;
}

"use client";

import { useForm, FormProvider, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { usePatientContext } from '@/context/PatientContext';
import { type Patient } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { User, Stethoscope, Bed, ShieldPlus, Pill, Activity, Box } from "lucide-react";
import { EditableList } from "./editable-list";
import { EditablePhysicianList } from "./editable-physician-list";


const formSchema = z.object({
  name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres." }),
  diagnosis: z.string().min(1, 'El diagnóstico primario es requerido.'),
  bedType: z.string(),
  bedNumber: z.string(),
  comorbidities: z.array(z.object({ value: z.string() })),
  medications: z.array(z.object({ value: z.string() })),
  treatments: z.array(z.object({ value: z.string() })),
  surgicalProcedures: z.array(z.object({ value: z.string() })),
  supplies: z.array(z.object({ value: z.string() })),
  treatingPhysicians: z.array(z.object({ name: z.string(), specialty: z.string() })),
  nurseInCharge: z.string(),
  supervisingNurse: z.string(),
});

type PatientFormValues = z.infer<typeof formSchema>;

interface EditPatientFormProps {
  patient: Patient;
}

export function EditPatientForm({ patient }: EditPatientFormProps) {
  const router = useRouter();
  const { dispatch } = usePatientContext();
  const { toast } = useToast();

  const methods = useForm<PatientFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: patient.name || "",
      diagnosis: patient.diagnosis || "",
      bedType: patient.bedType || "",
      bedNumber: patient.bedNumber || "",
      comorbidities: patient.comorbidities.map(value => ({ value })) || [],
      medications: patient.medications.map(value => ({ value })) || [],
      treatments: patient.treatments.map(value => ({ value })) || [],
      surgicalProcedures: patient.surgicalProcedures.map(value => ({ value })) || [],
      supplies: patient.supplies.map(value => ({ value })) || [],
      treatingPhysicians: patient.treatingPhysicians || [],
      nurseInCharge: patient.nurseInCharge || "",
      supervisingNurse: patient.supervisingNurse || "",
    },
  });

  function onSubmit(values: PatientFormValues) {
    try {
      const updatedPatient: Patient = {
        ...patient,
        name: values.name,
        diagnosis: values.diagnosis,
        bedType: values.bedType,
        bedNumber: values.bedNumber,
        comorbidities: values.comorbidities.map(i => i.value),
        medications: values.medications.map(i => i.value),
        treatments: values.treatments.map(i => i.value),
        surgicalProcedures: values.surgicalProcedures.map(i => i.value),
        supplies: values.supplies.map(i => i.value),
        treatingPhysicians: values.treatingPhysicians,
        nurseInCharge: values.nurseInCharge,
        supervisingNurse: values.supervisingNurse,
      };
      
      dispatch({ type: 'UPDATE_PATIENT', payload: updatedPatient });
      
      toast({
        title: "Paciente actualizado",
        description: `Los datos de ${values.name} se han actualizado correctamente.`,
      });
      router.push(`/dashboard/patients/${patient.id}`);
    } catch (error) {
      console.error("Error al actualizar el paciente:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el paciente.",
        variant: "destructive",
      });
    }
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Información Básica</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={methods.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
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
              control={methods.control}
              name="diagnosis"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Diagnóstico Primario</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="ej., Diabetes Tipo 2" {...field} className="pl-10" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={methods.control}
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
                control={methods.control}
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
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Personal Clínico</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <FormField
                control={methods.control}
                name="nurseInCharge"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Enfermero Encargado</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Nombre del enfermero" {...field} className="pl-10" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={methods.control}
                name="supervisingNurse"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Enfermero Supervisor</FormLabel>
                     <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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

         <div className="space-y-4">
          <EditableList name="comorbidities" title="Comorbilidades" icon={ShieldPlus} />
          <EditableList name="medications" title="Medicamentos" icon={Pill} />
          <EditableList name="treatments" title="Tratamientos" icon={Activity} />
          <EditableList name="surgicalProcedures" title="Procedimientos Quirúrgicos" icon={Stethoscope} />
          <EditableList name="supplies" title="Suministros o Insumos" icon={Box} />
        </div>
        
        <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
            <Button type="submit">Actualizar Paciente</Button>
        </div>
      </form>
    </FormProvider>
  );
}

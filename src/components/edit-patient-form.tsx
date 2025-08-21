"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { usePatientContext } from '@/context/PatientContext';
import { type Patient } from "@/lib/types";

import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { User, Stethoscope, Bed } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "El nombre debe tener al menos 2 caracteres.",
  }),
  diagnosis: z.string().min(1, 'El diagnóstico primario es requerido.'),
  bedType: z.string(),
  bedNumber: z.string(),
});

type PatientFormValues = z.infer<typeof formSchema>;

interface EditPatientFormProps {
  patient: Patient;
}

export function EditPatientForm({ patient }: EditPatientFormProps) {
  const router = useRouter();
  const { dispatch } = usePatientContext();

  const form = useForm<PatientFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: patient.name || "",
      diagnosis: patient.diagnosis || "",
      bedType: patient.bedType || "",
      bedNumber: patient.bedNumber || "",
    },
  });

  function onSubmit(values: PatientFormValues) {
    try {
      const updatedPatient: Patient = {
        ...patient,
        ...values
      };
      
      dispatch({ type: 'UPDATE_PATIENT', payload: updatedPatient });
      
      toast({
        title: "Paciente actualizado",
        description: `Los datos de ${values.name} se han actualizado correctamente.`,
      });
      router.push(`/patients/${patient.id}`);
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Información Básica</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
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
              control={form.control}
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
                control={form.control}
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
                control={form.control}
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
        
        <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
            <Button type="submit">Actualizar Paciente</Button>
        </div>
      </form>
    </Form>
  );
}

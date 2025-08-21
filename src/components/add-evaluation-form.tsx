"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { usePatientContext } from '@/context/PatientContext';
import { type Patient } from '@/lib/types';
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from '@/components/ui/button';
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const evaluationSchema = z.object({
  procedureName: z.string().min(1, 'Por favor seleccione un procedimiento.'),
  writtenEvaluation: z.string().min(10, 'Se requiere una evaluación escrita.'),
  scaleRating: z.number().min(0).max(1),
  continuousValue: z.coerce.number(),
  dateEvaluated: z.date(),
});

type EvaluationFormValues = z.infer<typeof evaluationSchema>;

interface AddEvaluationFormProps {
  patient: Patient;
  evaluationType: 'treatment' | 'surgical';
}

export default function AddEvaluationForm({ patient, evaluationType }: AddEvaluationFormProps) {
  const router = useRouter();
  const { dispatch } = usePatientContext();
  const { toast } = useToast();

  const availableProcedures = evaluationType === 'treatment' ? patient.treatments : patient.surgicalProcedures;

  const form = useForm<EvaluationFormValues>({
    resolver: zodResolver(evaluationSchema),
    defaultValues: {
      procedureName: '',
      writtenEvaluation: '',
      scaleRating: 0.5,
      continuousValue: 0,
      dateEvaluated: new Date(),
    },
  });
  
  function onSubmit(data: EvaluationFormValues) {
    const newEvaluation = {
      id: crypto.randomUUID(),
      type: evaluationType,
      procedureName: data.procedureName,
      writtenEvaluation: data.writtenEvaluation,
      scaleRating: data.scaleRating,
      continuousValue: data.continuousValue,
      dateEvaluated: data.dateEvaluated.toISOString(),
    };
    dispatch({ type: 'ADD_EVALUATION', payload: { patientId: patient.id, evaluation: newEvaluation } });
    toast({
        title: "Evaluación Añadida",
        description: `Una nueva evaluación de ${evaluationType === 'treatment' ? 'tratamiento' : 'cirugía'} ha sido guardada para ${patient.name}.`,
    });
    router.push(`/patients/${patient.id}`);
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="procedureName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Procedimiento</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione un procedimiento a evaluar" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableProcedures.length > 0 ? (
                        availableProcedures.map((proc) => (
                          <SelectItem key={proc} value={proc}>{proc}</SelectItem>
                        ))
                      ) : (
                        <div className="p-4 text-sm text-muted-foreground">No hay procedimientos disponibles para este tipo.</div>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="writtenEvaluation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Evaluación Escrita</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describa el resultado, observaciones, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="scaleRating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Calificación en Escala: {Math.round(field.value * 100)}%</FormLabel>
                  <FormControl>
                     <Slider
                        defaultValue={[field.value]}
                        min={0}
                        max={1}
                        step={0.01}
                        onValueChange={(value) => field.onChange(value[0])}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="continuousValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor Continuo</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="ej., 85.5" {...field} />
                  </FormControl>
                  <FormDescription>Una métrica o medida específica.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dateEvaluated"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Fecha de Evaluación</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-[240px] pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Elige una fecha</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button type="submit">Guardar Evaluación</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

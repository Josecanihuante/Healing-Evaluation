"use client";

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { diagnosisAssistant, type DiagnosisAssistantOutput } from '@/ai/flows/diagnosis-assistant';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, Wand2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { type PatientFormValues } from './add-patient-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';


const diagnosisSchema = z.object({
  symptoms: z.string().min(10, 'Por favor, proporcione síntomas detallados.'),
  medicalHistory: z.string(),
  otherRelevantInformation: z.string(),
});

type DiagnosisFormValues = z.infer<typeof diagnosisSchema>;

interface DiagnosisAssistantDialogProps {
  currentValues: PatientFormValues;
  setDiagnosis: (diagnosis: string) => void;
}

export default function DiagnosisAssistantDialog({ currentValues, setDiagnosis }: DiagnosisAssistantDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<DiagnosisAssistantOutput | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<DiagnosisFormValues>({
    resolver: zodResolver(diagnosisSchema),
    defaultValues: {
      symptoms: '',
      medicalHistory: '',
      otherRelevantInformation: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
        form.setValue('symptoms', currentValues.diagnosis || '');
    }
  }, [isOpen, currentValues, form]);


  const handleSubmit = useCallback(async () => {
    const isFormValid = await form.trigger();
    if (!isFormValid) {
        return;
    }
    const data = form.getValues();
    setIsLoading(true);
    setResult(null);
    try {
      const assistantResult = await diagnosisAssistant(data);
      setResult(assistantResult);
    } catch (error) {
      console.error('Error del asistente de diagnóstico:', error);
      toast({
        title: 'Error',
        description: 'No se pudo obtener la asistencia de diagnóstico. Por favor, inténtelo de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [form, toast]);
  
  const handleUseDiagnosis = (diagnosis: string) => {
    setDiagnosis(diagnosis);
    setIsOpen(false);
    toast({
        title: 'Diagnóstico Actualizado',
        description: `Se estableció el diagnóstico primario a "${diagnosis}".`,
    });
  }

  const resetDialog = (open: boolean) => {
    if (!open) {
      form.reset();
      setResult(null);
      setIsLoading(false);
    }
    setIsOpen(open);
  }

  return (
    <Dialog open={isOpen} onOpenChange={resetDialog}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline">
          <Wand2 className="mr-2 h-4 w-4" />
          Asistente de IA
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px] flex flex-col max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="text-primary" />
            Asistente de Diagnóstico
          </DialogTitle>
          <DialogDescription>
            Proporcione los detalles del paciente y deje que la IA sugiera posibles diagnósticos. Solo para uso profesional.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-grow overflow-y-auto pr-6 -mr-6">
          {!result ? (
              <Form {...form}>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="symptoms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Síntomas o Diagnóstico Actual</FormLabel>
                        <FormControl>
                          <Textarea placeholder="ej., Tos persistente, fiebre, dificultad para respirar... o un diagnóstico provisional" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="medicalHistory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Historial Médico</FormLabel>
                        <FormControl>
                          <Textarea placeholder="ej., Historial de asma, no fumador..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="otherRelevantInformation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Otra Información Relevante</FormLabel>
                        <FormControl>
                          <Textarea placeholder="ej., Viaje reciente a..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </Form>
          ) : (
            <div className="space-y-4">
              <Card>
                <CardHeader><CardTitle>Diagnósticos Sugeridos</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {result.suggestedDiagnoses.split(',').map(d => d.trim()).filter(Boolean).map(diag => (
                      <Button key={diag} size="sm" variant="secondary" onClick={() => handleUseDiagnosis(diag)}>Usar "{diag}"</Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Niveles de Confianza</CardTitle></CardHeader>
                <CardContent>
                  <p>{result.confidenceLevels}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Pruebas Adicionales Recomendadas</CardTitle></CardHeader>
                <CardContent>
                  <p>{result.additionalTests}</p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        <DialogFooter className="flex-shrink-0 pt-4">
          {!result ? (
            <Button type="button" onClick={handleSubmit} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Obtener Sugerencias
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => setResult(null)}>Atrás</Button>
              <DialogClose asChild>
                  <Button type="button">Cerrar</Button>
              </DialogClose>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

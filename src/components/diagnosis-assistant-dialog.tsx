"use client";

import { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
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
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';


const diagnosisSchema = z.object({
  symptoms: z.string().min(10, 'Por favor, proporcione síntomas detallados.'),
  medicalHistory: z.string(),
  otherRelevantInformation: z.string(),
});

type DiagnosisFormValues = z.infer<typeof diagnosisSchema>;

interface DiagnosisAssistantDialogProps {
  currentValues: PatientFormValues;
  onApplyDiagnoses: (diagnoses: string[]) => void;
}

export default function DiagnosisAssistantDialog({ currentValues, onApplyDiagnoses }: DiagnosisAssistantDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<DiagnosisAssistantOutput | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDiagnoses, setSelectedDiagnoses] = useState<string[]>([]);

  const methods = useForm<DiagnosisFormValues>({
    resolver: zodResolver(diagnosisSchema),
    defaultValues: {
      symptoms: '',
      medicalHistory: '',
      otherRelevantInformation: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
        methods.setValue('symptoms', currentValues.diagnosis || '');
    }
  }, [isOpen, currentValues, methods]);

  const handleGetSuggestions = async () => {
    const isValid = await methods.trigger();
    if (!isValid) return;
    
    const data = methods.getValues();
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
  };
  
  const handleUseDiagnoses = () => {
    onApplyDiagnoses(selectedDiagnoses);
    setIsOpen(false);
  }

  const resetDialog = (open: boolean) => {
    if (!open) {
      methods.reset();
      setResult(null);
      setIsLoading(false);
      setSelectedDiagnoses([]);
    }
    setIsOpen(open);
  }

  const handleDiagnosisSelection = (diagnosis: string, checked: boolean) => {
    setSelectedDiagnoses(prev => {
        if (checked) {
            return [...prev, diagnosis];
        } else {
            return prev.filter(d => d !== diagnosis);
        }
    });
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
              <FormProvider {...methods}>
                <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                  <FormField
                    control={methods.control}
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
                    control={methods.control}
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
                    control={methods.control}
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
                </form>
              </FormProvider>
          ) : (
            <div className="space-y-4">
              <Card>
                <CardHeader><CardTitle>Diagnósticos Sugeridos</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                    <p className="text-sm text-muted-foreground">Seleccione los diagnósticos a aplicar. El primero que seleccione será el diagnóstico principal.</p>
                    {result.suggestedDiagnoses.split(/, | y /).map(d => d.trim()).filter(Boolean).map(diag => (
                      <div key={diag} className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent/50">
                        <Checkbox 
                            id={diag}
                            onCheckedChange={(checked) => handleDiagnosisSelection(diag, checked as boolean)}
                            checked={selectedDiagnoses.includes(diag)}
                        />
                        <Label htmlFor={diag} className="font-normal flex-1 cursor-pointer">{diag}</Label>
                      </div>
                    ))}
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

        <DialogFooter className="flex-shrink-0 pt-4 border-t mt-4">
          {!result ? (
            <Button type="button" onClick={handleGetSuggestions} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Obtener Sugerencias
            </Button>
          ) : (
            <div className="w-full flex justify-between">
              <Button variant="outline" onClick={() => setResult(null)}>Atrás</Button>
               <div className="flex gap-2">
                  <Button type="button" variant="secondary" onClick={resetDialog}>Cerrar</Button>
                  <Button type="button" onClick={handleUseDiagnoses} disabled={selectedDiagnoses.length === 0}>
                    Usar Diagnósticos Seleccionados ({selectedDiagnoses.length})
                  </Button>
               </div>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

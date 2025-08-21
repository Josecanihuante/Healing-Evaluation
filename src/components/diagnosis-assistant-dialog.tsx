"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { diagnosisAssistant, type DiagnosisAssistantOutput } from '@/ai/flows/diagnosis-assistant';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, Wand2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { type PatientFormValues } from './add-patient-form';

const diagnosisSchema = z.object({
  symptoms: z.string().min(10, 'Please provide detailed symptoms.'),
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


  async function onSubmit(data: DiagnosisFormValues) {
    setIsLoading(true);
    setResult(null);
    try {
      const assistantResult = await diagnosisAssistant(data);
      setResult(assistantResult);
    } catch (error) {
      console.error('Diagnosis assistant error:', error);
      toast({
        title: 'Error',
        description: 'Failed to get diagnosis assistance. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }
  
  const handleUseDiagnosis = (diagnosis: string) => {
    setDiagnosis(diagnosis);
    setIsOpen(false);
    toast({
        title: 'Diagnosis Updated',
        description: `Set primary diagnosis to "${diagnosis}".`,
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
          AI Assistant
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px] flex flex-col max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="text-primary" />
            Diagnosis Assistant
          </DialogTitle>
          <DialogDescription>
            Provide patient details and let AI suggest possible diagnoses. For professional use only.
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
                        <FormLabel>Symptoms or Current Diagnosis</FormLabel>
                        <FormControl>
                          <Textarea placeholder="e.g., Persistent cough, fever, shortness of breath... or a working diagnosis" {...field} />
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
                        <FormLabel>Medical History</FormLabel>
                        <FormControl>
                          <Textarea placeholder="e.g., History of asthma, non-smoker..." {...field} />
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
                        <FormLabel>Other Relevant Information</FormLabel>
                        <FormControl>
                          <Textarea placeholder="e.g., Recent travel to..." {...field} />
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
                <CardHeader><CardTitle>Suggested Diagnoses</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {result.suggestedDiagnoses.split(',').map(d => d.trim()).filter(Boolean).map(diag => (
                      <Button key={diag} size="sm" variant="secondary" onClick={() => handleUseDiagnosis(diag)}>Use "{diag}"</Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Confidence Levels</CardTitle></CardHeader>
                <CardContent>
                  <p>{result.confidenceLevels}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Recommended Additional Tests</CardTitle></CardHeader>
                <CardContent>
                  <p>{result.additionalTests}</p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        <DialogFooter className="flex-shrink-0">
          {!result ? (
            <Button type="button" onClick={form.handleSubmit(onSubmit)} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Get Suggestions
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => setResult(null)}>Back</Button>
              <DialogClose asChild>
                  <Button type="button">Close</Button>
              </DialogClose>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

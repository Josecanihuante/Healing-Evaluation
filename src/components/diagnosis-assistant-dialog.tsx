"use client";

import { useState } from 'react';
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
import { Badge } from './ui/badge';

const diagnosisSchema = z.object({
  symptoms: z.string().min(10, 'Please provide detailed symptoms.'),
  medicalHistory: z.string(),
  otherRelevantInformation: z.string(),
});

type DiagnosisFormValues = z.infer<typeof diagnosisSchema>;

interface DiagnosisAssistantDialogProps {
  setDiagnosis: (diagnosis: string) => void;
}

export default function DiagnosisAssistantDialog({ setDiagnosis }: DiagnosisAssistantDialogProps) {
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

  const resetDialog = () => {
    form.reset();
    setResult(null);
    setIsLoading(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if(!open) resetDialog(); setIsOpen(open); }}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline">
          <Wand2 className="mr-2 h-4 w-4" />
          AI Assistant
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="text-primary" />
            Diagnosis Assistant
          </DialogTitle>
          <DialogDescription>
            Provide patient details and let AI suggest possible diagnoses. For professional use only.
          </DialogDescription>
        </DialogHeader>
        
        {!result ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="symptoms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Symptoms</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., Persistent cough, fever, shortness of breath..." {...field} />
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
              <DialogFooter>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Get Suggestions
                </Button>
              </DialogFooter>
            </form>
          </Form>
        ) : (
          <div className="space-y-4 py-4">
            <Card>
              <CardHeader><CardTitle>Suggested Diagnoses</CardTitle></CardHeader>
              <CardContent>
                <p>{result.suggestedDiagnoses}</p>
                <div className="flex gap-2 mt-2">
                  {result.suggestedDiagnoses.split(',').map(d => d.trim()).map(diag => (
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
            <DialogFooter>
                <Button variant="outline" onClick={resetDialog}>Start Over</Button>
                <DialogClose asChild>
                    <Button type="button">Close</Button>
                </DialogClose>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

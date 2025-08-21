"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { usePatientContext } from '@/context/PatientContext';
import { suggestComorbidities } from '@/ai/flows/comorbidity-suggestion';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Lightbulb, Loader2, User, Stethoscope, Bed, CirclePlus, Trash2 } from 'lucide-react';
import DiagnosisAssistantDialog from './diagnosis-assistant-dialog';

const patientSchema = z.object({
  name: z.string().min(1, 'Patient name is required.'),
  diagnosis: z.string().min(1, 'Primary diagnosis is required.'),
  comorbidities: z.array(z.string()),
  medications: z.array(z.string()),
  treatments: z.array(z.string()),
  surgicalProcedures: z.array(z.string()),
  supplies: z.array(z.string()),
  bedType: z.string(),
  bedNumber: z.string(),
});

export type PatientFormValues = z.infer<typeof patientSchema>;

const EditableList = ({ control, name, title, icon: Icon }: { control: any, name: keyof Omit<PatientFormValues, 'name' | 'diagnosis' | 'bedType' | 'bedNumber'>, title: string, icon: React.ElementType }) => {
  const { fields, append, remove } = useFieldArray({ control, name });
  const [inputValue, setInputValue] = useState('');

  const handleAdd = () => {
    if (inputValue.trim()) {
      append(inputValue.trim() as never);
      setInputValue('');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <Icon className="w-5 h-5 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); handleAdd();}}}
            placeholder={`Add a ${title.toLowerCase().slice(0, -1)}...`}
            className="flex-grow"
          />
          <Button type="button" onClick={handleAdd}><CirclePlus className="w-4 h-4 mr-2" />Add</Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-center gap-1 bg-secondary text-secondary-foreground rounded-full px-3 py-1 text-sm">
              <span>{field.value as string}</span>
              <button type="button" onClick={() => remove(index)} className="text-muted-foreground hover:text-destructive">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
         {fields.length === 0 && <p className="text-sm text-muted-foreground mt-2">No {title.toLowerCase()} added yet.</p>}
      </CardContent>
    </Card>
  );
};


export default function AddPatientForm() {
  const router = useRouter();
  const { dispatch } = usePatientContext();
  const { toast } = useToast();
  const [isSuggesting, setIsSuggesting] = useState(false);
  
  const form = useForm<PatientFormValues>({
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

  const { control, watch } = form;
  const diagnosis = watch('diagnosis');
  const formValues = watch();

  const handleSuggestComorbidities = async () => {
    if (!diagnosis) {
        toast({ title: "Diagnosis Needed", description: "Please enter a primary diagnosis first.", variant: "destructive" });
        return;
    }
    setIsSuggesting(true);
    try {
        const result = await suggestComorbidities({ diagnosis });
        const existing = new Set(form.getValues('comorbidities'));
        const toAdd = result.comorbidities.filter(c => !existing.has(c));
        
        if(toAdd.length > 0) {
            form.setValue('comorbidities', [...form.getValues('comorbidities'), ...toAdd]);
        }
        toast({ title: "Suggestions Added", description: `${toAdd.length} new comorbidities suggested and added.` });
    } catch (error) {
        toast({ title: "AI Error", description: "Could not fetch suggestions.", variant: "destructive" });
    } finally {
        setIsSuggesting(false);
    }
  };


  function onSubmit(data: PatientFormValues) {
    const newPatient = {
      ...data,
      id: crypto.randomUUID(),
      evaluations: [],
    };
    dispatch({ type: 'ADD_PATIENT', payload: newPatient });
    toast({
      title: "Patient Added",
      description: `${data.name} has been successfully added.`,
    });
    router.push('/patients');
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Patient Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Patient Name</FormLabel>
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
                  <FormLabel>Primary Diagnosis</FormLabel>
                    <div className="flex gap-2 items-start">
                        <div className="relative flex-grow">
                            <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="e.g., Type 2 Diabetes" {...field} className="pl-10" />
                        </div>
                        <DiagnosisAssistantDialog 
                            currentValues={formValues}
                            setDiagnosis={(value) => form.setValue('diagnosis', value, { shouldValidate: true })} 
                        />
                    </div>
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
                    <FormLabel>Bed Type</FormLabel>
                    <FormControl>
                      <div className="relative">
                         <Bed className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                         <Input placeholder="e.g., ICU, General" {...field} className="pl-10" />
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
                    <FormLabel>Bed Number</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 101-B" {...field} />
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
                    Suggest Comorbidities
                </Button>
            </div>
          <EditableList control={control} name="comorbidities" title="Comorbidities" icon={Stethoscope} />
          <EditableList control={control} name="medications" title="Medications" icon={User} />
          <EditableList control={control} name="treatments" title="Treatments" icon={User} />
          <EditableList control={control} name="surgicalProcedures" title="Surgical Procedures" icon={User} />
          <EditableList control={control} name="supplies" title="Supplies" icon={User} />
        </div>

        <div className="flex justify-end">
          <Button type="submit" size="lg">Save Patient</Button>
        </div>
      </form>
    </Form>
  );
}

"use client"; // This is a Client Component

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel, // You can also import FormLabel here
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "@radix-ui/react-icons";
import { Patient } from "@/lib/types"; // Assuming you have a Patient type
import { useParams } from 'next/navigation' // Import useParams

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  dateOfBirth: z.date({
    required_error: "A date of birth is required.",
  }),
  // Add other relevant patient fields with validation
  // e.g., address: z.string().optional(),
  //       phone: z.string().optional(),
});

type PatientFormValues = z.infer<typeof formSchema>;

import { usePatientContext } from '@/context/PatientContext'; // Import usePatientContext
import { useEffect } from 'react'; // Import useEffect

interface EditPatientFormProps {}

export function EditPatientForm({ patient, onUpdate }: EditPatientFormProps) {
  const params = useParams(); // Get the params from the URL
  const patientId = params.id as string; // Extract patient ID
  const router = useRouter();
  const { patients, updatePatient } = usePatientContext(); // Get patients and updatePatient from context

  const form = useForm<PatientFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      // Default values will be set in useEffect
      // based on fetched data
      name: patient.name || "",
      dateOfBirth: patient.dateOfBirth ? new Date(patient.dateOfBirth) : undefined,
      // Set default values for other fields
    },
  });

  async function onSubmit(values: PatientFormValues) {
    const patientToUpdate = patients.find(p => p.id === patientId);
    if (!patientToUpdate) {
      toast({
        title: "Patient not found.",
        variant: "destructive",
      });
      return;
    }
    try {
      await updatePatient(patientId, values);
      toast({
        title: "Patient updated successfully.",
      });
      router.push(`/patients/${patientId}`); // Redirect to the patient detail page
    } catch (error) {
      console.error("Error updating patient:", error);
      toast({
      variant: "destructive",
    });
  }



  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Patient Name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="dateOfBirth"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date of birth</FormLabel>
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
                        <span>Pick a date</span>
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
        {/* Add other form fields here */}
        <Button type="submit">Update Patient</Button>
      </form>
    </Form>
  );
}
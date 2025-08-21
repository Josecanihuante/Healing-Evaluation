"use client";

import { useState } from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import type { PatientFormValues } from './add-patient-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { CirclePlus, Trash2, Stethoscope } from 'lucide-react';
import { FormItem, FormLabel } from './ui/form';

export const EditablePhysicianList = () => {
  const { control } = useFormContext<PatientFormValues>();
  const { fields, append, remove } = useFieldArray({ control, name: "treatingPhysicians" });
  const [name, setName] = useState('');
  const [specialty, setSpecialty] = useState('');

  const handleAdd = () => {
    if (name.trim() && specialty.trim()) {
      append({ name: name.trim(), specialty: specialty.trim() });
      setName('');
      setSpecialty('');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <Stethoscope className="w-5 h-5 text-primary" />
          Médico(s) Tratante(s)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <FormItem>
                <FormLabel>Nombre del Médico</FormLabel>
                <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Dr. John Doe"
                />
            </FormItem>
            <FormItem>
                <FormLabel>Especialidad</FormLabel>
                <Input
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    placeholder="Cardiología"
                />
            </FormItem>
        </div>
        <Button type="button" onClick={handleAdd} className="mb-4"><CirclePlus className="w-4 h-4 mr-2" />Añadir Médico</Button>
        
        <div className="space-y-2">
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-center justify-between gap-2 bg-secondary text-secondary-foreground rounded-md px-3 py-2 text-sm">
                <div>
                    <span className="font-semibold">{(field as { name: string }).name}</span>
                    <span className="text-muted-foreground ml-2">({(field as { specialty: string }).specialty})</span>
                </div>
              <button type="button" onClick={() => remove(index)} className="text-muted-foreground hover:text-destructive">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        {fields.length === 0 && <p className="text-sm text-muted-foreground mt-2">No se han añadido médicos aún.</p>}
      </CardContent>
    </Card>
  );
};

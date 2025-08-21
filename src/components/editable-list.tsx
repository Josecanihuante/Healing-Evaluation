"use client";

import { useState } from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import type { PatientFormValues } from './add-patient-form'; // Asegúrate que esta ruta es correcta y el tipo es exportado
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { CirclePlus, Trash2 } from 'lucide-react';

interface EditableListProps {
  name: "comorbidities" | "medications" | "treatments" | "surgicalProcedures" | "supplies";
  title: string;
  icon: React.ElementType;
}

export const EditableList = ({ name, title, icon: Icon }: EditableListProps) => {
  const { control } = useFormContext<PatientFormValues>();
  const { fields, append, remove } = useFieldArray({ control, name });
  const [inputValue, setInputValue] = useState('');

  const handleAdd = () => {
    if (inputValue.trim()) {
      append({ value: inputValue.trim() });
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
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAdd(); } }}
            placeholder={`Añadir un ${title.toLowerCase().slice(0, -1)}...`}
            className="flex-grow"
          />
          <Button type="button" onClick={handleAdd}><CirclePlus className="w-4 h-4 mr-2" />Añadir</Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-center gap-1 bg-secondary text-secondary-foreground rounded-full px-3 py-1 text-sm">
              <span>{(field as { value: string }).value}</span>
              <button type="button" onClick={() => remove(index)} className="text-muted-foreground hover:text-destructive">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
        {fields.length === 0 && <p className="text-sm text-muted-foreground mt-2">No se han añadido {title.toLowerCase()} aún.</p>}
      </CardContent>
    </Card>
  );
};

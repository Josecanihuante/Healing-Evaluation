"use client";

import { useState } from 'react';
import { suggestComorbidities, type SuggestComorbiditiesOutput } from '@/ai/flows/comorbidity-suggestion';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Lightbulb } from 'lucide-react';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Card, CardContent } from './ui/card';

interface ComorbiditySuggestionDialogProps {
  diagnosis: string;
  existingComorbidities: { value: string }[];
  onApplyComorbidities: (selected: string[]) => void;
}

export default function ComorbiditySuggestionDialog({ diagnosis, existingComorbidities, onApplyComorbidities }: ComorbiditySuggestionDialogProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SuggestComorbiditiesOutput | null>(null);
  const [selectedComorbidities, setSelectedComorbidities] = useState<string[]>([]);

  const handleGetSuggestions = async () => {
    if (!diagnosis) {
      toast({ title: "Diagnóstico Requerido", description: "Por favor, ingrese un diagnóstico primario primero.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setResult(null);
    try {
      const aiResult = await suggestComorbidities({ diagnosis });
      const existing = new Set(existingComorbidities.map(c => c.value));
      aiResult.comorbidities = aiResult.comorbidities.filter(c => !existing.has(c));
      setResult(aiResult);
    } catch (error) {
      console.error('Error del asistente de comorbilidades:', error);
      toast({
        title: 'Error de IA',
        description: 'No se pudieron obtener sugerencias.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelection = (comorbidity: string, checked: boolean) => {
    setSelectedComorbidities(prev => 
      checked ? [...prev, comorbidity] : prev.filter(c => c !== comorbidity)
    );
  };
  
  const handleApply = () => {
    onApplyComorbidities(selectedComorbidities);
    setIsOpen(false);
  };

  const resetDialog = (open: boolean) => {
    if (!open) {
      setResult(null);
      setIsLoading(false);
      setSelectedComorbidities([]);
    }
    setIsOpen(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={resetDialog}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" onClick={() => !isOpen && handleGetSuggestions()} disabled={!diagnosis || isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lightbulb className="mr-2 h-4 w-4" />}
          Sugerir Comorbilidades
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Sugerencias de Comorbilidades</DialogTitle>
          <DialogDescription>
            Seleccione las comorbilidades relevantes para añadir al paciente. Las sugerencias se basan en el diagnóstico de "{diagnosis}".
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[50vh] overflow-y-auto p-1">
          {isLoading && <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}
          
          {result && (
            <Card>
              <CardContent className="pt-6 space-y-2">
                {result.comorbidities.length > 0 ? (
                  result.comorbidities.map(comorbidity => (
                    <div key={comorbidity} className="flex items-center space-x-3 p-2 rounded-md hover:bg-accent/50">
                      <Checkbox 
                        id={`comorbidity-${comorbidity}`}
                        onCheckedChange={(checked) => handleSelection(comorbidity, checked as boolean)}
                        checked={selectedComorbidities.includes(comorbidity)}
                      />
                      <Label htmlFor={`comorbidity-${comorbidity}`} className="font-normal flex-1 cursor-pointer">{comorbidity}</Label>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-center text-muted-foreground p-4">No se encontraron nuevas comorbilidades sugeridas o ya han sido añadidas.</p>
                )}
              </CardContent>
            </Card>
          )}

          {result === null && !isLoading && (
              <div className="text-center py-8 text-sm text-muted-foreground">
                  Haga clic en "Sugerir Comorbilidades" para comenzar.
              </div>
          )}
        </div>

        <DialogFooter>
            <DialogClose asChild>
                <Button type="button" variant="secondary">Cerrar</Button>
            </DialogClose>
            <Button 
                type="button" 
                onClick={handleApply} 
                disabled={selectedComorbidities.length === 0}
            >
                Añadir Seleccionadas ({selectedComorbidities.length})
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

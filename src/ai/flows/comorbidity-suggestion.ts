'use server';

/**
 * @fileOverview An AI agent that suggests potential comorbidities based on a patient's primary diagnosis.
 *
 * - suggestComorbidities - A function that suggests comorbidities for a given diagnosis.
 * - SuggestComorbiditiesInput - The input type for the suggestComorbidities function.
 * - SuggestComorbiditiesOutput - The return type for the suggestComorbidities function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestComorbiditiesInputSchema = z.object({
  diagnosis: z.string().describe('The primary diagnosis of the patient.'),
});
export type SuggestComorbiditiesInput = z.infer<typeof SuggestComorbiditiesInputSchema>;

const SuggestComorbiditiesOutputSchema = z.object({
  comorbidities: z
    .array(z.string())
    .describe('A list of potential comorbidities related to the diagnosis.'),
});
export type SuggestComorbiditiesOutput = z.infer<typeof SuggestComorbiditiesOutputSchema>;

export async function suggestComorbidities(input: SuggestComorbiditiesInput): Promise<SuggestComorbiditiesOutput> {
  return suggestComorbiditiesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestComorbiditiesPrompt',
  input: {schema: SuggestComorbiditiesInputSchema},
  output: {schema: SuggestComorbiditiesOutputSchema},
  prompt: `Eres un asistente médico experto. Dado el diagnóstico principal de un paciente, sugerirás posibles comorbilidades que el paciente también pueda tener. Proporciona una lista de comorbilidades relacionadas con el siguiente diagnóstico. Todas tus respuestas deben estar en español.\n\nDiagnóstico: {{{diagnosis}}}`,
});

const suggestComorbiditiesFlow = ai.defineFlow(
  {
    name: 'suggestComorbiditiesFlow',
    inputSchema: SuggestComorbiditiesInputSchema,
    outputSchema: SuggestComorbiditiesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

// diagnosis-assistant.ts
'use server';

/**
 * @fileOverview An AI-assisted tool to help healthcare professionals generate more accurate diagnoses.
 *
 * - diagnosisAssistant - A function that handles the diagnosis assistance process.
 * - DiagnosisAssistantInput - The input type for the diagnosisAssistant function.
 * - DiagnosisAssistantOutput - The return type for the diagnosisAssistant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DiagnosisAssistantInputSchema = z.object({
  symptoms: z.string().describe('The symptoms presented by the patient.'),
  medicalHistory: z.string().describe('The medical history of the patient.'),
  otherRelevantInformation: z.string().describe('Any other relevant information about the patient.'),
});
export type DiagnosisAssistantInput = z.infer<typeof DiagnosisAssistantInputSchema>;

const DiagnosisAssistantOutputSchema = z.object({
  suggestedDiagnoses: z.string().describe('A list of suggested diagnoses based on the input information.'),
  confidenceLevels: z.string().describe('The confidence levels for each suggested diagnosis.'),
  additionalTests: z.string().describe('A list of additional tests that may be helpful in confirming the diagnosis.'),
});
export type DiagnosisAssistantOutput = z.infer<typeof DiagnosisAssistantOutputSchema>;

export async function diagnosisAssistant(input: DiagnosisAssistantInput): Promise<DiagnosisAssistantOutput> {
  return diagnosisAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'diagnosisAssistantPrompt',
  input: {schema: DiagnosisAssistantInputSchema},
  output: {schema: DiagnosisAssistantOutputSchema},
  prompt: `Eres una herramienta de asistencia por IA para ayudar a los profesionales de la salud a generar diagnósticos más precisos.

  Basándote en los síntomas, el historial médico y otra información relevante proporcionada, sugiere una lista de posibles diagnósticos, los niveles de confianza para cada uno y las pruebas adicionales que podrían ser útiles para confirmar el diagnóstico. Todas tus respuestas deben estar en español.

  Síntomas: {{{symptoms}}}
  Historial Médico: {{{medicalHistory}}}
  Otra Información Relevante: {{{otherRelevantInformation}}}

  Proporciona la salida en un formato estructurado.
  `,
});

const diagnosisAssistantFlow = ai.defineFlow(
  {
    name: 'diagnosisAssistantFlow',
    inputSchema: DiagnosisAssistantInputSchema,
    outputSchema: DiagnosisAssistantOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

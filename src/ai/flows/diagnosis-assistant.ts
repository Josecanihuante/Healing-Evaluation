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
  prompt: `You are an AI-assisted tool to help healthcare professionals generate more accurate diagnoses.

  Based on the symptoms, medical history, and other relevant information provided, suggest a list of possible diagnoses, confidence levels for each diagnosis, and additional tests that may be helpful in confirming the diagnosis.

  Symptoms: {{{symptoms}}}
  Medical History: {{{medicalHistory}}}
  Other Relevant Information: {{{otherRelevantInformation}}}

  Provide the output in a structured format.
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

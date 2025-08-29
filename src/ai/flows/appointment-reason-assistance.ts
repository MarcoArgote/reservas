'use server';

/**
 * @fileOverview A flow to assist users in elaborating on the reason for their appointment.
 *
 * - appointmentReasonAssistance - A function that handles the appointment reason elaboration process.
 * - AppointmentReasonAssistanceInput - The input type for the appointmentReasonAssistance function.
 * - AppointmentReasonAssistanceOutput - The return type for the appointmentReasonAssistance function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AppointmentReasonAssistanceInputSchema = z.object({
  reason: z
    .string()
    .describe("The user's initial reason for the appointment."),
});
export type AppointmentReasonAssistanceInput = z.infer<typeof AppointmentReasonAssistanceInputSchema>;

const AppointmentReasonAssistanceOutputSchema = z.object({
  elaboration: z
    .string()
    .describe('The elaborated reason for the appointment.'),
});
export type AppointmentReasonAssistanceOutput = z.infer<typeof AppointmentReasonAssistanceOutputSchema>;

export async function appointmentReasonAssistance(input: AppointmentReasonAssistanceInput): Promise<AppointmentReasonAssistanceOutput> {
  return appointmentReasonAssistanceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'appointmentReasonAssistancePrompt',
  input: {schema: AppointmentReasonAssistanceInputSchema},
  output: {schema: AppointmentReasonAssistanceOutputSchema},
  prompt: `Eres un asistente de IA que ayuda a los usuarios a dar más detalles sobre el motivo de su cita.

  Dado el motivo inicial del usuario, proporciona una explicación más detallada y elaborada.
  
  Elabora la respuesta en español.

  Motivo inicial: {{{reason}}}

  Motivo elaborado:`,
});

const appointmentReasonAssistanceFlow = ai.defineFlow(
  {
    name: 'appointmentReasonAssistanceFlow',
    inputSchema: AppointmentReasonAssistanceInputSchema,
    outputSchema: AppointmentReasonAssistanceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

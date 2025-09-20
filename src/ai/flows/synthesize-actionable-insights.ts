'use server';

/**
 * @fileOverview AI flow for synthesizing key startup information and generating concise, actionable insights.
 *
 * - synthesizeActionableInsights - A function that handles the startup evaluation process.
 * - SynthesizeActionableInsightsInput - The input type for the synthesizeActionableInsights function.
 * - SynthesizeActionableInsightsOutput - The return type for the synthesizeActionableInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SynthesizeActionableInsightsInputSchema = z.object({
  founderMaterials: z
    .string()
    .describe('Founder materials, pitch decks, and financial projections.'),
  publicData: z.string().describe('Aggregated public data about the startup.'),
});
export type SynthesizeActionableInsightsInput = z.infer<
  typeof SynthesizeActionableInsightsInputSchema
>;

const SynthesizeActionableInsightsOutputSchema = z.object({
  swotAnalysis: z.object({
    strengths: z.string().describe('Strengths of the startup.'),
    weaknesses: z.string().describe('Weaknesses of the startup.'),
    opportunities: z.string().describe('Opportunities for the startup.'),
    threats: z.string().describe('Threats to the startup.'),
  }).describe('SWOT analysis of the startup.'),
  investmentInsights: z.string().describe('Actionable investment insights.'),
});
export type SynthesizeActionableInsightsOutput = z.infer<
  typeof SynthesizeActionableInsightsOutputSchema
>;

export async function synthesizeActionableInsights(
  input: SynthesizeActionableInsightsInput
): Promise<SynthesizeActionableInsightsOutput> {
  return synthesizeActionableInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'synthesizeActionableInsightsPrompt',
  input: {schema: SynthesizeActionableInsightsInputSchema},
  output: {schema: SynthesizeActionableInsightsOutputSchema},
  prompt: `You are an expert investment analyst evaluating startups.

  Based on the provided founder materials and aggregated public data, synthesize key information and generate concise, actionable insights tailored for investors.  Provide a SWOT analysis (strengths, weaknesses, opportunities, and threats) and overall investment insights.

  Founder Materials: {{{founderMaterials}}}
  Public Data: {{{publicData}}}

  Format your output as a JSON object with a swotAnalysis field containing strengths, weaknesses, opportunities, and threats, and an investmentInsights field containing actionable investment insights.
`,
});

const synthesizeActionableInsightsFlow = ai.defineFlow(
  {
    name: 'synthesizeActionableInsightsFlow',
    inputSchema: SynthesizeActionableInsightsInputSchema,
    outputSchema: SynthesizeActionableInsightsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

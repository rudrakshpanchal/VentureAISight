'use server';

/**
 * @fileOverview This file defines the Genkit flow for generating a startup evaluation based on uploaded documents and aggregated data.
 *
 * - generateStartupEvaluation - A function that takes startup data as input and returns an evaluation.
 * - GenerateStartupEvaluationInput - The input type for the generateStartupEvaluation function.
 * - GenerateStartupEvaluationOutput - The return type for the generateStartupEvaluation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateStartupEvaluationInputSchema = z.object({
  founderMaterials: z.string().describe('Founder materials, such as pitch decks and financial projections.'),
  aggregatedData: z.string().describe('Aggregated data about the startup, industry trends, and competitor analysis.'),
});
export type GenerateStartupEvaluationInput = z.infer<typeof GenerateStartupEvaluationInputSchema>;

const GenerateStartupEvaluationOutputSchema = z.object({
  evaluation: z.string().describe('A comprehensive evaluation of the startup, including market analysis, competitive landscape, team assessment, SWOT analysis, risk assessment, and investment viability.'),
});
export type GenerateStartupEvaluationOutput = z.infer<typeof GenerateStartupEvaluationOutputSchema>;

export async function generateStartupEvaluation(input: GenerateStartupEvaluationInput): Promise<GenerateStartupEvaluationOutput> {
  return generateStartupEvaluationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateStartupEvaluationPrompt',
  input: {schema: GenerateStartupEvaluationInputSchema},
  output: {schema: GenerateStartupEvaluationOutputSchema},
  prompt: `You are an experienced venture capital analyst.

  Evaluate the startup based on the following information:

  Founder Materials: {{{founderMaterials}}}
  Aggregated Data: {{{aggregatedData}}}

  Provide a comprehensive evaluation of the startup, including:

  - Market Analysis: Assess the market size, growth potential, and trends.
  - Competitive Landscape: Analyze the competitive environment and the startup's position.
  - Team Assessment: Evaluate the strength and experience of the founding team.
  - SWOT Analysis: Identify the startup's strengths, weaknesses, opportunities, and threats.
  - Risk Assessment: Identify potential risks associated with the investment and suggest mitigation strategies.
  - Investment Viability: Determine the overall investment viability of the startup.
  `,
});

const generateStartupEvaluationFlow = ai.defineFlow(
  {
    name: 'generateStartupEvaluationFlow',
    inputSchema: GenerateStartupEvaluationInputSchema,
    outputSchema: GenerateStartupEvaluationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

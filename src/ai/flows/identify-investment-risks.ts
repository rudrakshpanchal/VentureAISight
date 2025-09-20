'use server';
/**
 * @fileOverview Identifies potential risks associated with a startup investment and suggests mitigation strategies.
 *
 * - identifyInvestmentRisks - A function that analyzes startup data and provides risk assessment.
 * - IdentifyInvestmentRisksInput - The input type for the identifyInvestmentRisks function.
 * - IdentifyInvestmentRisksOutput - The return type for the identifyInvestmentRisks function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IdentifyInvestmentRisksInputSchema = z.object({
  founderMaterials: z.string().describe('Founder materials and pitch decks.'),
  financialProjections: z.string().describe('Financial projections of the startup.'),
  marketData: z.string().describe('Aggregated market data about the startup.'),
  competitiveLandscape: z.string().describe('Analysis of the competitive landscape.'),
});

export type IdentifyInvestmentRisksInput = z.infer<typeof IdentifyInvestmentRisksInputSchema>;

const IdentifyInvestmentRisksOutputSchema = z.object({
  risks: z.array(
    z.object({
      risk: z.string().describe('Identified risk associated with the investment.'),
      mitigationStrategy: z.string().describe('Suggested mitigation strategy for the risk.'),
    })
  ).describe('List of identified risks and mitigation strategies.'),
});

export type IdentifyInvestmentRisksOutput = z.infer<typeof IdentifyInvestmentRisksOutputSchema>;

export async function identifyInvestmentRisks(input: IdentifyInvestmentRisksInput): Promise<IdentifyInvestmentRisksOutput> {
  return identifyInvestmentRisksFlow(input);
}

const prompt = ai.definePrompt({
  name: 'identifyInvestmentRisksPrompt',
  input: {schema: IdentifyInvestmentRisksInputSchema},
  output: {schema: IdentifyInvestmentRisksOutputSchema},
  prompt: `You are an investment analyst specializing in identifying risks associated with startup investments.

  Analyze the provided startup data and identify potential risks. For each risk, suggest a mitigation strategy.

  Founder Materials: {{{founderMaterials}}}
  Financial Projections: {{{financialProjections}}}
  Market Data: {{{marketData}}}
  Competitive Landscape: {{{competitiveLandscape}}}

  Format your response as a list of risks and mitigation strategies.
  `,
});

const identifyInvestmentRisksFlow = ai.defineFlow(
  {
    name: 'identifyInvestmentRisksFlow',
    inputSchema: IdentifyInvestmentRisksInputSchema,
    outputSchema: IdentifyInvestmentRisksOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

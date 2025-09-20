'use server';

import { generateStartupEvaluation } from '@/ai/flows/generate-startup-evaluation';
import { identifyInvestmentRisks } from '@/ai/flows/identify-investment-risks';
import { synthesizeActionableInsights } from '@/ai/flows/synthesize-actionable-insights';
import type { EvaluationResult } from '@/lib/types';
import {z} from 'zod';
import {ai} from '@/ai/genkit';
import { deleteFile, getFileContents } from '@/lib/firebase/storage';


async function extractTextFromDataUri(dataUri: string): Promise<string> {
    const {output} = await ai.generate({
        prompt: `Extract all text from this document.
        {{media url="${dataUri}"}}
        `,
        model: 'googleai/gemini-2.5-flash',
    });
    return output?.text ?? '';
}

const FormSchema = z.object({
  startupName: z.string().min(1, 'Startup name is required.'),
  pitch: z.string().min(1, 'Pitch is required.'),
  uploadedFiles: z.string().optional(),
});

export async function performEvaluation(formData: FormData): Promise<EvaluationResult> {
  const rawData = Object.fromEntries(formData.entries());

  const validation = FormSchema.safeParse(rawData);

  if (!validation.success) {
    return { success: false, error: validation.error.errors.map(e => e.message).join(', ') };
  }
  
  const { startupName, pitch, uploadedFiles } = validation.data;

  let uploadedFileContents = '';
  const filePaths: string[] = uploadedFiles ? JSON.parse(uploadedFiles).map((file: any) => file.path) : [];

  try {
    if (filePaths.length > 0) {
      const fileContents = await Promise.all(filePaths.map(path => getFileContents(path)));
      const extractedTexts = await Promise.all(fileContents.map(content => extractTextFromDataUri(content)));
      uploadedFileContents = extractedTexts.join('\n\n---\n\n');
    }

    const founderMaterials = `Startup Name: ${startupName}\n\nBusiness Pitch / Idea:\n${pitch}\n\nAdditional Founder Materials:\n${uploadedFileContents}`;
    const aggregatedData = `This is simulated aggregated public data, industry trends, and competitor analysis for a startup like "${startupName}".`;
    const financialProjections = `These are simulated financial projections for "${startupName}", showing potential for high growth but with initial high burn rate.`;
    const competitiveLandscape = `The competitive landscape for a startup like "${startupName}" is moderately crowded with a few established players and several emerging startups.`;

    const [evaluationResult, insightsResult, risksResult] = await Promise.all([
      generateStartupEvaluation({ founderMaterials, aggregatedData }),
      synthesizeActionableInsights({ founderMaterials, publicData: aggregatedData }),
      identifyInvestmentRisks({
        founderMaterials,
        financialProjections,
        marketData: aggregatedData,
        competitiveLandscape,
      }),
    ]);

    // Clean up uploaded files after processing
    await Promise.all(filePaths.map(path => deleteFile(path)));

    return {
      success: true,
      startupName,
      evaluation: evaluationResult.evaluation,
      swot: insightsResult.swotAnalysis,
      investmentInsights: insightsResult.investmentInsights,
      risks: risksResult.risks,
    };
  } catch (error) {
    console.error('AI evaluation failed:', error);
    
    // Attempt to clean up files even if evaluation fails
    try {
      await Promise.all(filePaths.map(path => deleteFile(path)));
    } catch (cleanupError) {
      console.error('Failed to cleanup files after evaluation error:', cleanupError);
    }
    
    return { success: false, error: 'An error occurred during the AI evaluation. Please check the server logs.' };
  }
}

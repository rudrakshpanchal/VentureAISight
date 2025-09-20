'use server';

import { generateStartupEvaluation } from '@/ai/flows/generate-startup-evaluation';
import { identifyInvestmentRisks } from '@/ai/flows/identify-investment-risks';
import { synthesizeActionableInsights } from '@/ai/flows/synthesize-actionable-insights';
import type { EvaluationResult } from '@/lib/types';

export async function performEvaluation(formData: FormData): Promise<EvaluationResult> {
  const startupName = formData.get('startupName') as string;
  const pitch = formData.get('pitch') as string;

  if (!startupName || !pitch) {
    return { success: false, error: 'Startup name and pitch are required.' };
  }

  const founderMaterials = `Startup Name: ${startupName}\n\nBusiness Pitch / Idea:\n${pitch}`;
  const aggregatedData = `This is simulated aggregated public data, industry trends, and competitor analysis for a startup like "${startupName}".`;
  const financialProjections = `These are simulated financial projections for "${startupName}", showing potential for high growth but with initial high burn rate.`;
  const competitiveLandscape = `The competitive landscape for a startup like "${startupName}" is moderately crowded with a few established players and several emerging startups.`;

  try {
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
    return { success: false, error: 'An error occurred during the AI evaluation. Please check the server logs.' };
  }
}

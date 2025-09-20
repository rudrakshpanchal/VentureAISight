import type { GenerateStartupEvaluationOutput } from '@/ai/flows/generate-startup-evaluation';
import type { IdentifyInvestmentRisksOutput } from '@/ai/flows/identify-investment-risks';
import type { SynthesizeActionableInsightsOutput } from '@/ai/flows/synthesize-actionable-insights';

export type EvaluationResult = {
  success: true;
  startupName: string;
  evaluation: GenerateStartupEvaluationOutput['evaluation'];
  swot: SynthesizeActionableInsightsOutput['swotAnalysis'];
  investmentInsights: SynthesizeActionableInsightsOutput['investmentInsights'];
  risks: IdentifyInvestmentRisksOutput['risks'];
} | {
  success: false;
  error: string;
};

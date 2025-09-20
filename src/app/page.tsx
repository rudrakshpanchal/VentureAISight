'use client';

import * as React from 'react';
import { performEvaluation } from '@/app/actions';
import { type EvaluationResult } from '@/lib/types';

import { Header } from '@/components/header';
import { StartupForm } from '@/components/startup-form';
import { EvaluationDisplay } from '@/components/evaluation-display';
import { DashboardSkeleton } from '@/components/dashboard-skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Home() {
  const [result, setResult] = React.useState<EvaluationResult | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [formKey, setFormKey] = React.useState(Date.now());
  const { toast } = useToast();

  const handleFormSubmit = async (formData: FormData) => {
    setIsLoading(true);
    setResult(null);
    try {
      const evaluationResult = await performEvaluation(formData);
      if (evaluationResult.success) {
        setResult(evaluationResult);
      } else {
        toast({
          variant: 'destructive',
          title: 'Evaluation Failed',
          description: evaluationResult.error || 'An unknown error occurred.',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not connect to the evaluation service. Please try again later.',
      });
      console.error(error);
    }
    setIsLoading(false);
  };

  const handleNewAnalysis = () => {
    setResult(null);
    setIsLoading(false);
    setFormKey(Date.now()); // Reset form by changing key
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header>
        {result && (
          <Button variant="outline" size="sm" onClick={handleNewAnalysis} className="no-print">
            <ArrowLeft className="mr-2 h-4 w-4" />
            New Analysis
          </Button>
        )}
      </Header>
      <main className="flex flex-1 flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-6xl">
          {!result && !isLoading && <StartupForm key={formKey} onSubmit={handleFormSubmit} />}
          {isLoading && <DashboardSkeleton />}
          {result && <EvaluationDisplay result={result} />}
        </div>
      </main>
      <footer className="flex items-center justify-center p-4 text-center text-sm text-muted-foreground no-print">
        <p>&copy; {new Date().getFullYear()} VentureAISight. All rights reserved.</p>
      </footer>
    </div>
  );
}

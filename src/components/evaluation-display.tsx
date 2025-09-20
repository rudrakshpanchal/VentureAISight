import type { EvaluationResult } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Download, Lightbulb, ShieldAlert, Siren, Sparkles, ThumbsDown, ThumbsUp, Zap } from 'lucide-react';

type EvaluationDisplayProps = {
  result: Extract<EvaluationResult, { success: true }>;
};

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-4 flex items-center text-2xl font-semibold tracking-tight">
        {icon}
        {title}
      </h2>
      {children}
    </div>
  );
}

function SwotCard({ title, content, icon }: { title: string; content: string; icon: React.ReactNode }) {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-2">
        {icon}
        <CardTitle className="text-lg font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{content}</p>
      </CardContent>
    </Card>
  );
}

export function EvaluationDisplay({ result }: EvaluationDisplayProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="printable-area" className="w-full animate-in fade-in-50 duration-500">
      <header className="mb-8 flex flex-col items-center justify-between gap-4 rounded-lg bg-card p-6 text-center sm:flex-row sm:text-left">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-primary">{result.startupName}</h1>
          <p className="mt-1 text-lg text-muted-foreground">AI-Generated Investment Analysis</p>
        </div>
        <Button onClick={handlePrint} className="no-print">
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </header>

      <div className="space-y-12">
        <Section title="Executive Summary" icon={<Sparkles className="mr-3 h-6 w-6 text-accent" />}>
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <p className="text-lg leading-relaxed text-foreground/90">{result.evaluation}</p>
            </CardContent>
          </Card>
        </Section>
        
        <Section title="SWOT Analysis" icon={<Zap className="mr-3 h-6 w-6 text-accent" />}>
          <div className="grid gap-6 sm:grid-cols-2">
            <SwotCard title="Strengths" content={result.swot.strengths} icon={<ThumbsUp className="h-5 w-5 text-green-500" />} />
            <SwotCard title="Weaknesses" content={result.swot.weaknesses} icon={<ThumbsDown className="h-5 w-5 text-red-500" />} />
            <SwotCard title="Opportunities" content={result.swot.opportunities} icon={<Zap className="h-5 w-5 text-blue-500" />} />
            <SwotCard title="Threats" content={result.swot.threats} icon={<Siren className="h-5 w-5 text-orange-500" />} />
          </div>
        </Section>

        <Section title="Actionable Investment Insights" icon={<Lightbulb className="mr-3 h-6 w-6 text-accent" />}>
          <Card>
            <CardContent className="pt-6">
              <p className="text-base text-muted-foreground">{result.investmentInsights}</p>
            </CardContent>
          </Card>
        </Section>
        
        <Section title="Risk Assessment & Mitigation" icon={<ShieldAlert className="mr-3 h-6 w-6 text-accent" />}>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%] text-base">Identified Risk</TableHead>
                  <TableHead className="text-base">Suggested Mitigation Strategy</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.risks.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{item.risk}</TableCell>
                    <TableCell className="text-muted-foreground">{item.mitigationStrategy}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </Section>
      </div>
    </div>
  );
}

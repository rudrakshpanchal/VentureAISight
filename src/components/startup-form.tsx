'use client';

import * as React from 'react';
import { useFormStatus } from 'react-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Loader2, UploadCloud } from 'lucide-react';

const formSchema = z.object({
  startupName: z.string().min(2, { message: 'Startup name must be at least 2 characters.' }),
  pitch: z.string().min(50, { message: 'Pitch must be at least 50 characters.' }),
});

type StartupFormProps = {
  onSubmit: (formData: FormData) => void;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Analyzing...
        </>
      ) : (
        'Generate Evaluation'
      )}
    </Button>
  );
}

export function StartupForm({ onSubmit }: StartupFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      startupName: '',
      pitch: '',
    },
  });

  return (
    <div className="mx-auto max-w-3xl animate-in fade-in-50 duration-500">
      <Card className="shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold tracking-tight">AI Startup Analysis</CardTitle>
          <CardDescription className="text-md">
            Upload your documents or paste your pitch to get an AI-powered investment evaluation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form action={(formData) => onSubmit(formData)} className="space-y-8">
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="startupName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg">Startup Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Innovate Inc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pitch"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg">Business Idea / Pitch</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe your business idea, target market, and revenue model..."
                          className="min-h-[150px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="space-y-2">
                  <FormLabel className="text-lg">Founder Materials (Optional)</FormLabel>
                  <div className="relative flex w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/50 py-12 text-center transition-colors hover:border-primary/50">
                    <UploadCloud className="mb-2 h-10 w-10 text-muted-foreground" />
                    <p className="font-semibold text-foreground">Click to upload or drag and drop</p>
                    <p className="text-sm text-muted-foreground">Pitch Decks, Financials, etc. (PDF, DOCX)</p>
                    <p className="mt-4 flex items-center gap-2 rounded-full bg-card px-3 py-1 text-xs text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      <span>Feature coming soon</span>
                    </p>
                  </div>
                </div>
              </div>
              <SubmitButton />
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

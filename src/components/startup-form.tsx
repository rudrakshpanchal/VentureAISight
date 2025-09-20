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
import { FileText, Loader2, UploadCloud, File as FileIcon, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

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

const ACCEPTED_FILE_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

type UploadingFile = {
  id: string;
  file: File;
  progress: number;
  error?: string;
};

export function StartupForm({ onSubmit }: StartupFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      startupName: '',
      pitch: '',
    },
  });
  const { toast } = useToast();
  const [isDragging, setIsDragging] = React.useState(false);
  const [uploadingFiles, setUploadingFiles] = React.useState<UploadingFile[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;

    const newFiles: UploadingFile[] = Array.from(files)
      .filter(file => {
        if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
          toast({
            variant: 'destructive',
            title: 'Invalid File Type',
            description: `File "${file.name}" is not a supported format.`,
          });
          return false;
        }
        if (file.size > MAX_FILE_SIZE) {
          toast({
            variant: 'destructive',
            title: 'File Too Large',
            description: `File "${file.name}" exceeds the 10MB limit.`,
          });
          return false;
        }
        return true;
      })
      .map(file => ({
        id: `${file.name}-${file.lastModified}`,
        file,
        progress: 0,
      }));

    setUploadingFiles(prev => [...prev, ...newFiles]);

    newFiles.forEach(uploadingFile => {
      // Simulate upload
      const interval = setInterval(() => {
        setUploadingFiles(prev =>
          prev.map(f => {
            if (f.id === uploadingFile.id && f.progress < 100) {
              const newProgress = f.progress + 10;
              return { ...f, progress: newProgress };
            }
            return f;
          })
        );
      }, 200);

      setTimeout(() => {
        clearInterval(interval);
        setUploadingFiles(prev =>
          prev.map(f => {
            if (f.id === uploadingFile.id) {
              toast({
                title: 'Upload Successful',
                description: `File "${f.file.name}" has been uploaded.`,
              });
              return { ...f, progress: 100 };
            }
            return f;
          })
        );
      }, 2200);
    });
  };

  const removeFile = (id: string) => {
    setUploadingFiles(prev => prev.filter(f => f.id !== id));
  };

  const onDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };
  
  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  }

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
                  <div
                    onDragEnter={onDragEnter}
                    onDragLeave={onDragLeave}
                    onDragOver={onDragOver}
                    onDrop={onDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative flex w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/50 py-12 text-center transition-colors hover:border-primary/50
                      ${isDragging ? 'border-primary bg-primary/10' : ''}
                      ${uploadingFiles.length > 0 ? 'cursor-default' : 'cursor-pointer'}`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      onChange={onFileInputChange}
                      className="hidden"
                      accept={ACCEPTED_FILE_TYPES.join(',')}
                    />
                    <UploadCloud className="mb-2 h-10 w-10 text-muted-foreground" />
                    <p className="font-semibold text-foreground">Click to upload or drag and drop</p>
                    <p className="text-sm text-muted-foreground">PDF, PPTX, DOCX (up to 10MB)</p>
                  </div>
                  {uploadingFiles.length > 0 && (
                    <div className="mt-4 space-y-3">
                      {uploadingFiles.map(upload => (
                        <div key={upload.id} className="rounded-lg border bg-card p-3">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <FileIcon className="h-6 w-6 text-muted-foreground" />
                              <div className="flex-1">
                                <p className="text-sm font-medium truncate">{upload.file.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {(upload.file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => removeFile(upload.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <Progress value={upload.progress} className="mt-2 h-2" />
                          {upload.error && <p className="mt-1 text-xs text-destructive">{upload.error}</p>}
                        </div>
                      ))}
                    </div>
                  )}
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

'use client';

import * as React from 'react';
import { useFormStatus } from 'react-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject, FirebaseStorageError } from 'firebase/storage';
import { app } from '@/lib/firebase/config';

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
  uploadedFiles: z.string().optional(),
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
  'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'text/plain',
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const storage = getStorage(app);

type UploadingFile = {
  id: string;
  file: File;
  progress: number;
  storagePath?: string;
  error?: string;
};

export function StartupForm({ onSubmit }: StartupFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      startupName: '',
      pitch: '',
      uploadedFiles: '[]',
    },
  });
  const { toast } = useToast();
  const [isDragging, setIsDragging] = React.useState(false);
  const [uploadingFiles, setUploadingFiles] = React.useState<UploadingFile[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const uploadedFilesData = uploadingFiles
      .filter(f => f.progress === 100 && f.storagePath)
      .map(f => ({ name: f.file.name, path: f.storagePath }));
    form.setValue('uploadedFiles', JSON.stringify(uploadedFilesData));
  }, [uploadingFiles, form]);

  const handleFile = (file: File) => {
    if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
      toast({
        variant: 'destructive',
        title: 'Invalid File Type',
        description: `File "${file.name}" is not a supported format. Please upload PDF, PPTX, or DOCX.`,
      });
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast({
        variant: 'destructive',
        title: 'File Too Large',
        description: `File "${file.name}" exceeds the 10MB limit.`,
      });
      return;
    }

    const id = `${file.name}-${file.lastModified}-${uuidv4()}`;
    const storagePath = `uploads/${uuidv4()}-${file.name}`;
    const newUploadingFile: UploadingFile = { id, file, progress: 0, storagePath };

    setUploadingFiles(prev => [...prev, newUploadingFile]);

    const storageRef = ref(storage, storagePath);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      snapshot => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadingFiles(prev =>
          prev.map(f => (f.id === id ? { ...f, progress } : f))
        );
      },
      (error: FirebaseStorageError) => {
        console.error("Upload Error:", error);
        let errorMessage = 'An unknown error occurred during upload.';
        switch (error.code) {
          case 'storage/unauthorized':
            errorMessage = 'Permission denied. Please check your storage security rules.';
            break;
          case 'storage/canceled':
            errorMessage = 'Upload was canceled.';
            break;
          case 'storage/quota-exceeded':
            errorMessage = 'Storage quota exceeded. Please contact the administrator.';
            break;
        }
        setUploadingFiles(prev =>
          prev.map(f => (f.id === id ? { ...f, error: errorMessage, progress: 0 } : f))
        );
        toast({
          variant: 'destructive',
          title: `Upload Failed: ${file.name}`,
          description: errorMessage,
        });
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then(() => {
          setUploadingFiles(prev =>
            prev.map(f => (f.id === id ? { ...f, progress: 100 } : f))
          );
          toast({
            title: 'Upload Successful',
            description: `File "${file.name}" has been uploaded.`,
          });
        });
      }
    );
  };
  
  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach(handleFile);
  };

  const removeFile = async (id: string) => {
    const fileToRemove = uploadingFiles.find(f => f.id === id);
    if (fileToRemove && fileToRemove.storagePath) {
      try {
        const fileRef = ref(storage, fileToRemove.storagePath);
        await deleteObject(fileRef);
        toast({
          title: 'File Removed',
          description: `File "${fileToRemove.file.name}" has been removed.`,
        });
      } catch (error) {
        console.error("Error removing file from storage:", error);
        toast({
          variant: 'destructive',
          title: 'Error Removing File',
          description: 'Could not remove file from storage. Please try again.',
        });
        // Do not remove from UI if deletion fails, to allow retry
        return; 
      }
    }
    setUploadingFiles(prev => prev.filter(f => f.id !== id));
  };


  const onDragEnter = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(false); };
  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(true); };
  const onDrop = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files); };
  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => { handleFiles(e.target.files); };
  const triggerFormSubmit = form.handleSubmit(() => onSubmit(new FormData(form.control.getFieldState._formRef.current)));

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
            <form onSubmit={triggerFormSubmit} className="space-y-8">
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
                    className={`relative flex w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/50 py-12 text-center transition-colors hover:border-primary/50 cursor-pointer
                      ${isDragging ? 'border-primary bg-primary/10' : ''}`}
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
                    <p className="text-sm text-muted-foreground">PDF, PPTX, DOCX (up to 10MB each)</p>
                  </div>
                  {uploadingFiles.length > 0 && (
                    <div className="mt-4 space-y-3">
                      {uploadingFiles.map(upload => (
                        <div key={upload.id} className="rounded-lg border bg-card p-3">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3 overflow-hidden">
                              <FileIcon className="h-6 w-6 flex-shrink-0 text-muted-foreground" />
                              <div className="flex-1 overflow-hidden">
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
                              className="h-8 w-8 flex-shrink-0 text-muted-foreground hover:text-destructive"
                              onClick={() => removeFile(upload.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          {upload.progress > 0 && upload.progress < 100 && (
                            <Progress value={upload.progress} className="mt-2 h-2" />
                          )}
                          {upload.progress === 100 && !upload.error &&(
                             <div className="mt-2 text-xs text-green-600">Upload complete</div>
                          )}
                          {upload.error && <p className="mt-1 text-xs text-destructive">{upload.error}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                 <FormField
                    control={form.control}
                    name="uploadedFiles"
                    render={({ field }) => (
                      <FormItem className="hidden">
                        <FormControl>
                          <Input type="hidden" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
              </div>
              <SubmitButton />
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

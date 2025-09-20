import { Rocket } from 'lucide-react';

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <Rocket className="h-6 w-6 text-primary" />
      <h1 className="text-xl font-bold tracking-tighter text-foreground">
        VentureAISight
      </h1>
    </div>
  );
}

import { Logo } from '@/components/logo';

type HeaderProps = {
  children?: React.ReactNode;
};

export function Header({ children }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 no-print">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
        <Logo />
        <div className="flex items-center gap-4">
          {children}
        </div>
      </div>
    </header>
  );
}

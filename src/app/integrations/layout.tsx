import Link from "next/link";
import { SagaLogo } from "@/components/common/saga-logo";
import { ThemeToggle } from "@/components/common/theme-toggle";

export default function IntegrationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-primary/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] bg-accent/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      <header className="h-16 border-b border-border/70 bg-background/80 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between shrink-0 sticky top-0 z-20">
        <Link href="/" className="flex items-center gap-2">
          <SagaLogo size="sm" showText={true} showSubtitle={false} />
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}

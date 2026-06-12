import { ThemeToggle } from "@/components/theme-toggle";

export function SiteHeader() {
  return (
    <header className="border-b">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <span className="font-semibold tracking-tight">genwidget-ai</span>
        <ThemeToggle />
      </div>
    </header>
  );
}

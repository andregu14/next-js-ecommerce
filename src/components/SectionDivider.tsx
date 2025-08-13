import { Separator } from "@/components/ui/separator";

export function SectionDivider({ label }: { label?: string }) {
  return (
    <div className="mx-auto max-w-screen-md md:max-w-3xl lg:max-w-5xl xl:max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="relative my-6 sm:my-8 lg:my-10">
        <Separator />
        {label ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="bg-background px-3 text-xs uppercase tracking-wide text-muted-foreground">
              {label}
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

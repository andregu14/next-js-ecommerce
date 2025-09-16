import { cn } from "@/lib/utils";

type Tone = "plain" | "subtle" | "vividBlue" | "vividSunset";

const toneMap: Record<Tone, string> = {
  plain: "bg-background",
  subtle: "bg-muted/60",
  vividBlue:
    "bg-gradient-to-br from-sky-500/15 via-indigo-500/15 to-blue-600/15",
  vividSunset:
    "bg-gradient-to-br from-amber-500/15 via-orange-500/15 to-rose-500/15 ",
};

export function ProductSection({
  tone = "plain",
  className,
  children,
}: React.PropsWithChildren<{ tone?: Tone; className?: string }>) {
  return (
    <section
      className={cn("py-16 sm:py-20 rounded-2xl", toneMap[tone], className)}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>
    </section>
  );
}

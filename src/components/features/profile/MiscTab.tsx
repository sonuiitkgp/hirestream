import { LayoutGrid } from "lucide-react";

type MiscSection = { title: string; items: string[] };

export function MiscTab({ miscData }: { miscData: MiscSection[] }) {
  const sections = (miscData ?? []).filter(
    (s) => s.items && s.items.filter((item) => item.trim()).length > 0
  );

  if (sections.length === 0) return null;

  return (
    <div className="section-clean space-y-5">
      <h2 className="flex items-center gap-2.5 text-base font-semibold">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <LayoutGrid className="h-3.5 w-3.5" />
        </span>
        <span>Additional Info</span>
      </h2>

      <div className="grid gap-4 sm:grid-cols-2">
        {sections.map((section, i) => (
          <div key={i} className="card-clean p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted">
                <LayoutGrid className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <h3 className="text-sm font-semibold">{section.title}</h3>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {section.items.filter((item) => item.trim()).map((item, j) => (
                <span key={j} className="inline-flex items-center rounded-full bg-muted text-foreground px-2.5 py-0.5 text-xs font-medium">
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

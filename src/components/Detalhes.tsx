import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

interface DetalhesProps {
  /** Rótulo do botão (ex.: "Ver detalhes") */
  titulo?: string;
  defaultOpen?: boolean;
  className?: string;
  children: ReactNode;
}

/** Bloco recolhível para informação secundária: o conteúdo só aparece sob demanda. */
export default function Detalhes({ titulo = "Ver detalhes", defaultOpen = false, className, children }: DetalhesProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Collapsible open={open} onOpenChange={setOpen} className={cn("space-y-3", className)}>
      <CollapsibleTrigger className="inline-flex items-center gap-1.5 rounded-md border border-border/70 bg-muted/40 px-2.5 py-1 text-xs font-semibold text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <ChevronDown size={14} className={cn("transition-transform", open && "rotate-180")} />
        {open ? "Ocultar" : titulo}
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-3">{children}</CollapsibleContent>
    </Collapsible>
  );
}

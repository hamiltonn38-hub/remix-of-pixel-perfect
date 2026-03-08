import { usePits } from "@/context/PitsContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin } from "lucide-react";

export default function MunicipioSelector() {
  const { selectedMunicipio, setSelectedMunicipio, allMunicipios } = usePits();

  return (
    <div className="flex items-center gap-2">
      <MapPin size={16} className="text-primary" />
      <Select
        value={selectedMunicipio.municipio}
        onValueChange={(v) => {
          const m = allMunicipios.find((m) => m.municipio === v);
          if (m) setSelectedMunicipio(m);
        }}
      >
        <SelectTrigger className="w-[200px] bg-card border-border">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {allMunicipios.map((m) => (
            <SelectItem key={m.municipio} value={m.municipio}>
              {m.municipio} – {m.estado}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

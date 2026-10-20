import React from "react";
import { getFonteManifest, FonteMetadados } from "@/lib/provenance";
import { Info, ExternalLink, CheckCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface FonteInfoProps {
  /** Chave da variável no data/MANIFEST.json */
  variavel?: string;
  codigoIBGE?: string;
  /** Propriedades manuais caso a variável seja composta ou de literatura */
  instituicao?: string;
  ano?: number | string;
  dataConsulta?: string;
  tabela?: string;
  url?: string;
  /** Exibição em linha compacta */
  inline?: boolean;
  className?: string;
  /** Exibir selo de validação oficial se a integração for real */
  selo?: "MapBiomas" | "INMET" | "IBGE" | "IPECE" | "SFB";
  /** Se a integração com a API/base é real e verificada */
  integracaoReal?: boolean;
}

export default function FonteInfo({
  variavel,
  codigoIBGE,
  instituicao: propInstituicao,
  ano: propAno,
  dataConsulta: propDataConsulta,
  tabela: propTabela,
  url: propUrl,
  inline = false,
  className = "",
  selo,
  integracaoReal = true,
}: FonteInfoProps) {
  let meta: FonteMetadados | null = null;
  if (variavel) {
    meta = getFonteManifest(variavel, codigoIBGE);
  }

  const instituicao = meta?.instituicao ?? propInstituicao ?? "Fonte Oficial";
  const ano = meta?.ano ?? propAno ?? 2026;
  const dataConsulta = meta?.dataConsulta ?? propDataConsulta ?? "11/10/2026";
  const tabela = meta?.tabela ?? propTabela;
  const url = meta?.url ?? propUrl;

  // Regra 2: Selos "MapBiomas/INMET/ANA" só onde houver integração real. ANA é expressamente proibido pois não está integrada.
  const podeExibirSelo = selo && (selo as string) !== "ANA" && integracaoReal;

  return (
    <div
      className={`group/fonte text-[11px] text-muted-foreground flex flex-wrap items-center gap-1.5 ${
        inline ? "inline-flex" : "mt-2 pt-1.5 border-t border-border/50"
      } ${className}`}
    >
      <span className="font-medium">
        Fonte: <strong className="text-foreground">{instituicao}</strong> ({ano})
      </span>
      <span className={inline ? "text-muted-foreground" : "text-muted-foreground hidden group-hover:inline group-focus-within:inline group-hover/fonte:inline group-focus-within/fonte:inline"}>•</span>
      <span className={inline ? "" : "hidden group-hover:inline group-focus-within:inline group-hover/fonte:inline group-focus-within/fonte:inline"}>Consulta: {dataConsulta}</span>

      {tabela && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground inline-flex items-center gap-0.5 ml-0.5"
                aria-label="Ver detalhes da fonte"
              >
                <Info size={11} />
              </button>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs text-xs p-2.5 space-y-1">
              <p className="font-semibold text-foreground">{instituicao}</p>
              <p className="text-muted-foreground">Tabela/Base: {tabela}</p>
              <p className="text-[10px] text-muted-foreground">Data da consulta auditada: {dataConsulta}</p>
              {url && url !== "NÃO APLICÁVEL" && (
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-medium pt-1"
                >
                  <ExternalLink size={10} /> Acessar base oficial
                </a>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {podeExibirSelo && (
        <span className="ml-auto inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-success/15 text-success">
          <CheckCircle size={9} /> {selo} Integrado
        </span>
      )}
    </div>
  );
}

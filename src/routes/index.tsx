import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import App from "../App";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Indiqueleads — Plataforma de Indicações" },
      {
        name: "description",
        content:
          "Plataforma multivertical que conecta anunciantes a uma rede de indicadores autônomos com links rastreáveis e comissionamento em camadas.",
      },
      { property: "og:title", content: "Indiqueleads — Plataforma de Indicações" },
      {
        property: "og:description",
        content:
          "Plataforma multivertical que conecta anunciantes a uma rede de indicadores autônomos com links rastreáveis e comissionamento em camadas.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  // The app reads localStorage in state initializers, so it must mount client-only.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  if (!hydrated) {
    return <div className="min-h-screen bg-[#0B1728]" />;
  }

  return <App />;
}

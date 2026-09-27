import Link from "next/link";
import { PublicHeader } from "@/components/public-header";

const steps = [
  {
    number: "01",
    title: "Subí el PDF",
    text: "El archivo queda en esta máquina. El estado pasa de En cola a Listo cuando ya se puede preguntar.",
  },
  {
    number: "02",
    title: "Hacé una pregunta",
    text: "Una consulta concreta devuelve la respuesta y la página del archivo de donde salió.",
  },
  {
    number: "03",
    title: "Pedí un análisis",
    text: "Si hace falta recorrer el documento, el análisis lee por partes. Tarda más que una pregunta directa.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      <PublicHeader />
      <main className="mx-auto max-w-5xl px-6 pb-16">
        <p className="text-sm tracking-[0.18em] text-[var(--accent)] uppercase">Análisis privado</p>
        <h1 className="mt-3 max-w-3xl text-5xl leading-tight">Preguntale a tus PDF y citá la página.</h1>
        <p className="mt-4 max-w-2xl text-lg text-[var(--muted)]">
          LegalAI indexa un documento en tu computadora y responde con el archivo y la página de origen. La base, los vectores y el modelo corren en local.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/register" className="btn btn-primary">
            Crear cuenta
          </Link>
          <Link href="/login" className="btn btn-secondary">
            Iniciar sesión
          </Link>
        </div>
        <ol className="mt-14 grid gap-4 md:grid-cols-3">
          {steps.map((step) => (
            <li key={step.number} className="panel p-5">
              <p className="text-sm text-[var(--accent)]">{step.number}</p>
              <h2 className="mt-2 text-2xl">{step.title}</h2>
              <p className="mt-2 text-sm text-[var(--muted)]">{step.text}</p>
            </li>
          ))}
        </ol>
        <p className="mt-10 max-w-2xl text-sm text-[var(--muted)]">
          Cada cuenta ve solo sus documentos. Una pregunta simple puede tardar uno o dos minutos: el tiempo lo pone el modelo local, no la búsqueda.
        </p>
      </main>
    </div>
  );
}

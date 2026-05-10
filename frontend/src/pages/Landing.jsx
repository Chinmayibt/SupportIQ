import { Link } from "react-router-dom";
import { ArrowRight, BarChart3, Mic, Sparkles, Target } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    title: "Smart prediction",
    body: "Classify intent, sentiment, and priority with NLP plus optional LLM actions.",
    icon: Target,
  },
  {
    title: "Real-time analytics",
    body: "Monitor sentiment, languages, categories, and ticket trends in one place.",
    icon: BarChart3,
  },
  {
    title: "Voice support",
    body: "Upload audio for transcription and the same classification pipeline.",
    icon: Mic,
  },
  {
    title: "Operations-ready",
    body: "Structured logs, KPIs, and a layout built for production-style review.",
    icon: Sparkles,
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card shadow-soft">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="font-semibold text-foreground">Support Intelligence</span>
          </div>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-primary/90"
          >
            Open dashboard
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-3xl text-center"
        >
          <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            AI-powered customer support intelligence
          </h1>
          <p className="mt-4 text-lg text-muted">
            A clean, production-style dashboard for ticket classification, analytics, and voice workflows.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-primary/90"
            >
              Get started
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/dashboard#predictions"
              className="inline-flex items-center rounded-xl border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground shadow-soft transition hover:bg-background"
            >
              Run a prediction
            </Link>
          </div>
        </motion.div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ title, body, icon: Icon }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i }}
              whileHover={{ y: -4 }}
              className="rounded-2xl border border-border bg-card p-6 shadow-soft"
            >
              <div className="mb-4 inline-flex rounded-xl bg-primary/10 p-3 text-primary">
                <Icon className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">{title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
            </motion.div>
          ))}
        </div>
      </main>

      <footer className="border-t border-border py-8 text-center text-sm text-muted">
        Customer support MLOps — light dashboard experience
      </footer>
    </div>
  );
}

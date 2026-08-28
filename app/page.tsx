export default function HomePage() {
  return (
    <main className="min-h-screen p-8 max-w-7xl mx-auto">
      <header className="flex items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
              Abstrabit RAG Inspector
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
              Developer Prototype
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            RAG pipeline debugging & inspection
          </p>
        </div>
      </header>
      <section className="mt-8 p-6 rounded-card border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Scaffold Initialized
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Milestone 1 project structure and design tokens are configured.
        </p>
      </section>
    </main>
  );
}

export default function LaunchpadSkeletonCard() {
  return (
    <article className="flex animate-pulse flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between">
        <div className="h-12 w-12 rounded-2xl bg-slate-200 dark:bg-slate-800" />
        <div className="flex gap-2">
          <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-800" />
          <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>

      <div className="grid gap-2">
        <div className="h-6 w-2/3 rounded-full bg-slate-200 dark:bg-slate-800" />
        <div className="h-4 w-1/2 rounded-full bg-slate-200 dark:bg-slate-800" />
      </div>

      <div className="h-7 w-24 rounded-full bg-slate-200 dark:bg-slate-800" />
      <div className="h-24 rounded-2xl bg-slate-200 dark:bg-slate-800" />

      <div className="flex gap-2">
        <div className="h-7 w-16 rounded-full bg-slate-200 dark:bg-slate-800" />
        <div className="h-7 w-20 rounded-full bg-slate-200 dark:bg-slate-800" />
      </div>

      <div className="h-4 w-28 rounded-full bg-slate-200 dark:bg-slate-800" />
      <div className="mt-auto h-12 rounded-2xl bg-slate-200 dark:bg-slate-800" />
    </article>
  )
}

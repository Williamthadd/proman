export default function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between">
        <div className="h-7 w-16 rounded-full bg-slate-200 dark:bg-slate-800" />
        <div className="flex gap-2">
          <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-800" />
          <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-800" />
          <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>

      <div className="mt-5 h-7 w-2/3 rounded-lg bg-slate-200 dark:bg-slate-800" />
      <div className="mt-4 h-3 w-full rounded-full bg-slate-200 dark:bg-slate-800" />
      <div className="mt-4 grid gap-2">
        <div className="h-4 w-1/2 rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-4 w-2/3 rounded bg-slate-200 dark:bg-slate-800" />
      </div>
      <div className="mt-5 flex gap-2">
        <div className="h-7 w-20 rounded-full bg-slate-200 dark:bg-slate-800" />
        <div className="h-7 w-16 rounded-full bg-slate-200 dark:bg-slate-800" />
      </div>
      <div className="mt-6 h-11 w-full rounded-xl bg-slate-200 dark:bg-slate-800" />
    </div>
  )
}

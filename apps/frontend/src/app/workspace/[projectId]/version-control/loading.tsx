export default function VersionControlLoading() {
  return (
    <div className="min-h-[60vh] px-6 py-8 max-w-3xl mx-auto animate-pulse">
      <div className="mb-8 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-muted h-14 w-14" />
          <div className="space-y-2">
            <div className="h-6 w-40 rounded bg-muted" />
            <div className="h-4 w-60 rounded bg-muted" />
          </div>
        </div>
        <div className="h-10 w-40 rounded bg-muted" />
      </div>

      <div className="space-y-4">
        <div className="h-16 rounded-lg bg-muted" />
        <div className="h-16 rounded-lg bg-muted" />
        <div className="h-16 rounded-lg bg-muted" />
      </div>
    </div>
  );
}

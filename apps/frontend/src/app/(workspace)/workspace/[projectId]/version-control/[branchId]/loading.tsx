export default function BranchCommitsLoading() {
  return (
    <div className="min-h-[60vh] px-6 py-8 max-w-3xl mx-auto animate-pulse">
      <div className="mb-8 space-y-2">
        <div className="h-7 w-56 rounded bg-muted" />
        <div className="h-4 w-72 rounded bg-muted" />
      </div>

      <div className="space-y-4">
        <div className="h-20 rounded-lg bg-muted" />
        <div className="h-20 rounded-lg bg-muted" />
        <div className="h-20 rounded-lg bg-muted" />
        <div className="h-20 rounded-lg bg-muted" />
      </div>
    </div>
  );
}

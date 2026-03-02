export default function ProfileLoading() {
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 md:p-6">
      <div className="animate-pulse">
        <div className="flex items-center gap-4">
          <div className="size-12 rounded-full bg-muted" />
          <div className="space-y-1">
            <div className="h-4 w-32 rounded bg-muted" />
            <div className="h-3 w-48 rounded bg-muted" />
          </div>
        </div>

        <div className="mt-6 h-64 rounded bg-muted" />
        <div className="mt-6 h-64 rounded bg-muted" />

        <div className="mt-6 flex items-center gap-4">
          <div className="h-10 w-24 rounded bg-muted" />
          <div className="h-10 w-24 rounded bg-muted" />
          <div className="h-10 w-24 rounded bg-muted" />
          <div className="h-10 w-24 rounded bg-muted" />
          <div className="h-10 w-24 rounded bg-muted" />
          <div className="h-10 w-24 rounded bg-muted" />
        </div>
      </div>
    </section>
  );
}

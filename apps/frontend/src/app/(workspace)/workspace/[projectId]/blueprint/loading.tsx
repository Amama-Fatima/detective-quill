export default function BlueprintLoading() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="space-y-4 text-center">
        <div className="mx-auto h-12 w-12 animate-pulse rounded-full bg-muted" />
        <div className="space-y-2">
          <div className="mx-auto h-6 w-48 animate-pulse rounded bg-accent" />
          <div className="mx-auto h-4 w-64 animate-pulse rounded bg-accent" />
          <div className="mx-auto h-4 w-64 animate-pulse rounded bg-accent" />

          <div className="mx-auto h-4 w-64 animate-pulse rounded bg-accent" />
        </div>
      </div>
    </div>
  );
}

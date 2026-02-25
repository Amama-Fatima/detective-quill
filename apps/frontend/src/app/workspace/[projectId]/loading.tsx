export default function WorkspaceLoading() {
  return (
    <section className="min-h-[70vh] w-full p-4 md:p-6">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
        <div className="h-10 w-72 rounded bg-muted animate-pulse" />

        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-3 h-[70vh] rounded-lg bg-muted animate-pulse" />
          <div className="col-span-6 h-[70vh] rounded-lg bg-muted animate-pulse" />
          <div className="col-span-3 h-[70vh] rounded-lg bg-muted animate-pulse" />
        </div>
      </div>
    </section>
  );
}

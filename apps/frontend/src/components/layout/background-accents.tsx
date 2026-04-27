export default function BackgroundAccents() {
  return (
    <>
      <div className="pointer-events-none absolute inset-0 opacity-[0.03] bg-[radial-gradient(oklch(24%_0.022_245)_1px,transparent_1px)] bg-size-[28px_28px]" />
      <div className="pointer-events-none absolute -right-24 top-16 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 bottom-32 h-64 w-64 rounded-full bg-primary/8 blur-3xl" />
    </>
  );
}
export default function OfflinePage() {
  return (
    <main className="mx-auto flex min-h-[100dvh] w-full max-w-2xl items-center justify-center px-6">
      <section className="w-full rounded-lg border bg-card p-8 text-card-foreground shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight">You are offline</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Deepo can still load core shell assets while offline. Reconnect to access live tool data and dynamic routes.
        </p>
      </section>
    </main>
  );
}

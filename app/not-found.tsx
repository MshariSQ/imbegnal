import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-[70dvh] grid place-items-center px-4 pt-24 text-center">
      <div>
        <div className="text-7xl font-black gradient-text mb-4">404</div>
        <h1 className="text-xl font-bold text-fg mb-2">Page not found · الصفحة غير موجودة</h1>
        <p className="text-fg-muted mb-8">The page you&apos;re looking for doesn&apos;t exist.</p>
        <Link href="/learn/" className="inline-flex h-11 items-center px-5 rounded-xl bg-brand text-brand-fg font-semibold hover:bg-brand-strong">Browse courses</Link>
      </div>
    </main>
  );
}

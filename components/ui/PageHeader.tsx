export default function PageHeader({
  eyebrow,
  title,
  subtitle,
  children,
  center = false,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children?: React.ReactNode;
  center?: boolean;
}) {
  return (
    <header className={`mb-10 animate-fade-up ${center ? "text-center mx-auto max-w-2xl" : "max-w-3xl"}`}>
      {eyebrow && <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-400 mb-3">{eyebrow}</p>}
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-fg leading-[1.1]">{title}</h1>
      {subtitle && <p className="mt-4 text-base sm:text-lg text-fg-muted leading-relaxed">{subtitle}</p>}
      {children}
    </header>
  );
}

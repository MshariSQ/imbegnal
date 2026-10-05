/* eslint-disable @next/next/no-img-element -- static export: next/image is unoptimized anyway */
export default function Avatar({ src, name, size = 28 }: { src?: string; name: string; size?: number }) {
  if (src) {
    return <img src={src} alt="" width={size} height={size} className="rounded-full object-cover" style={{ width: size, height: size }} />;
  }
  const initials = name.split(/\s+/).map((p) => p[0]).join("").slice(0, 2).toUpperCase();
  return (
    <span
      aria-hidden
      className="grid place-items-center rounded-full bg-gradient-to-br from-emerald-500 to-blue-500 text-white font-bold"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {initials || "?"}
    </span>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { useLang } from "@/lib/lang-context";
import PageHeader from "@/components/ui/PageHeader";
import { GITHUB_REPO } from "@/lib/site";

export default function PricingClient() {
  const { tx } = useLang();
  const p = tx.pricing;
  const [yearly, setYearly] = useState(true);

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-28 pb-16">
      <PageHeader eyebrow={p.eyebrow} title={p.title} subtitle={p.subtitle} center />

      <div className="flex justify-center mb-10">
        <div role="group" className="inline-flex p-1 rounded-xl bg-surface-2 text-sm font-semibold">
          {[{ y: false, label: p.monthly }, { y: true, label: p.yearly }].map((o) => (
            <button key={String(o.y)} aria-pressed={yearly === o.y} onClick={() => setYearly(o.y)} className={`px-4 h-9 rounded-lg transition-colors ${yearly === o.y ? "bg-surface text-fg shadow-sm" : "text-fg-subtle hover:text-fg"}`}>
              {o.label}
              {o.y && <span className="ms-2 text-[11px] text-emerald-400">{p.save}</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-5 items-stretch">
        {p.plans.map((plan) => {
          const popular = plan.id === "pro";
          const price = plan.price > 0 && yearly ? +(plan.price * 0.7).toFixed(2) : plan.price;
          return (
            <section key={plan.id} className={`card p-7 flex flex-col relative ${popular ? "border-brand/60 ring-1 ring-brand/30" : ""}`}>
              {popular && <span className="absolute -top-3 start-7 px-3 py-1 rounded-full bg-brand text-brand-fg text-[11px] font-bold">{p.mostPopular}</span>}
              <h2 className="text-lg font-bold text-fg">{plan.name}</h2>
              <p className="text-sm text-fg-muted mt-1 mb-5">{plan.desc}</p>
              <div className="mb-6" dir="ltr">
                {plan.price < 0 ? (
                  <span className="text-3xl font-black text-fg">Custom</span>
                ) : (
                  <>
                    <span className="text-4xl font-black text-fg">${price}</span>
                    {plan.price > 0 && <span className="text-fg-subtle text-sm"> {p.perMonth}</span>}
                    {plan.price > 0 && yearly && <div className="text-xs text-fg-subtle mt-1">{p.billedYearly}</div>}
                  </>
                )}
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-fg-soft">
                    <Check size={16} className="text-emerald-400 mt-0.5 shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              {plan.id === "free" && <Link href="/dashboard/" className="h-11 grid place-items-center rounded-xl border border-line-strong text-fg font-semibold hover:bg-fg/5">{p.getStarted}</Link>}
              {plan.id === "pro" && <a href={`${GITHUB_REPO}/discussions`} target="_blank" rel="noopener noreferrer" className="h-11 grid place-items-center rounded-xl bg-brand hover:bg-brand-strong text-brand-fg font-semibold">{p.upgrade}</a>}
              {plan.id === "teams" && <a href={`${GITHUB_REPO}/issues`} target="_blank" rel="noopener noreferrer" className="h-11 grid place-items-center rounded-xl border border-line-strong text-fg font-semibold hover:bg-fg/5">{p.teams}</a>}
            </section>
          );
        })}
      </div>

      <section className="max-w-2xl mx-auto mt-20">
        <h2 className="text-xl font-bold text-fg mb-5 text-center">{p.faqTitle}</h2>
        <div className="space-y-3">
          {p.faq.map((f) => (
            <details key={f.q} className="card p-5 group">
              <summary className="cursor-pointer font-semibold text-fg list-none flex justify-between gap-4">{f.q}<span className="text-fg-subtle group-open:rotate-45 transition-transform">+</span></summary>
              <p className="text-sm text-fg-muted mt-3 leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}

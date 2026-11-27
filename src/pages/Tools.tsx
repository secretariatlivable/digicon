import { ArrowLeft, BookOpen, ExternalLink, FileText, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { AdminBlogCms } from "@/components/admin/AdminPanels";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Tools() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to="/admin" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Platform administration
        </Link>
        <Link to="/blog" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
          <ExternalLink className="mr-2 h-4 w-4" /> View public blog
        </Link>
      </div>

      <section className="relative overflow-hidden rounded-3xl border border-cyan-300/15 bg-[#07152d] p-6 text-white shadow-2xl shadow-cyan-950/20 sm:p-9">
        <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-cyan-400/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-blue-500/15 blur-3xl" />
        <div className="relative grid gap-7 md:grid-cols-[1fr_auto] md:items-end">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-200/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold tracking-[.18em] text-cyan-200">
              <Sparkles className="h-3.5 w-3.5" /> DIGICON PUBLISHING STUDIO
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">Ideas into meaningful connections.</h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
              Create, edit and publish search-friendly articles for the DigiCon blog. Manage excerpts, featured images,
              tags, SEO metadata and publication status from one workspace.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/blog" className={cn(buttonVariants({ size: "lg" }), "bg-cyan-300 text-slate-950 hover:bg-cyan-200")}>
              <BookOpen className="mr-2 h-4 w-4" /> Open blog
            </Link>
            <Link to="/resources/five-minute-networking-tracker" className={cn(buttonVariants({ size: "lg", variant: "outline" }), "border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white")}>
              <FileText className="mr-2 h-4 w-4" /> Tracker preview
            </Link>
          </div>
        </div>
        <div className="relative mt-8 grid grid-cols-2 gap-3 border-t border-white/10 pt-5 sm:grid-cols-4">
          {[["01","Write","Create useful long-form content"],["02","Optimize","Add SEO titles and descriptions"],["03","Preview","Check content and featured imagery"],["04","Publish","Make it visible on the public blog"]].map(([n,t,d]) => (
            <div key={n} className="rounded-xl bg-white/[.045] p-3 transition duration-300 hover:-translate-y-1 hover:bg-white/[.09]">
              <span className="text-xs font-bold tracking-widest text-cyan-300">{n}</span>
              <p className="mt-2 font-semibold">{t}</p>
              <p className="mt-1 text-xs leading-5 text-slate-400">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.2em] text-cyan-600">Content management</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight">Write and publish articles</h2>
          <p className="mt-1 text-sm text-muted-foreground">Save a draft first, or publish immediately when your article is ready. Published articles appear automatically on /blog.</p>
        </div>
        <AdminBlogCms />
      </section>
    </div>
  );
}

import { ArrowLeft, Download, Printer, Timer, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

async function downloadTrackerPdf() {
  try {
    const response = await fetch("/five-minute-networking-tracker.pdf.base64");
    if (!response.ok) throw new Error("PDF asset unavailable");
    const encoded = (await response.text()).trim();
    const binary = atob(encoded);
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    const blob = new Blob([bytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "DigiCon-Five-Minute-Networking-Tracker.pdf";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1500);
  } catch {
    window.print();
  }
}

const contacts = [1, 2, 3];
const steps = [
  ["01", "Review", "Reconnect with the people you met today."],
  ["02", "Remember", "Capture where you met and what matters to them."],
  ["03", "Act", "Choose one next step and set its deadline."],
];

export default function NetworkingTracker() {
  return (
    <main className="min-h-screen bg-[#eef3f8] px-3 py-6 text-slate-900 sm:px-6 sm:py-10 print:bg-white print:p-0">
      <div className="mx-auto max-w-[900px]">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-950"><ArrowLeft className="h-4 w-4" /> Back to DigiCon Blog</Link>
          <div className="flex flex-wrap gap-2"><Button onClick={() => void downloadTrackerPdf()} className="bg-[#087f91] text-white hover:bg-[#066b79]"><Download className="mr-2 h-4 w-4" /> Download PDF</Button><Button variant="outline" onClick={() => window.print()} className="border-slate-300 bg-white text-slate-800 hover:bg-slate-100"><Printer className="mr-2 h-4 w-4" /> Print page</Button></div>
        </div>

        <article id="digicon-networking-tracker" className="overflow-hidden rounded-[24px] bg-white shadow-xl shadow-slate-900/10 print:rounded-none print:shadow-none">
          <header className="relative overflow-hidden bg-[#071a35] px-6 py-7 text-white sm:px-9 sm:py-8">
            <div className="absolute -right-12 -top-24 h-64 w-64 rounded-full border-[36px] border-[#18b7b1]/15" />
            <div className="absolute -bottom-24 right-28 h-48 w-48 rounded-full bg-[#18b7b1]/10 blur-2xl" />
            <div className="relative flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[.28em] text-[#58d8d0]">DigiCon · Relationship growth tool</p>
                <h1 className="mt-3 max-w-xl text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">The Five-Minute<br/><span className="text-[#55d4ce]">Networking Tracker</span></h1>
                <p className="mt-3 max-w-lg text-sm leading-6 text-slate-300">Turn good conversations into meaningful connections. Capture the context, remember what matters and take the next step.</p>
              </div>
              <div className="hidden rounded-2xl border border-white/15 bg-white/10 p-3 sm:block"><Timer className="h-8 w-8 text-[#55d4ce]" /></div>
            </div>
            <div className="relative mt-6 grid grid-cols-3 gap-2">
              {steps.map(([n,title,desc]) => <div key={n} className="rounded-xl border border-white/10 bg-white/[.07] p-3"><span className="text-[10px] font-bold text-[#55d4ce]">{n} / 5 MIN</span><p className="mt-1 text-sm font-bold">{title}</p><p className="mt-1 hidden text-[10px] leading-4 text-slate-300 sm:block">{desc}</p></div>)}
            </div>
          </header>

          <section className="px-5 py-5 sm:px-8">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#078b91]">Your new connections</p><h2 className="mt-1 text-lg font-extrabold">Three people. Three next steps.</h2></div>
              <div className="rounded-xl bg-[#e8f8f7] p-2.5 text-[#078b91]"><Users className="h-5 w-5" /></div>
            </div>
            <div className="space-y-3">
              {contacts.map((n) => <section key={n} className="rounded-xl border border-slate-200 p-3.5 sm:p-4">
                <div className="mb-3 flex items-center justify-between"><p className="text-xs font-extrabold uppercase tracking-wider text-[#087f91]">Connection 0{n}</p><span className="text-[10px] text-slate-400">Name / Company: ________________________</span></div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  <label className="col-span-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">Where you met<div className="mt-1 h-7 border-b border-dashed border-slate-300" /></label>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">What they need<div className="mt-1 h-10 border-b border-dashed border-slate-300" /></label>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Single next action<div className="mt-1 h-10 border-b border-dashed border-slate-300" /></label>
                  <label className="col-span-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">Follow-up deadline <span className="normal-case tracking-normal text-slate-400">(date)</span><div className="mt-1 h-6 w-1/2 border-b border-dashed border-slate-300" /></label>
                </div>
              </section>)}
            </div>
          </section>

          <footer className="mx-5 mb-5 rounded-xl bg-[#edf8f7] px-4 py-4 sm:mx-8 sm:mb-7 sm:px-5">
            <p className="text-[10px] font-extrabold uppercase tracking-[.2em] text-[#087f91]">Your five-minute close-out checklist</p>
            <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-[11px] text-slate-700 sm:grid-cols-3">
              {["Review today's new connections","Record where you met","Capture what each person needs","Choose one next action","Set a realistic deadline","Review outstanding follow-ups"].map((x) => <div key={x} className="flex items-start gap-2"><span className="mt-0.5 inline-block h-3.5 w-3.5 shrink-0 rounded border border-[#0a9297]" />{x}</div>)}
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[#cce8e5] pt-3"><p className="text-xs font-extrabold text-[#071a35]">Five intentional minutes can change what happens next.</p><p className="text-[10px] font-bold tracking-wide text-[#087f91]">DIGICON · MORE THAN A DIGITAL BUSINESS CARD</p></div>
          </footer>
        </article>
        <p className="mt-4 text-center text-xs text-slate-500 print:hidden">Choose “Save as PDF” in your browser’s print destination. Print layout is formatted for one A4 page.</p>
      </div>
      <style>{`
        @page { size: A4; margin: 8mm; }
        @media print {
          html, body { background: #fff !important; }
          body * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          #digicon-networking-tracker { width: 100% !important; max-width: none !important; zoom: .78; }
          .print\\:hidden { display: none !important; }
          article { break-inside: avoid; }
        }
      `}</style>
    </main>
  );
}

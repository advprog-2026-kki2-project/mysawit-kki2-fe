import { SiteHeader } from "@/components/site-header";
import { PlantationManager } from "@/modules/plantation/components/plantation-manager";

export function PlantationPage() {
  return (
    <div className="page-shell bg-background text-foreground min-h-screen">
      <SiteHeader
        navLinks={[
          { href: "/", label: "Beranda" },
          { href: "/plantations", label: "Plantations" },
        ]}
      />

      <main className="pb-16">
        <section className="mx-auto max-w-6xl px-6 py-12 lg:px-8 lg:py-16">
          <div className="space-y-8">
            <div className="max-w-3xl space-y-4">
              <span className="badge inline-flex items-center text-[10px] bg-forest-100 text-forest px-3.5 py-1 rounded-full tracking-widest font-mono font-bold">
                MySawit Plantation Management
              </span>
              <h1 className="display-title text-4xl sm:text-5xl lg:text-6xl text-forest-700 font-extrabold tracking-tight">
                Plantation Management.
              </h1>
              <p className="text-sm sm:text-base leading-relaxed text-ink-700 max-w-2xl">
                Configure and manage plantations, including setting boundaries and assigning personnel.
              </p>
            </div>

            <PlantationManager />
          </div>
        </section>
      </main>
    </div>
  );
}

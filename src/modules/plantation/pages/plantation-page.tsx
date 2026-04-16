import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { PlantationManager } from "@/modules/plantation/components/plantation-manager";

export function PlantationPage() {
  return (
    <div className="page-shell bg-background text-foreground">
      <SiteHeader
        navLinks={[
          { href: "/", label: "Beranda" },
          { href: "/plantations", label: "Plantations" },
        ]}
      />

      <main className="hero-atmosphere">
        <section className="mx-auto max-w-6xl px-6 py-12 lg:px-8 lg:py-18">
          <div className="space-y-6">
            <div className="max-w-2xl">
              <Badge>Plantation</Badge>
              <h1 className="display-title mt-5 text-[2.8rem] sm:text-[3.6rem]">
                Kelola data plantation.
              </h1>
              <p className="mt-4 text-base leading-7 text-[#666666]">
                Halaman ini memakai flow CRUD plantation yang sudah tersedia di
                backend.
              </p>
            </div>

            <PlantationManager />
          </div>
        </section>
      </main>
    </div>
  );
}

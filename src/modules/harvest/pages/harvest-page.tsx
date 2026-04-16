import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { HarvestSubmitForm } from "@/modules/harvest/components/harvest-submit-form";

export function HarvestPage() {
  return (
    <div className="page-shell bg-background text-foreground">
      <SiteHeader
        navLinks={[
          { href: "/", label: "Beranda" },
          { href: "/harvest", label: "Panen" },
        ]}
      />

      <main className="hero-atmosphere">
        <section className="mx-auto max-w-6xl px-6 py-12 lg:px-8 lg:py-18">
          <div className="space-y-6">
            <div className="max-w-2xl">
              <Badge>Harvest</Badge>
              <h1 className="display-title mt-5 text-[2.8rem] sm:text-[3.6rem]">
                Kirim panen harian.
              </h1>
              <p className="mt-4 text-base leading-7 text-[#666666]">
                Halaman ini terhubung ke flow submit panen yang sudah ada di
                backend.
              </p>
            </div>

            <HarvestSubmitForm />
          </div>
        </section>
      </main>
    </div>
  );
}

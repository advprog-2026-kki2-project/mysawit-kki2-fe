"use client";

import { Syne, Plus_Jakarta_Sans } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import { useAuthSession } from "@/modules/auth/hooks/use-auth-session";
import { HarvestSubmitForm } from "../components/harvest-submit-form";
import { HarvestHistoryList } from "../components/harvest-history-list";
import { ForemanValidationQueue } from "../components/foreman-validation-queue";


const syne = Syne({ subsets: ["latin"], weight: ["700"] });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

export default function HarvestDashboardPage() {
  const { session, isLoading } = useAuthSession();

  if (isLoading) {
    return <div className="min-h-screen bg-[#FFFFF1]" />; 
  }

  return (
    <div className={`min-h-screen bg-[#FFFFF1] text-[#1A1C18] ${jakarta.className}`}>
      <SiteHeader
        navLinks={[
          { href: "/", label: "Home" },
          { href: "/harvest", label: "Harvest" },
        ]}
      />

      <main className="pb-[96px]">
        <section className="mx-auto max-w-[1440px] px-[24px] lg:px-[32px] py-[48px] lg:py-[64px]">
          
          {session?.role === "FOREMAN" ? (
            <div className="space-y-[48px]">
              <div className="max-w-2xl">
                <span className="inline-flex items-center justify-center min-h-[24px] px-[10px] py-[3px] rounded-[9999px] text-[11px] font-mono font-bold tracking-[0.06em] uppercase bg-[#F3E7D2] text-[#774E15]">
                  Foreman Dashboard
                </span>
                <h1 className={`mt-[20px] text-[48px] font-bold leading-[1.04] tracking-[-1.5px] text-[#415B2B] ${syne.className}`}>
                  Harvest Validation
                </h1>
                <p className="mt-[16px] text-[20px] font-medium leading-[1.5] text-[#3D4038]">
                  Review photo evidence and validate daily harvest submissions.
                </p>
              </div>
              
              <ForemanValidationQueue />
            </div>
          ) : (
            <div className="space-y-[64px] max-w-[1120px] mx-auto">
              <div className="max-w-2xl">
                <span className="inline-flex items-center justify-center min-h-[24px] px-[10px] py-[3px] rounded-[9999px] text-[11px] font-mono font-bold tracking-[0.06em] uppercase bg-[#EDF7E2] text-[#415B2B]">
                  Laborer Dashboard
                </span>
                <h1 className={`mt-[20px] text-[48px] font-bold leading-[1.04] tracking-[-1.5px] text-[#415B2B] ${syne.className}`}>
                  Daily Harvest
                </h1>
                <p className="mt-[16px] text-[20px] font-medium leading-[1.5] text-[#3D4038]">
                  Submit your daily harvest records and track your validation history.
                </p>
              </div>

              <HarvestSubmitForm />

              <div className="pt-[32px] border-t border-[#E8E8DF]">
                <HarvestHistoryList />
              </div>
            </div>
          )}

        </section>
      </main>
    </div>
  );
}
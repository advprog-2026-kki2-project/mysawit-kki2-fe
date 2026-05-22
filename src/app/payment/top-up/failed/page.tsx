import { Suspense } from "react";

import { XenditTopUpResultPage } from "@/modules/payroll/pages/xendit-top-up-result-page";

export default function PaymentTopUpFailedRoute() {
  return (
    <Suspense>
      <XenditTopUpResultPage result="failed" />
    </Suspense>
  );
}

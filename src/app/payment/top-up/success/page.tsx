import { Suspense } from "react";

import { XenditTopUpResultPage } from "@/modules/payroll/pages/xendit-top-up-result-page";

export default function PaymentTopUpSuccessRoute() {
  return (
    <Suspense>
      <XenditTopUpResultPage result="success" />
    </Suspense>
  );
}

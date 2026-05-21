import type { AuthResponse } from "@/modules/auth/data/types";
import {
  getForemanHarvests,
  getLaborerHarvestHistory,
} from "@/modules/harvest/data/harvest-api";
import type { HarvestRecord } from "@/modules/harvest/data/types";
import { getPayrolls } from "@/modules/payroll/data/payroll-api";
import type { Payroll } from "@/modules/payroll/data/types";
import { getPlantations } from "@/modules/plantation/data/plantation-api";
import type { Plantation } from "@/modules/plantation/data/types";
import {
  getDriverDeliveries,
  getForemanApprovedDeliveries,
  getOngoingDeliveries,
} from "@/modules/transport/data/transport-api";
import type { Transport } from "@/modules/transport/data/types";
import { getUsers } from "@/modules/users/data/users-api";
import type { User } from "@/modules/users/data/types";

export type DashboardOverview = {
  harvests: HarvestRecord[];
  payrolls: Payroll[];
  plantations: Plantation[];
  transports: Transport[];
  users: User[];
  errors: string[];
};

const emptyOverview: DashboardOverview = {
  harvests: [],
  payrolls: [],
  plantations: [],
  transports: [],
  users: [],
  errors: [],
};

const pendingOverviewRequests = new Map<string, Promise<DashboardOverview>>();

async function settle<T>(
  label: string,
  request: Promise<T[]>,
): Promise<{ label: string; value: T[]; error: string | null }> {
  try {
    return { label, value: await request, error: null };
  } catch (caughtError) {
    return {
      label,
      value: [],
      error:
        caughtError instanceof Error
          ? `${label}: ${caughtError.message}`
          : `${label}: data tidak dapat dimuat.`,
    };
  }
}

export async function getDashboardOverview(
  session: AuthResponse,
): Promise<DashboardOverview> {
  const cacheKey = `${session.role}:${session.username}`;
  const pendingRequest = pendingOverviewRequests.get(cacheKey);

  if (pendingRequest) {
    return pendingRequest;
  }

  const request = loadDashboardOverview(session).finally(() => {
    pendingOverviewRequests.delete(cacheKey);
  });

  pendingOverviewRequests.set(cacheKey, request);
  return request;
}

async function loadDashboardOverview(
  session: AuthResponse,
): Promise<DashboardOverview> {
  const requests: Array<Promise<{ label: string; value: unknown[]; error: string | null }>> = [];

  if (session.role === "ADMIN") {
    requests.push(settle("Users", getUsers()));
    requests.push(settle("Plantations", getPlantations()));
    requests.push(settle("Transport", getForemanApprovedDeliveries()));
    requests.push(settle("Payroll", getPayrolls({ status: "ALL" })));
  }

  if (session.role === "FOREMAN") {
    requests.push(settle("Harvest", getForemanHarvests({})));
    requests.push(settle("Transport", getOngoingDeliveries()));
    requests.push(
      settle(
        "Payroll",
        getPayrolls({ beneficiaryReference: session.username, status: "ALL" }),
      ),
    );
  }

  if (session.role === "LABORER") {
    requests.push(settle("Harvest", getLaborerHarvestHistory({})));
    requests.push(
      settle(
        "Payroll",
        getPayrolls({ beneficiaryReference: session.username, status: "ALL" }),
      ),
    );
  }

  if (session.role === "DRIVER") {
    requests.push(settle("Transport", getDriverDeliveries(session.username)));
    requests.push(
      settle(
        "Payroll",
        getPayrolls({ beneficiaryReference: session.username, status: "ALL" }),
      ),
    );
  }

  const results = await Promise.all(requests);

  return results.reduce<DashboardOverview>((overview, result) => {
    if (result.error) {
      overview.errors.push(result.error);
      return overview;
    }

    if (result.label === "Harvest") {
      overview.harvests = result.value as HarvestRecord[];
    }
    if (result.label === "Payroll") {
      overview.payrolls = result.value as Payroll[];
    }
    if (result.label === "Plantations") {
      overview.plantations = result.value as Plantation[];
    }
    if (result.label === "Transport") {
      overview.transports = result.value as Transport[];
    }
    if (result.label === "Users") {
      overview.users = result.value as User[];
    }

    return overview;
  }, {
    harvests: [...emptyOverview.harvests],
    payrolls: [...emptyOverview.payrolls],
    plantations: [...emptyOverview.plantations],
    transports: [...emptyOverview.transports],
    users: [...emptyOverview.users],
    errors: [...emptyOverview.errors],
  });
}

import {
  getFinancialMetrics,
  getOrdersForExport,
} from "@/app/_actions/financial";
import FinancialDashboard from "./_components/financial-dashboard";
import { Suspense } from "react";

export default async function AdminFinanceiro({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const params = await searchParams;
  const dateFrom = params.from || undefined;
  const dateTo = params.to || undefined;

  const [metrics, orders] = await Promise.all([
    getFinancialMetrics(dateFrom, dateTo),
    getOrdersForExport(dateFrom, dateTo),
  ]);

  return (
    <Suspense>
      <FinancialDashboard metrics={metrics} orders={orders} />
    </Suspense>
  );
}

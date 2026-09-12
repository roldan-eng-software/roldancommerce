import {
  getFinancialMetrics,
  getOrdersForExport,
} from "@/app/_actions/financial";
import FinancialDashboard from "./_components/financial-dashboard";

export default async function AdminFinanceiro() {
  const [metrics, orders] = await Promise.all([
    getFinancialMetrics(),
    getOrdersForExport(),
  ]);

  return <FinancialDashboard metrics={metrics} orders={orders} />;
}

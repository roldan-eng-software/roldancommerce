import { getSalesStats } from "@/app/_actions/stats";
import StatsClient from "./_components/stats-client";
import { Suspense } from "react";

export default async function AdminEstatisticas({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const params = await searchParams;
  const days = parseInt(params.period || "30", 10);

  const dateTo = new Date().toISOString().split("T")[0];
  const dateFrom = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const data = await getSalesStats(dateFrom, dateTo);

  return (
    <Suspense>
      <StatsClient data={data} />
    </Suspense>
  );
}

import { getSalesStats } from "@/app/_actions/stats";
import StatsClient from "./_components/stats-client";

export default async function AdminEstatisticas() {
  const data = await getSalesStats();

  return <StatsClient data={data} />;
}

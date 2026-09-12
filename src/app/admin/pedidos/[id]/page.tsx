import { notFound } from "next/navigation";
import { getOrderDetailAdmin } from "@/app/_actions/orders-admin";
import OrderDetailClient from "../_components/order-detail-client";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrderDetailAdmin(id);

  if (!order) {
    notFound();
  }

  return <OrderDetailClient order={order} />;
}

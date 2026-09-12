import { getOrdersAdmin } from "@/app/_actions/orders-admin";
import OrdersListClient from "./_components/orders-list-client";

export default async function AdminPedidos() {
  const orders = await getOrdersAdmin();

  return <OrdersListClient orders={orders} />;
}

import { getShippingOrders } from "@/app/_actions/shipping";
import ShippingClient from "./_components/shipping-client";

export default async function AdminEntregas() {
  const orders = await getShippingOrders();

  return <ShippingClient orders={orders} />;
}

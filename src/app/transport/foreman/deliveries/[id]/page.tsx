import { DeliveryDetailPage } from "@/modules/transport/pages/delivery-detail-page";

export default function ForemanDeliveryDetailRoute({ params }: { params: { id: string } }) {
  return <DeliveryDetailPage />;
}

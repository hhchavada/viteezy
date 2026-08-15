import { Order } from "@/components/types/account";
import React from "react";
import OrderSummary from "./OrderSummary";
import OrderCard from "./OrderCard";

interface OrderItemCardProps {
  order: Order;
}

const OrderItem: React.FC<OrderItemCardProps> = ({ order }) => {
  return (
    <div className="border rounded-2xl overflow-hidden">
      <OrderSummary order={order} />
      <div className="space-y-8 mt-7 p-5 pt-0">
        {order.items.map((item, itemIndex) => {
          return (
            <OrderCard
              order={order}
              item={item}
              key={"order" + itemIndex}
              index={itemIndex}
            />
          );
        })}
      </div>
    </div>
  );
};

export default OrderItem;

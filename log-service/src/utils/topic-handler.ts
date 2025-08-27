import type { MessageHandler, Order, Payment, Wrapper } from "@/types";
import { topics } from "./constants";

export const topicHandlers: Record<string, MessageHandler<any>> = {
  [topics.paymentDone]: ({ message: msg, data }: Wrapper<Payment>) => {
    console.log("Payment", msg, data);
  },
  [topics.orderDone]: ({ message: msg, data }: Wrapper<Order>) => {
    console.log("Order", msg, data);
  },
};
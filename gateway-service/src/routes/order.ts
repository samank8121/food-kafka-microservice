import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { sendKafkaMessage } from "../utils/kafka";
import type { Order, ApiResponse } from "../types";
import { topics } from "@/constants";

interface PostOrderRequest {
  Body: Order;
}

export default async function orderRoute(server: FastifyInstance) {
  server.get("/", async () => {
    return { message: "Order Service Ready" };
  });

  server.post<PostOrderRequest>("/", async (request: FastifyRequest<PostOrderRequest>, reply: FastifyReply) => {
    const { orderId, customerName, items, total } = request.body;

    if (!orderId || !customerName || !items?.length || total <= 0) {
      return reply.status(400).send({
        message: "Invalid order data",
        error: "orderId, customerName, items, and total are required"
      });
    }

    const orderResponse: ApiResponse<Order> = {
      message: "Order created successfully",
      data: {
        orderId,
        customerName,
        items,
        total
      },
      timestamp: new Date().toISOString()
    };

    try {
      await sendKafkaMessage(topics.orderDone, orderResponse);
      return reply.status(201).send(orderResponse);
    } catch (error) {
      server.log.error(error);
      return reply.status(500).send({
        message: "Failed to create order",
        error: "Internal server error"
      });
    }
  });
}
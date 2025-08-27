import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { sendKafkaMessage } from "../utils/kafka";
import type { Payment, ApiResponse } from "../types";
import { topics } from "@/constants";

interface PostPaymentRequest {
  Body: Payment;
}

export default async function paymentRoute(server: FastifyInstance) {
  server.get("/", async () => {
    return { message: "Payment Service Ready" };
  });

  server.post<PostPaymentRequest>("/", async (request: FastifyRequest<PostPaymentRequest>, reply: FastifyReply) => {
    const { paymentId, orderId, amount, method, status } = request.body;

    if (!paymentId || !orderId || amount <= 0 || !method || !status) {
      return reply.status(400).send({
        message: "Invalid payment data",
        error: "paymentId, orderId, amount, method, and status are required"
      });
    }

    const paymentResponse: ApiResponse<Payment> = {
      message: "Payment processed successfully",
      data: {
        paymentId,
        orderId,
        amount,
        method,
        status
      },
      timestamp: new Date().toISOString()
    };

    try {
      await sendKafkaMessage(topics.paymentDone, paymentResponse);
      return reply.status(201).send(paymentResponse);
    } catch (error) {
      server.log.error(error);
      return reply.status(500).send({
        message: "Failed to process payment",
        error: "Internal server error"
      });
    }
  });
}
import Fastify from "fastify";
import paymentRoute from "./routes/payment";
import orderRoute from "./routes/order";
import { connectToKafka, disconnectKafka } from "./utils/kafka";

const server = Fastify({
  logger: {
    level: 'info',
    transport: {
      target: 'pino-pretty'
    }
  }
});

server.register(paymentRoute, { prefix: "/api/payment" });
server.register(orderRoute, { prefix: "/api/order" });

// Health check endpoint
server.get("/health", async () => {
  return { status: "ok", timestamp: new Date().toISOString() };
});

const start = async () => {
  try {
    await connectToKafka();
    await server.listen({ port: 3100, host: "0.0.0.0" });
    server.log.info("🚀 Server running at http://localhost:3100");
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

const shutdown = async () => {
  try {
    await server.close();
    await disconnectKafka();
    server.log.info("Server and Kafka connections closed");
    process.exit(0);
  } catch (err) {
    if (err instanceof Error) {
      server.log.error({ err }, "Error during shutdown");
    } else {
      server.log.error({ err: String(err) }, "Error during shutdown");
    }
    process.exit(1);
  }
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

start();
import { Kafka } from "kafkajs";
import type { Producer, Consumer, EachMessagePayload } from "kafkajs";
import type { Payment, Wrapper } from "./types";
import { kafkaBrokers, serviceName, topics } from "./constants";

const kafka = new Kafka({
  clientId: serviceName,
  brokers: kafkaBrokers,
});

const producer: Producer = kafka.producer();
const consumer: Consumer = kafka.consumer({ groupId: serviceName });

const disconnectKafka = async () => {
  try {
    await Promise.allSettled([producer.disconnect(), consumer.disconnect()]);
    console.log("Kafka producer and consumer disconnected.");
  } catch (err) {
    console.error("Error disconnecting Kafka:", err);
  }
};

const run = async (): Promise<void> => {
  try {
    await producer.connect();
    await consumer.connect();

    await consumer.subscribe({
      topics: [topics.paymentDone],
      fromBeginning: true,
    });

    await consumer.run({
      eachMessage: async ({ topic, message }: EachMessagePayload) => {
        if (!message.value) return;

        try {
          const { message: msg, data } = JSON.parse(
            message.value.toString()
          ) as Wrapper<Payment>;
          console.log("Payment", msg, data);
        } catch (err) {
          console.error("Error processing message:", err);
          await disconnectKafka();
          process.exit(1);
        }
      },
    });

    console.log("Log service is running...");
  } catch (err) {
    console.error("Kafka error:", err);
    await disconnectKafka();
    process.exit(1);
  }
};

// Graceful shutdown on signals
process.on("SIGINT", disconnectKafka);
process.on("SIGTERM", disconnectKafka);

run().catch(async (err) => {
  console.error("Fatal error:", err);
  await disconnectKafka();
  process.exit(1);
});

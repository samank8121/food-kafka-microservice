import { Kafka } from "kafkajs";
import { kafkaBrokers, serviceName } from "./constants";
import type { Producer, Consumer, EachMessagePayload } from "kafkajs";
import { topicHandlers } from "./topic-handler";

const kafka = new Kafka({
  clientId: serviceName,
  brokers: kafkaBrokers,
});

const producer: Producer = kafka.producer();
const consumer: Consumer = kafka.consumer({ groupId: serviceName });

export const connectKafka = async (): Promise<void> => {
  try {
    await producer.connect();
    await consumer.connect();
    console.log("Kafka producer and consumer connected.");
  } catch (err) {
    console.error("Error connecting to Kafka:", err);
    throw err;
  }
};
export const disconnectKafka = async () => {
  try {
    await Promise.allSettled([producer.disconnect(), consumer.disconnect()]);
    console.log("Kafka producer and consumer disconnected.");
  } catch (err) {
    console.error("Error disconnecting Kafka:", err);
  }
};

export const consume = async (): Promise<void> => {
  await consumer.subscribe({
    topics: Object.keys(topicHandlers),
    fromBeginning: true,
  });

  await consumer.run({
    eachMessage: async ({ topic, message }: EachMessagePayload) => {
      if (!message.value) return;

      try {
        const handler = topicHandlers[topic];
        if (handler) {
          const parsedMessage = JSON.parse(message.value.toString());
          handler(parsedMessage);
        } else {
          console.log(`Received message on unknown topic ${topic}`);
        }
      } catch (err) {
        console.error("Error processing message:", err);
        await disconnectKafka(); // disconnect if error while consuming
        process.exit(1);
      }
    },
  });
};

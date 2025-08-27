import { Kafka } from "kafkajs";
import type { Producer } from "kafkajs";

const kafka = new Kafka({
  clientId: "gateway-service",
  brokers: ["localhost:9094"],
});

const producer: Producer = kafka.producer();

export const connectToKafka = async () => {
  try {
    await producer.connect();
    console.log("Connected to Kafka successfully");
  } catch (error) {
    console.error("Failed to connect to Kafka:", error);
    throw error;
  }
};

export const sendKafkaMessage = async (topic: string, message: any) => {
  try {
    await producer.send({
      topic,
      messages: [{ value: JSON.stringify(message) }],
    });
    console.log(`Message sent to topic ${topic}`);
  } catch (error) {
    console.error(`Error sending message to topic ${topic}:`, error);
    throw error;
  }
};

export const disconnectKafka = async () => {
  try {
    await producer.disconnect();
    console.log("Disconnected from Kafka");
  } catch (error) {
    console.error("Error disconnecting from Kafka:", error);
    throw error;
  }
};
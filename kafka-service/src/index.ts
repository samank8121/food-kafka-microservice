import { Kafka } from "kafkajs";

const kafka = new Kafka({
  clientId: "kafka-service",
  brokers: ["localhost:9094"],
});

const admin = kafka.admin();

const run = async () => {
  await admin.connect();
  await admin.createTopics({
    topics: [
      { topic: "gateway-successful" },
      { topic: "payment-successful" },
      { topic: "order-successful" },
      { topic: "log-register" },
      { topic: "email-successful" },
    ],
  });
};

run();

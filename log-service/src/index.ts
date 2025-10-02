import { connectKafka, consume, disconnectKafka } from "./utils/kafka";


const run = async (): Promise<void> => {
  try {
    await connectKafka();

    await consume();
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

import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  console.warn("⚠️ REDIS_URL environment variable is missing. Redis functions might fail.");
}

// ioredis client configuration
export const redisConnection = new Redis(redisUrl, {
  maxRetriesPerRequest: null, // Required by BullMQ
});

redisConnection.on("connect", () => console.log("Connected to Redis"));
redisConnection.on("error", (err) => console.error("Redis Connection Error:", err));

export default redisConnection;

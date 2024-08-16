import { WebClient } from "@slack/web-api";
import cron from "node-cron";

import dotenv from "dotenv";
dotenv.config();

const token = process.env.SLACK_BOT_TOKEN;
const channel = process.env.SLACK_CHANNEL_ID + "";
const poems = [
  "The woods are lovely, dark and deep, But I have promises to keep...",
  "Hope is the thing with feathers that perches in the soul...",
  "I wandered lonely as a cloud that floats on high o'er vales and hills...",
  // Add more poems here
];

const client = new WebClient(token);

async function sendRandomPoem() {
  const randomPoem = poems[Math.floor(Math.random() * poems.length)];

  console.log(channel, token);

  try {
    await client.chat.postMessage({
      channel: channel,
      text: randomPoem,
    });
    console.log("Poem sent successfully");
  } catch (error) {
    console.error("Error sending poem:", error);
  }
}

// Schedule to run every morning at 9:00 AM
// cron.schedule("0 9 * * *", sendRandomPoem);

console.log("Poem bot is running...");

// Manually trigger the sendRandomPoem function for testing
sendRandomPoem();

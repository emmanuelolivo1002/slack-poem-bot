import { WebClient } from "@slack/web-api";
import cron from "node-cron";
import dotenv from "dotenv";

dotenv.config();

const token = process.env.SLACK_BOT_TOKEN;
const channel = process.env.SLACK_CHANNEL_ID + "";
const apiLeagueKey = process.env.API_LEAGUE_KEY + "";

const client = new WebClient(token);

type PoemResponse = {
  title: string;
  author: string;
  poem: string;
};

async function fetchPoemFromAPI(): Promise<PoemResponse> {
  try {
    const response = await fetch("https://api.apileague.com/retrieve-random-poem", {
      headers: {
        "x-api-key": apiLeagueKey,
      },
    });
    if (!response.ok) {
      throw new Error(`Error fetching poem: ${response.statusText}`);
    }
    const data = (await response.json()) as PoemResponse;
    return data;
  } catch (error) {
    console.error("Error fetching poem from API:", error);
    throw new Error("Error fetching poem from API");
  }
}

async function sendRandomPoem() {
  try {
    const { poem, author, title } = await fetchPoemFromAPI();

    console.log(channel, token);

    //  Format Poem
    const formattedBlocks = [
      // Intro Message
      {
        type: "section",
        text: {
          type: "plain_text",
          text: `:sunrise:Good Morning Unfolded team! \n Today I bring you a poem by ${author}:`,
          emoji: true,
        },
      },

      {
        type: "divider",
      },

      // Poem Title
      {
        type: "header",
        text: {
          type: "plain_text",
          text: title,
          emoji: true,
        },
      },

      // Poem content
      {
        type: "rich_text",
        elements: [
          {
            type: "rich_text_quote",
            elements: [
              {
                type: "text",
                text: poem,
              },
            ],
          },
        ],
      },

      {
        type: "divider",
      },

      // Goodbye Message
      {
        type: "section",
        text: {
          type: "plain_text",
          text: "Hope you liked that! I'll come back {tomorrow} to bring you a different poem. Love you all! :heart:",
          emoji: true,
        },
      },
    ];
    await client.chat.postMessage({
      channel: channel,
      blocks: formattedBlocks,
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

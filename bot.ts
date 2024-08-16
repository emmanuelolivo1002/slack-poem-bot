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
    // Get poems data
    const { poem, author, title } = await fetchPoemFromAPI();

    // Get dates
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 is Sunday, 1 is Monday, ..., 5 is Friday, 6 is Saturday

    let nextDayText = "";
    if (dayOfWeek === 5) {
      // If today is Friday
      nextDayText = "Monday";
    } else {
      nextDayText = "tomorrow";
    }

    let extraIntroMessage = "";
    let extraGoodbyeMessage = "";

    // If Monday
    if (dayOfWeek === 1) {
      extraIntroMessage = "I hope you had a great weekend! ";
      extraGoodbyeMessage = "Let's make this week a great one!";
    } else if (dayOfWeek === 5) {
      extraIntroMessage = "Finally the weekend is here!";
      extraGoodbyeMessage = "Enjoy your weekend! I'll miss you!";
    }

    //  Format Poem
    const formattedBlocks = [
      // Intro Message
      {
        type: "section",
        text: {
          type: "plain_text",
          text: `:sunrise: Good Morning Unfolded team! ${extraIntroMessage} \n Today I bring you a poem by ${author}:`,
          emoji: true,
        },
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

      // Goodbye Message
      {
        type: "section",
        text: {
          type: "plain_text",
          text: `Hope you liked that! I'll come back ${nextDayText} to bring you a different poem. ${extraGoodbyeMessage} Love you all! :heart:`,
          emoji: true,
        },
      },
    ];
    await client.chat.postMessage({
      channel: channel,
      text: `:sunrise: Good Morning Unfolded team! \n Today I bring you a poem by ${author}!`,
      blocks: formattedBlocks,
    });
    console.log("Poem sent successfully");
  } catch (error) {
    console.error("Error sending poem:", error);
  }
}

// Schedule to run every weekday (Monday to Friday) at 8:00 AM Central Time
cron.schedule("0 8 * * 1-5", sendRandomPoem, {
  timezone: "America/Chicago",
});

console.log("Poem bot is running...");

// Manually trigger the sendRandomPoem function for testing
// sendRandomPoem();

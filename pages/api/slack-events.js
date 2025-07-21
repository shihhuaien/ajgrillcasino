// pages/api/slack-events.js

// 解析環境變數中的 JSON 映射
let channelMappings = [];
try {
  if (process.env.CHANNEL_MAPPINGS) {
    channelMappings = JSON.parse(process.env.CHANNEL_MAPPINGS);
  }
} catch (e) {
  console.error("Error parsing CHANNEL_MAPPINGS environment variable:", e);
}

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { challenge, event, type } = req.body;

    // Slack URL Verification
    if (type === "url_verification") {
      return res.status(200).send(challenge);
    }

    // Handle Slack Message Event
    if (type === "event_callback" && event && event.type === "message") {
      // 忽略 Bot 自己的訊息，避免無限循環
      if (event.bot_id || event.subtype === "bot_message") {
        return res.status(200).send("Bot message ignored.");
      }

      const { user, text, channel } = event;

      // 尋找匹配的映射
      const mapping = channelMappings.find(
        (m) => m.slack_channel_id === channel
      );

      if (mapping) {
        console.log(
          `Received message from Slack channel ${channel}: ${text} by user ${user}`
        );

        // 在這裡將訊息發送到 Microsoft Teams，並傳遞對應的 webhook URL
        await sendToTeams(user, text, channel, mapping.teams_webhook_url);

        return res.status(200).send("Message processed.");
      } else {
        return res.status(200).send("Message from non-target channel ignored.");
      }
    }

    return res.status(200).send("Event not handled.");
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

// sendToTeams 函數現在接受一個 webhookUrl 參數
async function sendToTeams(
  slackUser,
  messageText,
  slackChannel,
  teamsWebhookUrl
) {
  if (!teamsWebhookUrl) {
    console.error("Teams Webhook URL is not set for this mapping.");
    return;
  }

  // 你可以透過 Slack API 查詢用戶名稱和頻道名稱，讓 Teams 訊息更清晰
  // 這裡為了簡化，直接使用 user ID 和 channel ID
  // 實際應用中，你可能需要額外呼叫 Slack API (users.info, conversations.info)
  // 來獲取用戶名和頻道名。

  const payload = {
    "@type": "MessageCard",
    "@context": "http://schema.org/extensions",
    summary: "Slack Message",
    sections: [
      {
        activityTitle: `來自 Slack 頻道訊息`,
        activitySubtitle: `#${slackChannel}`, // 實際應顯示頻道名稱
        activityText: `**<@${slackUser}>**: ${messageText}`, // 實際應顯示用戶名稱
        markdown: true,
      },
    ],
  };

  try {
    const response = await fetch(teamsWebhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      console.log("Message successfully sent to Teams.");
    } else {
      const errorText = await response.text();
      console.error(
        "Failed to send message to Teams:",
        response.status,
        errorText
      );
    }
  } catch (error) {
    console.error("Error sending message to Teams:", error);
  }
}

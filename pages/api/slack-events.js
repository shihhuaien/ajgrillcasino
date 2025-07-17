// pages/api/slack-events.js

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

      // 檢查是否是特定頻道
      // 你需要替換 'YOUR_SLACK_CHANNEL_ID' 為你想要同步的 Slack 頻道 ID
      // 你可以在 Slack 桌面版中，右鍵點擊頻道名稱 -> "Copy link" 來找到頻道 ID (Cxxxxxxxxxx)
      const targetSlackChannelId = "C0969BRTRRS";

      if (channel === targetSlackChannelId) {
        console.log(
          `Received message from Slack channel ${channel}: ${text} by user ${user}`
        );

        // 在這裡將訊息發送到 Microsoft Teams
        await sendToTeams(user, text, channel);

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

async function sendToTeams(slackUser, messageText, slackChannel) {
  const teamsWebhookUrl = process.env.TEAMS_WEBHOOK_URL;
  if (!teamsWebhookUrl) {
    console.error("TEAMS_WEBHOOK_URL is not set.");
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

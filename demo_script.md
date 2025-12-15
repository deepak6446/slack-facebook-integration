# Video Walkthrough Script: Slack-Facebook Integration

This script guides you through recording the setup and demonstration video for your Slack-Facebook integration.

## Preparation
1.  **Open Tabs**: Have the following browser tabs open:
    *   **Meta for Developers Portal**: [developers.facebook.com](https://developers.facebook.com) (App Dashboard)
    *   **Slack API Portal**: [api.slack.com/apps](https://api.slack.com/apps)
    *   **Facebook Page Inbox**: The inbox of the Facebook Page you are testing with.
    *   **Slack Workspace**: The `#facebook-updates` channel.
2.  **Terminal**: Have your terminal ready with the project open.
3.  **Code Editor**: Have VS Code (or your editor) open with the project.

---

## Part 1: Introduction & Prerequisites (0:00 - 0:30)

*   **Action**: Start with your code editor open.
*   **Voiceover**: "Hi, this is a walkthrough of the Slack-Facebook integration. This system automatically forwards messages received on a Facebook Page to a dedicated Slack channel using NestJS, Kafka, and MongoDB."
*   **Action**: Show your terminal.
*   **Voiceover**: "First, I have my infrastructure running with Docker Compose, including Kafka and MongoDB."
    *   *Run command*: `docker compose ps` (to show containers running).
*   **Action**: Show the `.env` file (briefly, or blur secrets).
*   **Voiceover**: "I've configured my environment variables, including the Facebook App Secret, Verify Token, and Slack Bot Token."

## Part 2: Slack App Setup (0:30 - 1:30)

*   **Action**: Switch to **Slack API Portal**.
*   **Voiceover**: "Let's look at the Slack App setup."
*   **Action**: Click on your App -> **OAuth & Permissions**.
*   **Voiceover**: "In 'OAuth & Permissions', I've added the `chat:write` scope under 'Bot Token Scopes'. This allows the bot to post messages."
*   **Action**: Scroll up to **OAuth Tokens for Your Workspace**.
*   **Voiceover**: "I've installed the app to my workspace and copied this 'Bot User OAuth Token' to my `.env` file."
*   **Action**: Switch to **Slack Workspace**.
*   **Voiceover**: "In Slack, I've created a channel named `#facebook-updates` and added the bot integration to this channel."

## Part 3: Facebook App Setup (1:30 - 2:30)

*   **Action**: Switch to **Meta for Developers Portal**.
*   **Voiceover**: "Now for the Facebook App."
*   **Action**: Go to **Messenger** -> **Instagram settings** (or just **Messenger API Settings**). Scroll to **Webhooks**.
*   **Voiceover**: "I've configured the Webhook here."
    *   *Show*: **Callback URL** (your ngrok URL) and **Verify Token**.
*   **Action**: Show your terminal with `ngrok` running.
*   **Voiceover**: "I'm using ngrok to expose my local server to Facebook."
*   **Action**: Back to Facebook Portal -> **Webhooks**.
*   **Voiceover**: "I've subscribed to the `messages` event."
*   **Action**: Scroll to **Subscribed Apps** (or "Built-in NLP" section where you link pages).
*   **Voiceover**: "And I've subscribed my test Facebook Page to this app so it receives events."

## Part 4: The Demo (2:30 - End)

*   **Action**: Split your screen or switch between tabs to show **Facebook Page Inbox** and **Slack** side-by-side (if possible).
*   **Voiceover**: "Now, let's test the integration. I will send a message to my Facebook Page as a test user."
*   **Action**: On Facebook (as a user), send a message: "Hello, this is a live test message!"
*   **Action**: Immediately switch to **Slack** (channel `#facebook-updates`).
*   **Voiceover**: "And there it is! The message appears instantly in the Slack channel, showing the sender ID and the message content."
*   **Action**: (Optional) Show the terminal logs.
*   **Voiceover**: "In the logs, we can see the request was received, verified via HMAC, processed by Kafka, and sent to Slack."
*   **Voiceover**: "This concludes the demo. Thank you."

---

## Troubleshooting Tips for Recording
*   **Ngrok**: Ensure your ngrok URL in the Facebook Developer Portal matches the one currently running in your terminal. If you restarted ngrok, you must update the Callback URL on Facebook.
*   **Slack Token**: If you get `invalid_auth` errors, double-check your Slack Bot Token in `.env` and ensure the bot is invited to the channel.

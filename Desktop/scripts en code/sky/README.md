# Discord Bot

Simple Discord bot using `discord.py` with slash commands.

## Features

- Slash commands: `/raiz` (repeat a message), `/femboymeter` (random percentage)
- On ready log output with bot ID
- Welcome DM on member join (may fail if DMs are closed)

## Setup (Windows PowerShell)

1. Install Python (3.10+ recommended)
2. Create a virtual environment and activate it:
   ```powershell
   py -m venv .venv
   .\.venv\Scripts\Activate.ps1
   ```
3. Install dependencies:
   ```powershell
   pip install -r requirements.txt
   ```
4. Create a Discord application and bot:
   - Open the [Discord Developer Portal](https://discord.com/developers/applications)
   - New Application → Bot → Add Bot → Copy the token
   - In Bot → Privileged Gateway Intents: enable "Server Members Intent" and (optionally) "Message Content Intent"
5. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Put your token value after `DISCORD_TOKEN=` (no quotes; do not prefix with `Bot `)
6. Install the app (minimal permissions):
   - OAuth2 → URL Generator → Scopes: `applications.commands`
   - For most use cases, you do NOT need the `bot` scope.
   - Guild permission required for members to use commands: “Use External Apps”.
   - Open the generated URL, pick your server, and authorize.

   Optional (for public posting by the bot):
   - Add the `bot` scope and grant channel permissions like “Send Messages” (and “Send Messages in Threads” if needed).
7. (Optional) Verify your token:
   ```powershell
   python .\tools\verify_token.py
   ```
8. Run the bot:
   - One-click scripts:
     - PowerShell: `.& "$PSScriptRoot\start-bot.ps1"`
     - Batch (Explorer double-click): `start-bot.bat`
   - Or directly:
     ```powershell
     python .\bot.py
     ```

## Usage

- `/raiz message:<text> times:<1..10> public:<true|false>`
   - Default `public:true` → posts to the channel (requires “Send Messages”).
   - Set `public:false` → private ephemeral output (no extra perms).
- `/femboymeter user:<member>` — playful percentage result
 - `/femboymeter user:<member>` — posts result publicly; invoker stays private
 - `/gaymeter user:<member>` — posts result publicly; invoker stays private
 - `/diag` — private diagnostics of the bot’s channel permissions

## Security

- Do not commit your real `.env`. This repo’s `.gitignore` excludes `.env`.
- If your token was ever committed or shared, rotate it in the Developer Portal → Bot → Reset Token, update your `.env`, and re-run the bot.

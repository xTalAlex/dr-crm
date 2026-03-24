export function logError(path: string, err: unknown) {
  console.error("Unhandled API error:", err);

  const webhookUrl = import.meta.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) return;

  const description = String(err instanceof Error ? err.message : err).slice(0, 4000);

  fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: new URL(import.meta.env.BETTER_AUTH_URL).hostname,
      avatar_url: `${import.meta.env.BETTER_AUTH_URL}/logo.png`,
      embeds: [{
        title: "ERROR",
        description,
        color: 0xB22222,
        fields: [
          { name: "Path", value: `\`${path}\``, inline: true },
          { name: "Time", value: new Date().toISOString(), inline: true },
        ],
      }],
    }),
  }).catch(() => {});
}

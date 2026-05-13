const ADMIN_TOPIC = process.env["NTFY_ADMIN_TOPIC"] ?? "yemenchat-admin-ksd2025";

export async function sendNtfy(
  topic: string,
  title: string,
  message: string,
  priority = 3,
  tags: string[] = [],
): Promise<void> {
  try {
    await fetch(`https://ntfy.sh/${topic}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, message, priority, tags }),
    });
  } catch {
    // Silently fail — never break main flow
  }
}

export async function notifyAdmin(title: string, message: string, priority = 3): Promise<void> {
  return sendNtfy(ADMIN_TOPIC, `🔔 ${title}`, message, priority, ["yemenchat"]);
}

export function userTopic(userId: string): string {
  return `ychat-u-${userId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 10)}`;
}

export async function notifyUser(userId: string, title: string, message: string): Promise<void> {
  return sendNtfy(userTopic(userId), title, message, 4, ["tada"]);
}

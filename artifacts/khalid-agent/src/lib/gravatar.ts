export async function getGravatarUrl(email: string, size = 80): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(email.trim().toLowerCase());
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
    return `https://www.gravatar.com/avatar/${hashHex}?s=${size}&d=mp`;
  } catch {
    return "";
  }
}

export function getAvatarFallback(name: string): string {
  return name?.trim()?.[0]?.toUpperCase() ?? "؟";
}

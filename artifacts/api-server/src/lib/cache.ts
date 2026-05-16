interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class TTLCache<T = unknown> {
  private readonly store = new Map<string, CacheEntry<T>>();

  constructor(private readonly defaultTTL = 3_600_000) {
    setInterval(() => this.cleanup(), 300_000).unref();
  }

  get(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return entry.data;
  }

  set(key: string, data: T, ttl?: number): void {
    this.store.set(key, { data, expiresAt: Date.now() + (ttl ?? this.defaultTTL) });
  }

  get size(): number {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [k, e] of this.store) {
      if (now > e.expiresAt) this.store.delete(k);
    }
  }
}

export const imagePromptCache = new TTLCache<string>(86_400_000);
export const logoSvgCache = new TTLCache<string>(86_400_000);
export const websiteHtmlCache = new TTLCache<string>(3_600_000);

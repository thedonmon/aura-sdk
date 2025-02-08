import { CacheProvider } from "./cacheProvider";

  
  // Default in-memory cache implementation
  export class MemoryCache implements CacheProvider {
    private cache: Map<string, { value: any; expires: number }>;
  
    constructor() {
      this.cache = new Map();
    }
  
    async get(key: string): Promise<any> {
      const item = this.cache.get(key);
      if (!item) return null;
      if (item.expires && item.expires < Date.now()) {
        this.cache.delete(key);
        return null;
      }
      return item.value;
    }
  
    async set(key: string, value: any, ttl?: number): Promise<void> {
      this.cache.set(key, {
        value,
        expires: ttl ? Date.now() + ttl * 1000 : 0
      });
    }
  
    async delete(key: string): Promise<void> {
      this.cache.delete(key);
    }
  }
export class ImageCache {
    private cache: Map<string, HTMLImageElement> = new Map();
  
    getImage(src: string): HTMLImageElement {
      if (this.cache.has(src)) return this.cache.get(src)!;
  
      const img = new Image();
      img.src = src;
      this.cache.set(src, img);
      return img;
    }
  }
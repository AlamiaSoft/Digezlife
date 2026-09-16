# Lessons Learned & Operational Insights

## 1. PWA Service Worker Scope & Cache Invalidation
- **Lesson**: Hardcoded cache keys in `public/sw.js` (e.g. `'fieldnote-v1'`) prevent client browsers from picking up new assets immediately unless `registration.update()` is called or the cache key is incremented.
- **Guideline**: When deploying new UI builds, always bump the cache version in `public/sw.js` (e.g. `'fieldnote-v2'`) to ensure stale shell files are flushed in `activate` event.

## 2. iOS Safe-Area Insets in Standalone Mode
- **Lesson**: In iOS Safari standalone PWA mode, `env(safe-area-inset-bottom)` can collapse to `0px` if `viewport-fit=cover` is omitted from the `<meta name="viewport">` tag.
- **Guideline**: Always ensure `viewport-fit=cover` is set in all HTML templates and Next.js viewports.

## 4. Icon Dictionary Fallbacks & Text Overflow
- **Lesson**: When rendering icons from a lookup dictionary (e.g. `icon(name)`), falling back to returning `name` unescaped can inject long text strings (e.g. `'subscription'`) into fixed-dimension icon containers, causing visual text collisions.
- **Guideline**: Explicitly define every icon key or fallback to a neutral character (such as `'•'`), and always isolate icon boxes and text containers with `flex: 1` and `min-width: 0`.

## 5. Service Worker Cache Invalidation on Activate
- **Lesson**: If the Service Worker `activate` listener does not prune old cache stores (`caches.delete(key)`), stale application shell scripts and styles can linger across rebuilds indefinitely.
- **Guideline**: In `sw.js`, iterate over `caches.keys()` in the `activate` event, delete all stores not matching the current `CACHE` key, and call `self.clients.claim()`.

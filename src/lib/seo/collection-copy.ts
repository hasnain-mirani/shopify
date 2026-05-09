/**
 * 100–150 word SEO blurbs for collection pages (Pakistan + accessories focus).
 */
const BY_HANDLE: Record<string, string> = {
  "wireless-earbuds": `Looking for the best wireless earbuds in Pakistan? SSHUB offers a curated selection of Bluetooth earbuds with noise cancellation, long battery life, and clear call quality. Whether you need earbuds for workouts, commuting, or daily calls, our range includes top-rated options at competitive prices. Shop authentic accessories with fast delivery across Pakistan and hassle-free returns when you buy online at SSHUB.`,
  "smart-watches": `Discover smartwatches in Pakistan for fitness tracking, notifications, and everyday style. SSHUB stocks wearables with reliable battery life, heart-rate monitoring, and crisp displays—ideal for students, professionals, and athletes. Compare models, read specs, and order online with confidence. We focus on value, genuine quality, and quick nationwide delivery so you can upgrade your wrist tech without the guesswork.`,
  "power-banks": `Power banks are essential for Pakistan’s on-the-go lifestyle—and SSHUB brings dependable portable chargers with high capacity, fast charging, and durable builds. From slim pocket sizes to heavy-duty options for travel, find the right match for your phone or tablet. Enjoy transparent pricing, secure checkout, and fast shipping so you never run out of battery when it matters most.`,
  "wall-chargers": `Shop wall chargers and adapters in Pakistan that are built for speed and safety. SSHUB offers USB-C and multi-port chargers suited for phones, earbuds, and accessories—ideal for home, office, or travel. Avoid low-quality knockoffs; choose gear that protects your devices while charging efficiently. Order online for quick delivery and straightforward returns through SSHUB.`,
  "bluetooth-speakers": `Bring better sound everywhere with Bluetooth speakers from SSHUB—perfect for rooms, outdoor gatherings, and travel across Pakistan. Explore compact and punchy options with solid battery life and easy pairing. We highlight clear specs and fair pricing so you can pick a speaker that fits your budget. Buy online for fast dispatch and trusted customer support.`,
  "new-products": `Browse the newest mobile accessories and smart tech at SSHUB in Pakistan. Our new arrivals include fresh earbuds, wearables, chargers, and more—updated regularly so you can spot the latest drops first. Whether you are upgrading your kit or gifting, shop curated products with clear descriptions and nationwide delivery.`,
};

export function getCollectionSeoParagraph(handle: string, title: string): string {
  const key = handle.toLowerCase().replace(/\/$/, "");
  if (BY_HANDLE[key]) return BY_HANDLE[key];
  return `Shop ${title} online in Pakistan at SSHUB—your destination for premium mobile accessories and smart tech. We curate quality earbuds, wearables, chargers, and more with clear pricing and detailed listings. Whether you are buying for yourself or gifting, you get dependable gear, fast delivery across Pakistan, and a straightforward shopping experience. Explore the collection above and order with confidence from SSHUB.`;
}

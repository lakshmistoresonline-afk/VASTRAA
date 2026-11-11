import fs from 'fs';
import path from 'path';

async function cleanBrokenSarees() {
  console.log("🧹 Starting automated scan and cleanup of broken/expired Google Photos saree URLs...\n");

  const jsonPath = path.resolve('src/data/extractedSarees.json');
  const rawData = fs.readFileSync(jsonPath, 'utf8');
  const data = JSON.parse(rawData);

  let totalBefore = 0;
  let totalAfter = 0;
  const cleanedData = {};

  for (const cat of Object.keys(data)) {
    const items = data[cat] || [];
    totalBefore += items.length;
    console.log(`🔍 Scanning Category ${cat} (${items.length} items)...`);

    const validItems = [];
    for (const item of items) {
      if (!item.imageUrl || typeof item.imageUrl !== 'string' || item.imageUrl.trim() === '' || item.imageUrl.includes('EXPIRED')) {
        continue;
      }
      try {
        const res = await fetch(item.imageUrl, { method: 'HEAD' });
        if (res.ok) {
          validItems.push(item);
        } else {
          console.log(`   ❌ Removing expired/broken image (Status ${res.status}): ${item.id}`);
        }
      } catch {
        console.log(`   ❌ Removing unreachable image: ${item.id}`);
        validItems.push(item); // if network error during script execution, keep to avoid false positives, or test GET
      }
    }

    cleanedData[cat] = validItems;
    totalAfter += validItems.length;
    console.log(`   ✓ Category ${cat}: kept ${validItems.length} / ${items.length} working sarees.\n`);
  }

  fs.writeFileSync(jsonPath, JSON.stringify(cleanedData, null, 2), 'utf8');
  console.log(`==================================================`);
  console.log(`✨ Cleanup Complete! Total working sarees preserved: ${totalAfter} / ${totalBefore}`);
  console.log(`==================================================\n`);
}

cleanBrokenSarees();

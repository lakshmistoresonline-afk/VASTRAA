import fs from 'fs';
import path from 'path';

/**
 * Master Saree Dataset Deduplication Script
 * Deduplicates all 3,252 saree items across Catalogues A through I by unique image URL,
 * re-numbers titles sequentially (e.g. Saree A-001, Saree A-002...), and assigns unique non-linear prices.
 */
function deduplicateDataset() {
  console.log("🧹 Starting dataset deduplication across Catalogues A through I...\n");

  const jsonPath = path.resolve('src/data/extractedSarees.json');
  const rawData = fs.readFileSync(jsonPath, 'utf8');
  const data = JSON.parse(rawData);

  const rangeMap = {
    A: { minP: 25200, maxP: 27300 },
    B: { minP: 17325, maxP: 18375 },
    C: { minP: 13125, maxP: 14175 },
    D: { minP: 4635,  maxP: 5665 },
    E: { minP: 3915,  maxP: 4635 },
    F: { minP: 5460,  maxP: 6300 },
    G: { minP: 2370,  maxP: 3040 },
    H: { minP: 1955,  maxP: 2320 },
    I: { minP: 1955,  maxP: 2320 }
  };

  function getNonLinearShuffledPrice(idString, minP, maxP) {
    let num = 0;
    for (let i = 0; i < idString.length; i++) {
      num = (num * 31 + idString.charCodeAt(i)) >>> 0;
    }
    num ^= num >>> 16;
    num = Math.imul(num, 0x85ebca6b) >>> 0;
    num ^= num >>> 13;
    num = Math.imul(num, 0xc2b2ae35) >>> 0;
    num ^= num >>> 16;

    const range = maxP - minP;
    if (range <= 0) return minP;
    const steps = Math.floor(range / 50);
    const stepIndex = num % (steps + 1);
    return minP + (stepIndex * 50);
  }

  const cleanedData = {};
  let originalTotal = 0;
  let newTotal = 0;

  for (const catCode of Object.keys(data)) {
    const rawItems = data[catCode] || [];
    originalTotal += rawItems.length;

    const seenUrls = new Set();
    const uniqueItems = [];

    for (const item of rawItems) {
      const cleanUrl = item.imageUrl ? item.imageUrl.split('=')[0] : '';
      if (!seenUrls.has(cleanUrl)) {
        seenUrls.add(cleanUrl);
        uniqueItems.push(item);
      }
    }

    // Re-number titles and assign stable IDs
    const { minP, maxP } = rangeMap[catCode] || { minP: 2000, maxP: 3000 };
    const processedItems = uniqueItems.map((item, idx) => {
      const seqNum = String(idx + 1).padStart(3, '0');
      const newId = `gphoto_${catCode}_${seqNum}`;
      const newTitle = `Saree ${catCode}-${seqNum}`;
      const newPrice = getNonLinearShuffledPrice(newId, minP, maxP);

      return {
        ...item,
        id: newId,
        title: newTitle,
        price: newPrice,
        minPrice: minP,
        maxPrice: maxP
      };
    });

    cleanedData[catCode] = processedItems;
    newTotal += processedItems.length;
    console.log(`✓ Cat ${catCode}: Cleaned ${rawItems.length} items -> ${processedItems.length} UNIQUE sarees.`);
  }

  fs.writeFileSync(jsonPath, JSON.stringify(cleanedData, null, 2), 'utf8');

  console.log("\n=========================================================================");
  console.log(`✨ DEDUPLICATION COMPLETE!`);
  console.log(`   Original Dataset Total : ${originalTotal} items`);
  console.log(`   Cleaned Unique Sarees  : ${newTotal} items (Removed ${originalTotal - newTotal} duplicate photos)`);
  console.log("=========================================================================\n");
}

deduplicateDataset();

import fs from 'fs';
import path from 'path';

function updateExtractedDatasetPrices() {
  const jsonPath = path.resolve('src/data/extractedSarees.json');
  const rawData = fs.readFileSync(jsonPath, 'utf8');
  const data = JSON.parse(rawData);

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

  const rangeMap = {
    A: { minP: 25200, maxP: 27300 }, // +5%
    B: { minP: 17325, maxP: 18375 }, // +5%
    C: { minP: 13125, maxP: 14175 }, // +5%
    F: { minP: 5460,  maxP: 6300 },  // +5%
    D: { minP: 4635,  maxP: 5665 },  // +3%
    E: { minP: 3915,  maxP: 4635 },  // +3%
    G: { minP: 2370,  maxP: 3040 },  // +3%
    H: { minP: 1955,  maxP: 2320 },  // +3%
    I: { minP: 1955,  maxP: 2320 }   // +3%
  };

  let totalCount = 0;

  for (const catCode of Object.keys(data)) {
    const items = data[catCode];
    const { minP, maxP } = rangeMap[catCode] || { minP: 2000, maxP: 3000 };

    for (const item of items) {
      item.price = getNonLinearShuffledPrice(item.id, minP, maxP);
      item.minPrice = minP;
      item.maxPrice = maxP;
      totalCount++;
    }
  }

  fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`✨ Successfully updated prices for all ${totalCount} sarees across Catalogues A through I in extractedSarees.json!`);
}

updateExtractedDatasetPrices();

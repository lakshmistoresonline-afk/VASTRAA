import fs from 'fs';
import path from 'path';

/**
 * Fast Parallel Visual Image Signature Analyzer
 */
async function analyzeVisualDuplicates() {
  console.log("🔍 Analyzing image signatures for Catalogue B (Items B-001 through B-600)...\n");

  const jsonPath = path.resolve('src/data/extractedSarees.json');
  const rawData = fs.readFileSync(jsonPath, 'utf8');
  const data = JSON.parse(rawData);

  const bItems = data.B || [];
  const imageMap = new Map();
  const duplicateClusters = [];

  // Batch process Cat B in parallel chunks of 25
  const batchSize = 25;
  for (let i = 0; i < bItems.length; i += batchSize) {
    const chunk = bItems.slice(i, i + batchSize);
    await Promise.all(chunk.map(async (item) => {
      try {
        const res = await fetch(item.imageUrl, { method: 'GET', headers: { 'Range': 'bytes=0-16384' } });
        const buf = await res.arrayBuffer();
        // Extract JPEG EXIF/header pixel fingerprint
        const sig = Buffer.from(buf).toString('hex').slice(0, 128);

        if (imageMap.has(sig)) {
          imageMap.get(sig).push(item);
        } else {
          imageMap.set(sig, [item]);
        }
      } catch (e) {
        // Fetch notice
      }
    }));
  }

  for (const [sig, group] of imageMap.entries()) {
    if (group.length > 1) {
      duplicateClusters.push(group);
    }
  }

  console.log("=========================================================================");
  console.log(`📊 CATALOGUE B DUPLICATE BURST PHOTO CLUSTERS REPORT`);
  console.log("=========================================================================\n");

  console.log(`Found ${duplicateClusters.length} duplicate photo clusters in Catalogue B:\n`);

  duplicateClusters.forEach((cluster, cIdx) => {
    console.log(`📌 Cluster ${cIdx + 1} (${cluster.length} duplicate photos):`);
    cluster.forEach(x => {
      console.log(`   - Code: ${x.title} | ID: ${x.id} | Price: ₹${x.price}`);
    });
    console.log('');
  });

  console.log("=========================================================================");
}

analyzeVisualDuplicates().catch(err => console.error("Analysis error:", err));

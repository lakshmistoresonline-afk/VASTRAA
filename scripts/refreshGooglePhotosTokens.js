import fs from 'fs';
import path from 'path';

/**
 * Google Photos Live Shared Album Token Refresh Script
 * Connects to live album URLs for Catalogues A through I, re-extracts fresh media tokens,
 * and repairs any expired URLs in extractedSarees.json.
 */
async function refreshGooglePhotosTokens() {
  console.log("🔄 Starting live Google Photos album media token re-fetch...\n");

  const jsonPath = path.resolve('src/data/extractedSarees.json');
  const rawData = fs.readFileSync(jsonPath, 'utf8');
  const data = JSON.parse(rawData);

  const ALBUM_CONFIGS = [
    { code: "A", albums: ["https://photos.google.com/share/AF1QipM5buHSeQB1b75c6cU-PPn1LZveH-AG42r3vgydczlm719FIPZFjv8dSMe-ZUanww?key=RF9SUzQ3ODVSNVNVcjJtV0k3X1V1cFo3b1V0bmpR", "https://photos.google.com/share/AF1QipOUZyYAexal5fGBenQyi5diXX3W0Q3HpRKWWNgn93Uih-Y3qX1KaMPk7dEn5MiFDw?key=dzUtZVM2Zk5KVWhiVU9fN2x4WGhGZXhCQjcyVktn"] },
    { code: "B", albums: ["https://photos.google.com/share/AF1QipPpwz18816TyQUvaLH6NgO-w0GTkyguKUZgZ5HFbaDt1P8qIxHJS_qviVzw3-QsaA?key=ZDBRMS1pdTUzYlZEbnZVcno2a18td1VFVEpJTHZn", "https://photos.google.com/share/AF1QipN4GWZm3N0lV3OgSTHYOQ-Sn7FNoDxgERKxixJJDCcno-QeXvL9eOIBHhZticqiJA?key=TXdpN2NRdlBmTEZjMmpBdW1TOGNSR2Jua1FGdlR3"] },
    { code: "C", albums: ["https://photos.google.com/share/AF1QipPxV-MCf5356GxsAEtqby1kEdXSx2Yh_vihtiovSWjMAMugeJ5vXYU8GlIDktr_Eg?key=Y1Z2YTNaVTQ2TzJEb2p5ZmhSQl9PQ3RrOEY4elVR"] },
    { code: "D", albums: ["https://photos.google.com/share/AF1QipOU0_QV4PhyU1j8g1RenSePPwoVSp_hu0beFdrM8t1nSWGAr-tS_325RxNMPB90EA?key=WVlrNFhtVXVGMTBFd0I3TWt1TG1xT3A1b21XVkJ3"] },
    { code: "E", albums: ["https://photos.google.com/share/AF1QipPpaTrA8zA5d7F5dSfg4tclarHYZEE-B7V_LfZXjqM64zmfpEDSJA3_Kjetk0U7cw?key=bDlHcWhmS0dyWjJNRFV1TWdMbnNHc3JBMkYxNkhn"] },
    { code: "F", albums: ["https://photos.google.com/share/AF1QipNzEH9t3GatRzJk9nQS4VTM78LipiFDN40W62tXfOuoJKVmLSnY8lgZsVeMlc41OA?key=Z1JIUUVLR0RFOURhWjB1THcxX2gtV1MyOUdJRElR"] },
    { code: "G", albums: ["https://photos.google.com/share/AF1QipNzudmR-0rGGDlLb5eXy4gaxT5EO3FzmPSZAwwo-4Pu0njqKMt8lBkqiVUhkulZuA?key=dzhCRHgwaHI4S1FtUUZNd2FQcHRwZ0R2V2N6RFln"] },
    { code: "H", albums: ["https://photos.google.com/share/AF1QipPGf18s1b4V83e1XUT9Wj6h_2CE7r1HfgCceqCKQTD2GTgvbo_xhOXS5CNiDmiOLg?key=ZkMtODl1blppejBkd0ZzcF9VR2llMjlVR1k4ZUlB"] },
    { code: "I", albums: ["https://photos.google.com/share/AF1QipM3AE5rmOtboDdT8_mGkU5luAceaRlZUzZsDmG0JulL0-FWD7JoppsWMuKYpuXP4g?key=TlgzUHM0RkF5YlBlMzBZeTM5Rm5HbDlWdDZXa1J3"] }
  ];

  async function fetchAlbumImageUrls(albumUrl) {
    try {
      const res = await fetch(albumUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
      });
      if (!res.ok) return [];
      const html = await res.text();
      const regex = /https:\/\/lh3\.googleusercontent\.com\/(pw|drive-viewer)\/[a-zA-Z0-9_=-]+/g;
      const matches = html.match(regex);
      if (!matches) return [];
      return [...new Set(matches)].map(r => r.split('=')[0] + '=w1024-h1024');
    } catch {
      return [];
    }
  }

  let totalRefreshed = 0;

  for (const cfg of ALBUM_CONFIGS) {
    const code = cfg.code;
    const items = data[code] || [];
    console.log(`📡 Fetching live Google Photos tokens for Cat ${code}...`);

    let freshUrls = [];
    for (const albUrl of cfg.albums) {
      const urls = await fetchAlbumImageUrls(albUrl);
      freshUrls = freshUrls.concat(urls);
    }

    if (freshUrls.length > 0) {
      let count = 0;
      for (let i = 0; i < items.length; i++) {
        if (freshUrls[i]) {
          items[i].imageUrl = freshUrls[i];
          count++;
        }
      }
      totalRefreshed += count;
      console.log(`   ✓ Refreshed ${count} live image tokens for Cat ${code}.`);
    } else {
      console.log(`   ⚠️ Google Photos feed fetch notice for Cat ${code}. Preserved existing snapshot.`);
    }
  }

  fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`\n==================================================`);
  console.log(`✨ Re-fetched & refreshed live media tokens across all catalogues! (${totalRefreshed} items updated)`);
  console.log(`==================================================\n`);
}

refreshGooglePhotosTokens();

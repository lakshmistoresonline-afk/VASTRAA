import fs from 'fs';
import path from 'path';

const CATALOGUES_CONFIG = [
  { code: "A", name: "Kanchipuram Pure Wedding Silk Sarees", albums: ["https://photos.google.com/share/AF1QipM5buHSeQB1b75c6cU-PPn1LZveH-AG42r3vgydczlm719FIPZFjv8dSMe-ZUanww?key=RF9SUzQ3ODVSNVNVcjJtV0k3X1V1cFo3b1V0bmpR", "https://photos.google.com/share/AF1QipOUZyYAexal5fGBenQyi5diXX3W0Q3HpRKWWNgn93Uih-Y3qX1KaMPk7dEn5MiFDw?key=dzUtZVM2Zk5KVWhiVU9fN2x4WGhGZXhCQjcyVktn"] },
  { code: "B", name: "Kanchipuram Pure Fancy Silk Sarees", albums: ["https://photos.google.com/share/AF1QipPpwz18816TyQUvaLH6NgO-w0GTkyguKUZgZ5HFbaDt1P8qIxHJS_qviVzw3-QsaA?key=ZDBRMS1pdTUzYlZEbnZVcno2a18td1VFVEpJTHZn", "https://photos.google.com/share/AF1QipN4GWZm3N0lV3OgSTHYOQ-Sn7FNoDxgERKxixJJDCcno-QeXvL9eOIBHhZticqiJA?key=TXdpN2NRdlBmTEZjMmpBdW1TOGNSR2Jua1FGdlR3"] },
  { code: "C", name: "Kanchipuram Pure Soft Silk Sarees", albums: ["https://photos.google.com/share/AF1QipPxV-MCf5356GxsAEtqby1kEdXSx2Yh_vihtiovSWjMAMugeJ5vXYU8GlIDktr_Eg?key=Y1Z2YTNaVTQ2TzJEb2p5ZmhSQl9PQ3RrOEY4elVR"] },
  { code: "D", name: "Semi Silk Sarees", albums: ["https://photos.google.com/share/AF1QipOU0_QV4PhyU1j8g1RenSePPwoVSp_hu0beFdrM8t1nSWGAr-tS_325RxNMPB90EA?key=WVlrNFhtVXVGMTBFd0I3TWt1TG1xT3A1b21XVkJ3"] },
  { code: "E", name: "Semi Fancy Silk Sarees", albums: ["https://photos.google.com/share/AF1QipPpaTrA8zA5d7F5dSfg4tclarHYZEE-B7V_LfZXjqM64zmfpEDSJA3_Kjetk0U7cw?key=bDlHcWhmS0dyWjJNRFV1TWdMbnNHc3JBMkYxNkhn"] },
  { code: "F", name: "Semi Kanchipuram Art Silk Sarees", albums: ["https://photos.google.com/share/AF1QipNzEH9t3GatRzJk9nQS4VTM78LipiFDN40W62tXfOuoJKVmLSnY8lgZsVeMlc41OA?key=Z1JIUUVLR0RFOURhWjB1THcxX2gtV1MyOUdJRElR"] },
  { code: "G", name: "Butta Art Silk Sarees", albums: ["https://photos.google.com/share/AF1QipNzudmR-0rGGDlLb5eXy4gaxT5EO3FzmPSZAwwo-4Pu0njqKMt8lBkqiVUhkulZuA?key=dzhCRHgwaHI4S1FtUUZNd2FQcHRwZ0R2V2N6RFln"] },
  { code: "H", name: "Semi Art Silk Sarees", albums: ["https://photos.google.com/share/AF1QipPGf18s1b4V83e1XUT9Wj6h_2CE7r1HfgCceqCKQTD2GTgvbo_xhOXS5CNiDmiOLg?key=ZkMtODl1blppejBkd0ZzcF9VR2llMjlVR1k4ZUlB"] },
  { code: "I", name: "Arts Silk Sarees", albums: ["https://photos.google.com/share/AF1QipM3AE5rmOtboDdT8_mGkU5luAceaRlZUzZsDmG0JulL0-FWD7JoppsWMuKYpuXP4g?key=TlgzUHM0RkF5YlBlMzBZeTM5Rm5HbDlWdDZXa1J3"] }
];

async function compareCounts() {
  console.log("📊 Fetching live Google Photos shared album item counts and comparing with application dataset...\n");

  const jsonPath = path.resolve('src/data/extractedSarees.json');
  const extractedData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  async function fetchAlbumCount(albumUrl) {
    try {
      const res = await fetch(albumUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
      });
      if (!res.ok) return 0;
      const html = await res.text();
      const regex = /https:\/\/lh3\.googleusercontent\.com\/(pw|drive-viewer)\/[a-zA-Z0-9_=-]+/g;
      const matches = html.match(regex);
      if (!matches) return 0;
      return [...new Set(matches)].length;
    } catch {
      return 0;
    }
  }

  console.log("Catalogue | Album Index | Google Photos Link | Live Album Count | App Dataset Count");
  console.log("---------------------------------------------------------------------------------------");

  for (const cfg of CATALOGUES_CONFIG) {
    const appCount = (extractedData[cfg.code] || []).length;
    let albumIdx = 1;
    for (const albUrl of cfg.albums) {
      const liveCount = await fetchAlbumCount(albUrl);
      console.log(`Cat ${cfg.code}    | Album #${albumIdx}     | ${albUrl.substring(0, 45)}... | ~${liveCount} items      | ${appCount} items`);
      albumIdx++;
    }
  }
  console.log("\n");
}

compareCounts();

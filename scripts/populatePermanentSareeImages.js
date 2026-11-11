import fs from 'fs';
import path from 'path';

// 100% Pure Traditional Indian Silk Saree Fabrics, Zaris, and Weaves (Zero Models)
const PURE_FABRIC_SAREE_IMAGES = [
  "https://images.unsplash.com/photo-1610030469883-98e550d6193c?auto=format&fit=crop&w=1024&q=80",
  "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1024&q=80",
  "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1024&q=80",
  "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=1024&q=80",
  "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=1024&q=80",
  "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1024&q=80",
  "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1024&q=80",
  "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1024&q=80"
];

function getPureFabricSareeImage(idString) {
  let num = 0;
  if (idString) {
    for (let i = 0; i < idString.length; i++) {
      num = (num * 31 + idString.charCodeAt(i)) >>> 0;
    }
  }
  return PURE_FABRIC_SAREE_IMAGES[num % PURE_FABRIC_SAREE_IMAGES.length];
}

async function populatePureFabricImages() {
  console.log("🧵 Populating extractedSarees.json with 100% pure traditional silk saree fabric & weave images (Zero models)...\n");

  const jsonPath = path.resolve('src/data/extractedSarees.json');
  const rawData = fs.readFileSync(jsonPath, 'utf8');
  const data = JSON.parse(rawData);

  let totalUpdated = 0;

  for (const cat of Object.keys(data)) {
    const items = data[cat] || [];
    for (let i = 0; i < items.length; i++) {
      items[i].imageUrl = getPureFabricSareeImage(items[i].id);
      totalUpdated++;
    }
  }

  fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`==================================================`);
  console.log(`✨ Successfully assigned permanent pure-fabric saree images to all ${totalUpdated} items across Catalogues A through I!`);
  console.log(`==================================================\n`);
}

populatePureFabricImages();

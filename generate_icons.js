const fs = require('fs');
const path = require('path');

const items = require('./grd-bag-game/data/items.json');
const outDir = './grd-bag-game/assets/icons';

items.forEach(item => {
  const initials = item.name.substring(0, 2).toUpperCase();
  const svgContent = `
<svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <rect width="64" height="64" rx="12" fill="#E0E7FF"/>
  <text x="32" y="38" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#3730A3" text-anchor="middle">${initials}</text>
</svg>`;
  
  const fileName = path.basename(item.icon);
  fs.writeFileSync(path.join(outDir, fileName), svgContent.trim());
  console.log(`Generated ${fileName}`);
});

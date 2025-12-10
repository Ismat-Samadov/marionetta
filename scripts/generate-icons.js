// Simple script to generate PWA icons using Canvas API in Node.js
const fs = require('fs');
const path = require('path');

// Create a simple SVG icon
const createSVGIcon = (size) => {
  return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${size}" height="${size}" fill="#E74C3C" rx="20"/>
    <circle cx="${size * 0.5}" cy="${size * 0.35}" r="${size * 0.25}" fill="#FFD700"/>
    <rect x="${size * 0.25}" y="${size * 0.5}" width="${size * 0.5}" height="${size * 0.3}" fill="#FFF" rx="5"/>
    <text x="${size * 0.5}" y="${size * 0.75}" font-family="Arial" font-size="${size * 0.2}" font-weight="bold" text-anchor="middle" fill="#000">M</text>
  </svg>`;
};

// Create directories if they don't exist
const iconsDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate SVG files (browsers can use SVG as PNG fallback)
const sizes = [192, 512];
sizes.forEach(size => {
  const svg = createSVGIcon(size);
  const filename = path.join(iconsDir, `icon-${size}x${size}.svg`);
  fs.writeFileSync(filename, svg);
  console.log(`Generated ${filename}`);
});

console.log('Icon generation complete! SVG files created.');
console.log('For production, consider converting these to PNG using an online tool or image editor.');

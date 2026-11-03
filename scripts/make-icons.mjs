import sharp from 'sharp'
import { mkdir } from 'node:fs/promises'

await mkdir('public/icons', { recursive: true })

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="ember" x1="180" y1="120" x2="330" y2="430" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#f4b26a"/>
      <stop offset=".55" stop-color="#e2623c"/>
      <stop offset="1" stop-color="#c8462c"/>
    </linearGradient>
    <radialGradient id="glow" cx="0" cy="0" r="1" gradientTransform="translate(256 330) rotate(90) scale(210)" gradientUnits="userSpaceOnUse">
      <stop stop-color="#e2623c" stop-opacity=".28"/>
      <stop offset="1" stop-color="#e2623c" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="512" height="512" rx="116" fill="#201b17"/>
  <rect width="512" height="512" rx="116" fill="url(#glow)"/>
  <path d="M256 88C300 170 356 218 356 308C356 388 308 436 256 436C204 436 156 388 156 308C156 236 196 194 232 136C238 190 258 214 276 232C288 202 280 148 256 88Z" fill="url(#ember)"/>
  <path d="M256 300c14 18 28 30 28 52 0 22-12 38-28 38s-28-16-28-38c0-22 14-34 28-52Z" fill="#f6f1e8" opacity=".92"/>
</svg>`

const maskable = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="ember" x1="180" y1="120" x2="330" y2="430" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#f4b26a"/>
      <stop offset=".55" stop-color="#e2623c"/>
      <stop offset="1" stop-color="#c8462c"/>
    </linearGradient>
    <radialGradient id="glow" cx="0" cy="0" r="1" gradientTransform="translate(256 330) rotate(90) scale(210)" gradientUnits="userSpaceOnUse">
      <stop stop-color="#e2623c" stop-opacity=".28"/>
      <stop offset="1" stop-color="#e2623c" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="512" height="512" fill="#201b17"/>
  <rect width="512" height="512" fill="url(#glow)"/>
  <g transform="translate(256 256) scale(.78) translate(-256 -256)">
    <path d="M256 88C300 170 356 218 356 308C356 388 308 436 256 436C204 436 156 388 156 308C156 236 196 194 232 136C238 190 258 214 276 232C288 202 280 148 256 88Z" fill="url(#ember)"/>
    <path d="M256 300c14 18 28 30 28 52 0 22-12 38-28 38s-28-16-28-38c0-22 14-34 28-52Z" fill="#f6f1e8" opacity=".92"/>
  </g>
</svg>`

await sharp(Buffer.from(svg)).resize(192, 192).png().toFile('public/icons/icon-192.png')
await sharp(Buffer.from(svg)).resize(512, 512).png().toFile('public/icons/icon-512.png')
await sharp(Buffer.from(maskable)).resize(512, 512).png().toFile('public/icons/maskable-512.png')
await sharp(Buffer.from(svg)).resize(180, 180).png().toFile('public/icons/apple-touch-icon.png')
await sharp(Buffer.from(svg)).resize(72, 72).png().toFile('public/icons/badge-72.png')
console.log('icons generated')


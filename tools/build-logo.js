/* Builds the Pickle Blinders artwork from one hand-drawn description.
   Run:  node tools/build-logo.js
   Writes:
     logo.svg                 the mascot badge, transparent (app header)
     tools/out/icon.html      full-bleed app icon page   -> icons/icon-*.png
     tools/out/full.html      mascot + wordmark page     -> logo-full.png
   The two html pages are turned into PNGs by tools/render-logo.js. */
'use strict';
var fs = require('fs');
var path = require('path');
var root = path.join(__dirname, '..');
var out = path.join(__dirname, 'out');
fs.mkdirSync(out, { recursive: true });

var INK = '#14160f';
var LIME = '#a3e635';
var LIME_DEEP = '#5fa30f';
var HOT = '#ff6a00';
var SUN = '#ffc21a';
var CREAM = '#fffdf5';

/* A comic burst: spikes of uneven length, the same every build. */
function burst(cx, cy, rOut, rIn, spikes, wobble) {
  var pts = [];
  var seed = 7;
  function rnd() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
  for (var i = 0; i < spikes * 2; i++) {
    var a = (Math.PI * i) / spikes - Math.PI / 2;
    var r = i % 2 === 0 ? rOut * (1 - wobble * rnd()) : rIn * (1 - wobble * 0.6 * rnd());
    pts.push((cx + Math.cos(a) * r).toFixed(1) + ',' + (cy + Math.sin(a) * r).toFixed(1));
  }
  return pts.join(' ');
}

function ballHoles(cx, cy) {
  var spots = [[0, 0], [-13, -9], [12, -12], [-10, 13], [14, 8], [1, -20], [-21, 4], [3, 20]];
  return spots.map(function (s) {
    return '<circle cx="' + (cx + s[0]) + '" cy="' + (cy + s[1]) + '" r="4.2" fill="' + INK + '"/>';
  }).join('');
}

var defs = [
  '<defs>',
  '<linearGradient id="pb-skin" x1="0" y1="0" x2="1" y2="1">',
  '<stop offset="0" stop-color="#c8f860"/><stop offset=".55" stop-color="' + LIME + '"/><stop offset="1" stop-color="' + LIME_DEEP + '"/>',
  '</linearGradient>',
  '<pattern id="pb-dots" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(30)">',
  '<circle cx="4" cy="4" r="2.6" fill="' + INK + '" opacity=".16"/>',
  '</pattern>',
  '<clipPath id="pb-mouth"><path d="M194 272 C226 252 292 250 324 264 C332 300 304 334 258 334 C218 334 192 308 194 272 Z"/></clipPath>',
  '<clipPath id="pb-body"><path d="M256 104 C320 104 348 158 346 232 C344 300 352 354 324 394 C304 422 208 424 188 394 C158 352 170 300 168 232 C166 158 192 104 256 104 Z"/></clipPath>',
  '</defs>'
].join('');

/* Everything is drawn on a 512 square. */
function mascot() {
  var s = [];

  /* burst: hard shadow, hot outer, sunny inner, halftone */
  s.push('<polygon points="' + burst(266, 280, 236, 178, 15, 0.12) + '" fill="' + INK + '"/>');
  s.push('<polygon points="' + burst(256, 268, 236, 178, 15, 0.12) + '" fill="' + HOT + '" stroke="' + INK + '" stroke-width="10" stroke-linejoin="round"/>');
  s.push('<polygon points="' + burst(256, 268, 186, 138, 15, 0.12) + '" fill="' + SUN + '"/>');
  s.push('<polygon points="' + burst(256, 268, 186, 138, 15, 0.12) + '" fill="url(#pb-dots)"/>');

  /* the ball, coming in fast */
  s.push('<g stroke="' + INK + '" stroke-width="7" stroke-linecap="round">',
    '<path d="M22 150 L62 138"/><path d="M14 118 L58 112"/><path d="M30 84 L64 90"/>', '</g>');
  s.push('<circle cx="100" cy="112" r="34" fill="' + SUN + '" stroke="' + INK + '" stroke-width="9"/>');
  s.push('<circle cx="100" cy="112" r="34" fill="#fff" opacity=".28" clip-path="circle(20px at 88px 98px)"/>');
  s.push(ballHoles(100, 112));

  s.push('<g transform="rotate(7 256 264)">');

  /* legs and sneakers */
  s.push('<g fill="none" stroke="' + INK + '" stroke-width="15" stroke-linecap="round">',
    '<path d="M224 400 C220 426 214 440 204 456"/><path d="M290 400 C296 426 304 440 316 454"/>', '</g>');
  s.push('<path d="M150 470 C150 448 186 440 214 452 C226 458 228 474 216 478 L164 480 C154 480 150 476 150 470 Z" fill="' + HOT + '" stroke="' + INK + '" stroke-width="8" stroke-linejoin="round"/>');
  s.push('<path d="M372 468 C372 446 336 438 308 450 C296 456 294 472 306 476 L358 478 C368 478 372 474 372 468 Z" fill="' + HOT + '" stroke="' + INK + '" stroke-width="8" stroke-linejoin="round"/>');
  s.push('<path d="M158 471 L218 469" stroke="' + CREAM + '" stroke-width="5" stroke-linecap="round"/>');
  s.push('<path d="M364 469 L304 467" stroke="' + CREAM + '" stroke-width="5" stroke-linecap="round"/>');

  /* the paddle, slung over the shoulder like a bat (behind the body) */
  s.push('<g transform="translate(398 236) rotate(34)">',
    '<rect x="-46" y="-178" width="92" height="112" rx="30" fill="' + CREAM + '" stroke="' + INK + '" stroke-width="10"/>',
    '<rect x="-31" y="-163" width="62" height="82" rx="19" fill="none" stroke="' + HOT + '" stroke-width="6"/>',
    '<path d="M-14 -150 L10 -150 M-18 -132 L18 -132 M-14 -114 L10 -114" stroke="' + INK + '" stroke-width="4" stroke-linecap="round" opacity=".25"/>',
    '<rect x="-11" y="-70" width="22" height="78" rx="8" fill="' + INK + '"/>',
    '<path d="M-11 -48 L11 -56 M-11 -30 L11 -38 M-11 -12 L11 -20" stroke="' + HOT + '" stroke-width="5"/>',
    '</g>');

  /* far arm, raised fist */
  s.push('<path d="M178 286 C140 300 112 286 110 246" fill="none" stroke="' + INK + '" stroke-width="15" stroke-linecap="round"/>');

  /* body */
  s.push('<ellipse cx="256" cy="104" rx="15" ry="11" fill="' + LIME_DEEP + '" stroke="' + INK + '" stroke-width="8"/>');
  s.push('<path d="M256 104 C320 104 348 158 346 232 C344 300 352 354 324 394 C304 422 208 424 188 394 C158 352 170 300 168 232 C166 158 192 104 256 104 Z" fill="url(#pb-skin)" stroke="' + INK + '" stroke-width="12" stroke-linejoin="round"/>');
  s.push('<g clip-path="url(#pb-body)">',
    '<path d="M330 120 C372 220 372 330 318 420 L380 430 L390 110 Z" fill="' + LIME_DEEP + '" opacity=".55"/>',
    '<path d="M204 136 C188 170 184 210 186 250" fill="none" stroke="#fff" stroke-width="13" stroke-linecap="round" opacity=".6"/>',
    '<circle cx="190" cy="282" r="6" fill="#fff" opacity=".55"/>',
    '<g fill="' + LIME_DEEP + '" opacity=".8">',
    '<circle cx="222" cy="366" r="8"/><circle cx="286" cy="378" r="6"/><circle cx="316" cy="340" r="7"/>',
    '<circle cx="204" cy="330" r="5"/><circle cx="300" cy="140" r="6"/><circle cx="226" cy="136" r="5"/><circle cx="258" cy="388" r="5"/>',
    '</g>', '</g>');

  /* the blinders: wraparound shades with an angry brow line */
  s.push('<path d="M150 150 L256 190 L362 150 L356 212 C328 236 290 240 256 226 C222 240 184 236 156 212 Z" fill="' + INK + '" stroke="' + INK + '" stroke-width="8" stroke-linejoin="round"/>');
  s.push('<path d="M176 178 L236 200 C226 216 196 220 176 206 Z" fill="' + HOT + '"/>');
  s.push('<path d="M336 178 L276 200 C286 216 316 220 336 206 Z" fill="' + HOT + '"/>');
  s.push('<path d="M184 186 L206 194 L200 208 L182 202 Z" fill="#fff" opacity=".9"/>');
  s.push('<path d="M300 196 L318 190 L322 202 L306 208 Z" fill="#fff" opacity=".9"/>');

  /* gritted grin, one fang */
  s.push('<path d="M194 272 C226 252 292 250 324 264 C332 300 304 334 258 334 C218 334 192 308 194 272 Z" fill="#fff" stroke="' + INK + '" stroke-width="9" stroke-linejoin="round"/>');
  s.push('<g clip-path="url(#pb-mouth)" stroke="' + INK + '" stroke-width="5" fill="none">',
    '<path d="M190 296 C230 306 290 304 330 290"/>',
    '<path d="M222 250 L224 340 M248 250 L250 340 M274 250 L274 340 M300 250 L298 340"/>',
    '</g>');

  /* gloves: the raised fist, and the one gripping the paddle */
  s.push('<path d="M84 240 C80 216 100 204 118 210 C138 206 146 228 138 246 C132 262 96 264 84 240 Z" fill="' + CREAM + '" stroke="' + INK + '" stroke-width="8" stroke-linejoin="round"/>');
  s.push('<path d="M100 214 L102 232 M116 211 L118 230" stroke="' + INK + '" stroke-width="5" stroke-linecap="round"/>');
  s.push('<path d="M336 290 C366 296 388 280 396 250" fill="none" stroke="' + INK + '" stroke-width="15" stroke-linecap="round"/>');
  s.push('<circle cx="398" cy="238" r="25" fill="' + CREAM + '" stroke="' + INK + '" stroke-width="8"/>');
  s.push('<path d="M384 228 L406 222 M386 242 L410 236" stroke="' + INK + '" stroke-width="5" stroke-linecap="round"/>');

  /* comic anger mark */
  s.push('<g transform="translate(352 84)" fill="none" stroke="' + INK + '" stroke-width="13" stroke-linecap="round">',
    '<path d="M-16 -6 C-8 -8 -6 -12 -6 -20 M6 -20 C6 -12 8 -8 16 -6 M16 6 C8 8 6 12 6 20 M-6 20 C-6 12 -8 8 -16 6"/></g>');
  s.push('<g transform="translate(352 84)" fill="none" stroke="#e11d1d" stroke-width="6" stroke-linecap="round">',
    '<path d="M-16 -6 C-8 -8 -6 -12 -6 -20 M6 -20 C6 -12 8 -8 16 -6 M16 6 C8 8 6 12 6 20 M-6 20 C-6 12 -8 8 -16 6"/></g>');

  s.push('</g>');
  return s.join('\n');
}

function svg(inner, size, attrs) {
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + size + ' ' + size + '" ' + (attrs || '') + '>' + inner + '</svg>';
}

/* 1. header badge */
fs.writeFileSync(path.join(root, 'logo.svg'), svg(defs + mascot(), 512, 'role="img" aria-label="Pickle Blinders"') + '\n');

var fontFace = "@font-face{font-family:'Bangers';src:url('../../fonts/Bangers-Regular.ttf') format('truetype');}";

/* 2. app icon: full bleed so a phone can mask it to any shape */
var iconInner = defs +
  '<radialGradient id="pb-glow" cx=".5" cy=".5" r=".6"><stop offset="0" stop-color="#d9ff7a"/><stop offset="1" stop-color="#7cc416"/></radialGradient>' +
  '<rect width="512" height="512" fill="url(#pb-glow)"/>' +
  '<g transform="translate(256 256) scale(.78) translate(-256 -262)">' + mascot() + '</g>';
fs.writeFileSync(path.join(out, 'icon.html'),
  '<!doctype html><meta charset="utf-8"><style>html,body{margin:0;background:#7cc416}svg{display:block;width:100vw;height:100vw}</style>' + svg(iconInner, 512));

/* 3. full logo: mascot over the wordmark */
function word(text, x, y, size, fill, extra) {
  var common = 'x="' + x + '" y="' + y + '" font-size="' + size + '" text-anchor="middle" font-family="Bangers" letter-spacing="4"';
  return '<text ' + common + ' fill="' + INK + '" stroke="' + INK + '" stroke-width="34" stroke-linejoin="round" transform="translate(12 14)">' + text + '</text>' +
    '<text ' + common + ' fill="' + HOT + '" stroke="' + HOT + '" stroke-width="20" stroke-linejoin="round" transform="translate(12 14)">' + text + '</text>' +
    '<text ' + common + ' fill="' + fill + '" stroke="' + INK + '" stroke-width="22" stroke-linejoin="round" paint-order="stroke" ' + (extra || '') + '>' + text + '</text>';
}
var fullInner = defs +
  '<g transform="translate(200 -14) scale(1.22)">' + mascot() + '</g>' +
  '<g transform="rotate(-5 512 800)">' +
  word('PICKLE', 500, 800, 236, LIME) +
  word('BLINDERS', 524, 968, 190, CREAM) +
  '</g>';
fs.writeFileSync(path.join(out, 'full.html'),
  '<!doctype html><meta charset="utf-8"><style>' + fontFace + 'html,body{margin:0;background:transparent}svg{display:block;width:100vw;height:100vw}</style>' + svg(fullInner, 1024));

console.log('wrote logo.svg, tools/out/icon.html, tools/out/full.html');

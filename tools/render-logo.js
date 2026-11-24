/* Turns the pages from build-logo.js into the PNGs the app ships.
   Needs puppeteer-core and a local Chrome:
     node tools/render-logo.js <path-to-node_modules>            */
'use strict';
var path = require('path');
var url = require('url');
var modules = process.argv[2] || path.join(__dirname, '..', 'node_modules');
var puppeteer = require(path.join(modules, 'puppeteer-core'));
var root = path.join(__dirname, '..');
var CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';

var jobs = [
  { page: 'tools/out/icon.html', size: 512, file: 'icons/icon-512.png', clear: false },
  { page: 'tools/out/icon.html', size: 192, file: 'icons/icon-192.png', clear: false },
  { page: 'tools/out/full.html', size: 1024, file: 'logo-full.png', clear: true }
];

(async function () {
  var browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new' });
  for (var i = 0; i < jobs.length; i++) {
    var j = jobs[i];
    var page = await browser.newPage();
    await page.setViewport({ width: j.size, height: j.size, deviceScaleFactor: 1 });
    await page.goto(url.pathToFileURL(path.join(root, j.page)).href);
    await page.evaluate(function () { return document.fonts.ready; });
    await page.screenshot({ path: path.join(root, j.file), omitBackground: j.clear });
    await page.close();
    console.log('wrote ' + j.file);
  }
  await browser.close();
})().catch(function (e) { console.error(e); process.exit(1); });

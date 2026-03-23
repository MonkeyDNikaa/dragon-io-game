const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  
  await page.goto('http://localhost:3002');
  await page.waitForTimeout(2000);
  
  await page.screenshot({ path: '/tmp/dragon-login.png', fullPage: false });
  
  // Test avec un nom
  await page.fill('#playerName', 'TestPlayer');
  await page.waitForTimeout(500);
  await page.screenshot({ path: '/tmp/dragon-filled.png', fullPage: false });
  
  await browser.close();
  console.log('Screenshots saved!');
})();

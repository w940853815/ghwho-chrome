// 使用真实工具栏弹窗检查自动尺寸；固定 viewport 的标签页无法复现此回归。
const assert = require('node:assert/strict');
const { mkdtempSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const path = require('node:path');
const { chromium } = require('playwright');

(async () => {
  const profile = mkdtempSync(path.join(tmpdir(), 'ghwho-popup-test-'));
  let context;
  try {
    context = await chromium.launchPersistentContext(profile, {
      channel: 'chrome', headless: false, viewport: null, locale: 'zh-CN',
      ignoreDefaultArgs: ['--disable-extensions'],
      args: ['--enable-unsafe-extension-debugging'],
    });
    const cdp = await context.browser().newBrowserCDPSession();
    const { id } = await cdp.send('Extensions.loadUnpacked', {
      path: path.resolve(process.argv[2] || path.join(__dirname, '..')),
    });
    const manager = await context.newPage();
    await manager.goto(`chrome-extension://${id}/popup/popup.html?tab=1`);
    await manager.waitForFunction(() => !document.querySelector('#exact-time').disabled);

    for (const count of [0, 172]) {
      await manager.evaluate(async count => {
        await chrome.storage.sync.clear();
        await chrome.storage.sync.set(Object.fromEntries(Array.from({ length: count }, (_, i) => [
          `demo-user-${i}`, { note: `测试备注 ${i + 1}`, updatedAt: Date.now() - i * 1000 },
        ])));
        await GHWho.storage.setExactTime(true);
      }, count);
      for (const language of ['zh-CN', 'en']) {
        await manager.evaluate(async language => {
          await GHWho.i18n.setPreference(language);
          await chrome.action.openPopup();
        }, language);
        await manager.waitForFunction(count => chrome.extension.getViews({ type: 'popup' }).some(w =>
          w.document.querySelectorAll('.item').length === count && !w.document.querySelector('#exact-time')?.disabled
        ), count);
        const size = await manager.evaluate(async () => {
          const w = chrome.extension.getViews({ type: 'popup' })[0];
          await new Promise(resolve => w.requestAnimationFrame(() => w.requestAnimationFrame(resolve)));
          return {
            width: w.innerWidth, height: w.innerHeight,
            bodyWidth: w.document.body.getBoundingClientRect().width,
            headerHeight: w.document.querySelector('h1').getBoundingClientRect().height,
            lineHeight: parseFloat(w.getComputedStyle(w.document.querySelector('h1')).lineHeight),
            scrollWidth: w.document.documentElement.scrollWidth,
            footerBottom: w.document.querySelector('footer').getBoundingClientRect().bottom,
          };
        });
        assert.equal(size.width, 400, `${language}/${count}: popup width`);
        assert.equal(size.height, 590, `${language}/${count}: popup height`);
        assert.equal(size.bodyWidth, 400);
        assert.equal(size.headerHeight, size.lineHeight, 'title stays on one line');
        assert.equal(size.scrollWidth, size.width, 'no horizontal overflow');
        assert(size.footerBottom <= size.height, 'footer remains visible');
        await manager.evaluate(() => chrome.extension.getViews({ type: 'popup' })[0].close());
        console.log(`PASS actual popup: ${language}, ${count} notes, ${size.width} × ${size.height}`);
      }
    }

    for (const width of [380, 1000]) {
      await manager.setViewportSize({ width, height: 760 });
      assert(await manager.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'manager stays responsive');
      assert(await manager.evaluate(() => document.querySelector('h1').getBoundingClientRect().height === parseFloat(getComputedStyle(document.querySelector('h1')).lineHeight)), 'manager title stays on one line');
      console.log(`PASS manager: ${width}px`);
    }
  } finally {
    await context?.close();
    rmSync(profile, { recursive: true, force: true });
  }
})().catch(error => { console.error(error); process.exitCode = 1; });

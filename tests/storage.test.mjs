import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import vm from 'node:vm';

const source = readFileSync(new URL('../src/storage.js', import.meta.url), 'utf8');

function loadStore(namespace) {
  const data = {};
  const listeners = new Set();
  const api = {
    storage: {
      sync: {
        async get(key) { return structuredClone(key === null ? data : { [key]: data[key] }); },
        async set(entries) {
          const changes = {};
          for (const [key, value] of Object.entries(entries)) {
            changes[key] = { oldValue: data[key], newValue: structuredClone(value) };
            data[key] = structuredClone(value);
          }
          for (const listener of listeners) listener(changes, 'sync');
        },
        async remove(keys) {
          const changes = {};
          for (const key of [keys].flat()) { changes[key] = { oldValue: data[key] }; delete data[key]; }
          for (const listener of listeners) listener(changes, 'sync');
        },
      },
      onChanged: {
        addListener: fn => listeners.add(fn),
        removeListener: fn => listeners.delete(fn),
      },
    },
  };
  const context = vm.createContext({ [namespace]: api, TextEncoder });
  vm.runInContext(source, context);
  return { store: context.GHWho.storage, api };
}

for (const namespace of ['chrome', 'browser']) {
  test(`${namespace}: visibility persists, notifies other contexts and preserves notes`, async () => {
    const { store, api } = loadStore(namespace);
    assert.equal(await store.getVisibility(), true);
    await store.set('Octocat', '测试备注');
    const updates = [];
    const stop = store.onVisibilityChanged(value => updates.push(value));
    await store.setVisibility(false);
    assert.equal(await store.getVisibility(), false);
    assert.equal((await store.get('octocat')).note, '测试备注');
    const exported = await store.exportData();
    assert.deepEqual(Object.keys(exported.notes), ['octocat']);
    await store.importData({ torvalds: '另一条备注' }, { mode: 'replace' });
    assert.equal(await store.getVisibility(), false);
    assert.equal(await store.get('octocat'), null);
    await store.setVisibility(true);
    assert.deepEqual(updates, [false, true]);
    stop();
    await store.setVisibility(false);
    assert.deepEqual(updates, [false, true]);
    api.storage.sync.set = async () => { throw new Error('write failed'); };
    await assert.rejects(store.setVisibility(true), /write failed/);
    assert.equal(await store.getVisibility(), false);
  });
}

test('manifest permissions and packaged entry points remain limited', () => {
  const root = new URL('../', import.meta.url);
  const manifest = JSON.parse(readFileSync(new URL('manifest.json', root)));
  assert.equal(manifest.manifest_version, 3);
  assert.equal(manifest.homepage_url, 'https://github.com/w940853815/ghwho-chrome');
  assert.deepEqual(manifest.permissions, ['storage']);
  assert.deepEqual(manifest.host_permissions, ['https://github.com/*']);
  for (const content of manifest.content_scripts) {
    assert.deepEqual(content.matches, ['https://github.com/*']);
    for (const file of [...content.js, ...content.css]) assert(readFileSync(new URL(file, root)).length);
  }
  assert(readFileSync(new URL(manifest.action.default_popup, root)).length);
});

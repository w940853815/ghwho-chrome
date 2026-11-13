# ghwho

Private notes beside GitHub usernames. Maintained by [w940853815](https://github.com/w940853815), based on [suolk/ghwho](https://github.com/suolk/ghwho).

[Latest release](https://github.com/w940853815/ghwho-chrome/releases/latest) · [Report an issue](https://github.com/w940853815/ghwho-chrome/issues) · [简体中文](README.md)

## Features

- Notes on profiles, issues, pull requests, comments, member lists and participant avatars.
- Click to edit; hover to preview long notes and HTTP/HTTPS links.
- **Hide notes / Show notes** in the extension panel updates all open GitHub pages immediately. It also hides add-note controls and persists across reloads without deleting notes. The manager remains available.
- Search, add, edit, delete and import/export JSON backups.
- Chinese and English, with light and dark themes.

## Install

Download and extract the matching ZIP from [Releases](https://github.com/w940853815/ghwho-chrome/releases/latest).

| Browser | Package | Installation |
| --- | --- | --- |
| Chrome 109+ | `ghwho-chrome-*.zip` | `chrome://extensions` → Developer mode → Load unpacked |
| Edge 109+ | `ghwho-edge-*.zip` | `edge://extensions` → Developer mode → Load unpacked |
| Brave, Vivaldi, Arc and other Chromium browsers | Chrome package | Load unpacked from the extensions page; requires compatible APIs, not individually tested |
| Firefox 140+ | `ghwho-firefox-*.zip` | `about:debugging#/runtime/this-firefox` → Load Temporary Add-on → select the extracted `manifest.json` |

Firefox removes temporary extensions on restart. Permanent installation in standard Firefox requires Mozilla signing; no signed XPI is provided here. Safari requires separate conversion, packaging and signing and is not included.

Refresh GitHub after loading. Only `https://github.com/*` is supported, not self-hosted GitHub Enterprise.

## Update and migrate

Export a JSON backup, extract the new package over the original installation directory without changing its path, reload the extension, then refresh GitHub. When changing browser, installation path or extension ID, use **Merge** to import your backup into the new extension.

**Replace** removes existing notes absent from the backup. Note imports preserve language and visibility preferences.

Releases provide download packages, not automatic browser installation. This fork is not listed in extension stores. Store-external CRX installation is restricted by browser and OS policies, so unpacked packages are provided instead.

## Data and privacy

Notes, visibility and language preferences use `storage.sync`: they are stored locally and may sync through your browser account when browser sync is enabled. This is not strictly local-only storage or automatic sync across browser brands.

There is no application server or automatic network request. Permissions are limited to `storage` and `https://github.com/*`. Notes are inserted as text; the visibility switch hides them visually without encrypting or deleting them.

Notes are limited to 2,000 characters; sync storage is approximately 100 KB and 512 items including settings. Export a backup before uninstalling.

The repository and packages contain no personal notes. GitHub Issues are public: do not post private notes or unredacted screenshots.

## Development and releases

Node.js 24; no third-party dependencies:

```sh
node --test
node scripts/pack.mjs
python3 tests/check-packages.py
```

The packer writes Chrome, Edge and Firefox ZIPs to `dist/`, including the license and documentation.

Every push to `main` runs [the release workflow](.github/workflows/release.yml), checks the source, builds the packages and publishes a GitHub Release using the built-in `GITHUB_TOKEN`. Incomplete releases remain drafts. Rerunning the same workflow run reuses its version.

The manifest version (`1.0.4`) is the release baseline. CI adds the workflow run number minus one to the patch number, yielding `1.0.4`, `1.0.5`, etc., and stamps the packaged manifest without committing version-only changes. Local builds use the baseline. Do not lower the baseline or reset the workflow's run sequence.

GitHub matching rules live in `src/selectors.js` and may need updates when GitHub changes its markup.

## Acknowledgments and license

Thanks to **[suolk/ghwho](https://github.com/suolk/ghwho)** for the original notes, previews, localization and backup implementation. This project preserves its Git history and MIT copyright notice, adds a visibility switch, browser packages and automatic releases, and updates project links.

Original code © 2026 suolk; modifications © 2026 w940853815. [MIT license](LICENSE).

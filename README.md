# ghwho

给 GitHub 用户添加私人备注，在用户名旁认出熟悉的人。由 [w940853815](https://github.com/w940853815) 维护，基于 [suolk/ghwho](https://github.com/suolk/ghwho)。

[下载最新版本](https://github.com/w940853815/ghwho-chrome/releases/latest) · [问题反馈](https://github.com/w940853815/ghwho-chrome/issues) · [English](README.en.md)

## 功能

- 在个人主页、Issue、PR、评论和成员列表的用户名旁显示备注；同一条记录内同一用户只显示一次。
- 行内显示淡蓝色小标签，长文本截断；点击编辑，悬停查看完整内容和 HTTP/HTTPS 链接。
- 顶部状态摘要、审批/合并/删除分支等操作流水、正文 @提及、纯头像和悬浮名片不插入备注；保留评论作者和右侧人员列表的备注。新增备注请进入用户个人主页或扩展管理面板。
- 在扩展面板使用 **显示备注** 开关，立即切换所有已打开 GitHub 页面的备注和添加入口。选择会保留，隐藏不删除数据；管理面板仍可管理备注。
- 管理面板以备注为主、账号为辅；点击 **编辑** 可修改或删除，底部 **导入与导出** 可展开数据管理工具。
- **具体时间** 开关将 GitHub 的“几分钟前”等时间改为 `YYYY-MM-DD HH:mm:ss`，使用电脑当前时区。默认关闭，选择会保留并同步到已打开的 GitHub 页面；关闭后恢复原显示，与备注显示开关互不影响。
- 搜索、手动新增、编辑和删除备注，JSON 导入/导出。
- 中英文界面、亮色和暗色主题。

## 安装

从 [Releases](https://github.com/w940853815/ghwho-chrome/releases/latest) 下载对应浏览器的 ZIP，解压后保留文件夹。

| 浏览器 | 安装包 | 加载方式 |
| --- | --- | --- |
| Chrome 109+ | `ghwho-chrome-*.zip` | `chrome://extensions` → 开发者模式 → 加载已解压的扩展程序 |
| Edge 109+ | `ghwho-edge-*.zip` | `edge://extensions` → 开发人员模式 → 加载解压缩的扩展 |
| Brave、Vivaldi、Arc 等 Chromium 浏览器 | Chrome 包 | 在浏览器扩展管理页面加载解压目录；需支持相应扩展 API，未逐一实测 |
| Firefox 140+ | `ghwho-firefox-*.zip` | `about:debugging#/runtime/this-firefox` → 临时载入附加组件 → 选择解压目录的 `manifest.json` |

Firefox 临时加载的扩展会在重启后移除；正式版 Firefox 的持久安装需要 Mozilla 签名，本仓库没有提供已签名的 XPI。Safari 需要另行转换、打包和签名，不包含在本次分发中。

加载后刷新 GitHub 页面。仅支持 `https://github.com/*`，不包含自建 GitHub Enterprise 域名。

### 更新与迁移

1. 在原扩展面板导出 JSON 备份。
2. 下载新版 ZIP，解压覆盖原安装目录中的程序文件，保持目录路径不变。
3. 在扩展管理页点击重新加载，再刷新 GitHub 页面。
4. 如果换了浏览器、安装目录或扩展 ID，在新扩展中选择 **合并导入**，导入备份。

“覆盖导入”会删除备份里没有的现有备注。备注显示、具体时间和语言设置不会被备注导入覆盖。

GitHub Release 负责发布下载包；手动加载的扩展不会自动安装新版，也没有上架 Chrome/Edge/Firefox 商店。商店外 CRX 的安装受浏览器与系统策略限制，因此这里提供解压加载包。

## 数据与隐私

备注、显示开关、时间显示偏好和语言设置使用浏览器的 `storage.sync`：本机保存，启用浏览器同步时可能随浏览器账号同步。它不是严格仅本地存储，也不会在不同浏览器品牌之间自动同步。

扩展没有自建服务器，不自动发送网络请求。只有 `storage` 和 `https://github.com/*` 权限。备注作为文本插入页面，隐藏开关只控制显示，不会加密或删除备注。

单条备注最多 2000 字符；同步存储总量约 100 KB、最多 512 个存储项（含设置）。卸载前请先导出备份。

项目仓库和安装包不包含个人备注。GitHub Issues 是公开反馈，请勿提交私人备注、账号信息或未脱敏截图。

## 开发与自动发布

Node.js 24，无需安装第三方依赖：

```sh
node --test
node scripts/pack.mjs
python3 tests/check-packages.py
```

用浏览器打开 `tests/content.html`，页面显示 `PASS` 表示备注去重、显示范围、编辑、具体时间开关和动态更新回归检查通过。

`dist/` 生成 Chrome、Edge、Firefox 三个 ZIP，包内包含许可证和安装说明。

推送到 `main` 后，[Release 工作流](.github/workflows/release.yml) 自动检查、打包并发布 GitHub Release，使用 GitHub 自带的 `GITHUB_TOKEN`。失败时不会公开未完成的 Release，重跑同一次工作流沿用同一版本。

`manifest.json` 中的版本是发布基线 `1.0.4`；CI 将补丁号加上工作流运行序号减一，依次生成 `1.0.4`、`1.0.5` 等版本，并写入安装包。CI 不向源码提交版本号，避免触发循环；手动构建使用源码中的基线版本。不要降低版本基线或更换发布工作流来重置运行序号。

用户名识别规则位于 `src/selectors.js`；GitHub 页面结构更新后可能需要调整。

## 致谢与许可证

感谢 **[suolk/ghwho](https://github.com/suolk/ghwho)** 提供完整的备注、预览、国际化和导入导出实现。本项目保留其 Git 历史与 MIT 版权声明，并在此基础上增加显示开关、多浏览器打包和自动发布流程，调整项目入口。

原始代码 © 2026 suolk；修改部分 © 2026 w940853815。使用 [MIT 许可证](LICENSE)。

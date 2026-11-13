下载对应浏览器的 ZIP 并解压，安装方法见 README。

- Chrome / Brave / Vivaldi / Arc：`ghwho-chrome-*.zip`
- Microsoft Edge：`ghwho-edge-*.zip`
- Firefox：`ghwho-firefox-*.zip`，通过 `about:debugging` 临时加载，重启后需要重新加载。

Chrome / Edge 在扩展管理页开启开发者模式，选择“加载已解压的扩展程序”。更新前请导出 JSON 备份；覆盖原目录后重新加载扩展并刷新 GitHub。

包含一键隐藏/显示备注，隐藏不会删除数据。备注存于浏览器 `storage.sync`，启用浏览器同步时可能随账号同步。安装包不包含个人备注。

感谢 [suolk/ghwho](https://github.com/suolk/ghwho)，本项目基于其 MIT 开源代码开发。

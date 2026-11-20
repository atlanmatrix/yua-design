# WANO 核电评估平台 · 功能扩展 DEMO

首页 `/` 展示设计列表。点击「WANO 核电评估平台」打开版本列表 `/wano/`，选择 `v1` 进入演示页 `/wano/v1/`。页面、样式、模拟数据和交互脚本位于 [wano/v1](wano/v1/)，可在静态服务器上独立运行。

## 本地开发

使用 Node.js 24 和 npm 11。

```sh
npm ci
npm run dev -- --host 0.0.0.0 --port 4173
```

打开 <http://localhost:4173/>。

## 验证与构建

```sh
npx playwright install --with-deps chromium
npm test
BASE_PATH=/yua-design/ npm run build
```

可设置 `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium` 使用已安装的 Chromium。构建输出为 `dist/`，其中 `wano/v1/` 保留完整演示文件及其相对引用。

## GitHub Pages

将代码推送到 `main` 会运行 [.github/workflows/pages.yml](.github/workflows/pages.yml)，执行桌面与移动端测试、构建并部署。仓库的 Pages 发布来源应选择 **GitHub Actions**。部署后的项目站点入口为 <https://atlanmatrix.github.io/yua-design/>。

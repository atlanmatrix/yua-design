# WANO Vue 页面原型

根据提供的三张截图实现租户管理、运营统计、租户详情。仅包含 Vue 前端；业务数据为本地演示数据，刷新后恢复，不连接核电业务系统。截图未展示的弹窗与页签采用相同公共组件补齐交互。

## 开发

Node.js 24、npm 11。

```sh
npm ci
npm run dev -- --host 0.0.0.0 --port 4173
```

主路由 `/wano/tenant/v1`，统计页 `/wano/tenant/v1/overview`，详情页 `/wano/tenant/v1/detail?id=1`。GitHub Pages 上使用仓库站点前缀，例如 `/yua-design/wano/tenant/v1/`。不使用 hash 路由。

## 验证与构建

```sh
npx playwright install --with-deps chromium
npm test
BASE_PATH=/yua-design/ npm run build
```

云环境中可使用已安装的 Chromium：

```sh
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm test
```

如果 npm 默认缓存不可写，安装时增加 `--cache /tmp/yua-npm-cache`。构建输出为 `dist/`。构建脚本为三个路由生成独立 HTML 入口，支持 GitHub Pages 直接打开和刷新；同时生成 `404.html` 与 `.nojekyll`。

## GitHub Pages

将代码推送到 `main` 会运行 `.github/workflows/pages.yml`：锁文件安装、桌面与移动端 Playwright 测试、Vite 构建、上传 Pages artifact、部署。也支持手动触发。

在仓库 **Settings → Pages → Build and deployment → Source** 中选择 **GitHub Actions**。若自动启用 Pages 的步骤被权限策略拒绝，仓库管理员需先完成此设置并重跑工作流。仓库/组织需要允许 GitHub Actions 和 Pages，私有仓库的 Pages 可用性取决于账户方案。

标准项目站点的访问地址为 `https://atlanmatrix.github.io/yua-design/wano/tenant/v1/`；如果要在域名根路径 `/wano/tenant/v1/` 访问，需要配置自定义域名或使用用户站点仓库。`BASE_PATH` 由 `actions/configure-pages` 输出决定，不写死仓库名。

## 公共组件

`src/components/` 包含按钮、图标、输入、支持多选的下拉、标签、弹窗、租户表单、配额进度条与环形图。页面仅组合公共组件。主要设计约定见 `AGENTS.md`。

头像由 Image Gen 生成以替代截图中的人物照片；图标使用 Tabler Icons（MIT）。截图没有提供原始 Logo，导航品牌图形采用 Tabler 标准图标替代；不复刻截图中的破图、虚线焦点及导航挤压问题。

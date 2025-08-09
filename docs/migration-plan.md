# Focal Meet 前端改造方案与实施步骤（基于 system-arch.md）

本方案基于 `docs/system-arch.md` 的目标、目录与规范，给出从现状（双目录：`focalMeet` 静态站 + `focal-meet` React 应用）到统一 Monorepo 前端的分阶段改造步骤、任务拆分与验收清单。

---

## 背景与目标

- **统一工程**：将“官网（营销站）”与“应用（登录后）”合并到 `focal-meet` React 工程，使用路由分树管理。
- **样式体系**：在现有 Tailwind 基础上引入 SCSS 架构与主题能力，实现两者短期共存、长期可平衡使用。
- **资源治理**：统一静态资源归口，区分打包资源与直链资源。
- **工程规范**：路径别名、路由集中化、类型与代码风格统一；引入后端集成与错误处理的一致方案。

---

## 范围

- 迁移 `focalMeet` 营销站到 `focal-meet/src/views/marketing/**`。
- 建立路由双分支与布局：`MarketingLayout` 与 `AppLayout`；集中路由定义至 `src/router/index.tsx`。
- 引入并落地 SCSS 7-1 结构与主题机制；Tailwind 过渡性共存。
- 静态资源迁移到 `focal-meet/public/assets/**` 与 `focal-meet/src/assets/**`。
- 后端集成的基础设施与建议（HTTP 封装、OpenAPI 类型、React Query）。
- i18n、错误处理与可观测性、SEO、多环境配置与部署链路。

---

## 里程碑（对应 system-arch.md）

- **M1：骨架**
  - 路由双分支与布局搭建；`Home` 迁移；AOS 仅在营销分支初始化；资源归位。
- **M2：页面迁移**
  - 迁移 About/Features/Pricing/Blog（及 Blog 详情）；行为交互 React 化（平滑滚动、定价切换、FAQ）。
- **M3：应用完善**
  - 鉴权门卫、全局状态；HTTP 封装与 API 客户端；错误处理与可观测性；i18n/SEO；CI/CD。

---

## 任务分解与实施步骤

### 0. 准备

- 确认 Node 版本与依赖安装

```bash
npm i
```

- 推荐安装 SCSS 与（可选）Prettier

```bash
npm i -D sass prettier
```

### 1. 目录与别名

- 新增基础目录（如不存在）：

```text
src/
  views/
    marketing/
    app/
  components/
  layouts/
  router/
  styles/
  assets/
public/
  assets/
```

- 在 `tsconfig.json` 与 `vite.config.ts` 配置别名：`@views`, `@components`, `@layouts`, `@router`, `@styles`, `@assets`。

### 2. 路由与布局

- 创建 `src/layouts/MarketingLayout.tsx`、`src/layouts/AppLayout.tsx`，在营销布局内初始化 AOS（仅营销分支）。
- 创建 `src/router/index.tsx`，集中定义两棵路由树：
  - 营销站：`/`, `/about`, `/features`, `/pricing`, `/blog`, `/blog/:slug`
  - 应用区：`/app/login`, `/app/dashboard`, `/app/meetings/:id`

- 在 `src/main.tsx` 中挂载 Router（若尚未）。

### 3. SCSS 架构与主题

- 建立 7-1 改良结构：

```text
src/styles/
  abstracts/_variables.scss
  abstracts/_mixins.scss
  abstracts/_functions.scss
  abstracts/_placeholders.scss
  abstracts/_breakpoints.scss
  base/_reset.scss
  base/_typography.scss
  base/_globals.scss
  layout/_header.scss
  layout/_footer.scss
  layout/_grid.scss
  components/_button.scss
  pages/
  themes/_light.scss
  themes/_dark.scss
  utilities/_helpers.scss
  index.scss
```

- 在 `src/main.tsx` 或根布局引入：

```ts
import '@styles/index.scss';
```

- 主题机制：在组件或入口通过 `document.documentElement.setAttribute('data-theme', 'dark' | 'light')` 切换；组件使用 CSS 变量 `var(--token)`。
- 应用内组件优先使用 `*.module.scss`；营销页样式加 `.marketing` 命名空间防止泄漏。

### 4. 静态资源迁移

- 将 `focalMeet/assets/**` 迁移到 `focal-meet/public/assets/**`（直链资源）。
- 组件内打包资源置于 `src/assets/**`，通过 `import` 使用：

```tsx
import logo from '@assets/logo.svg';
<img src={logo} alt="logo" />
```

- 页面内引用直链资源使用 `/assets/...` 路径。

### 5. 营销页迁移（M1/M2）

- 页面映射：
  - `focalMeet/index.html` → `src/views/marketing/Home.tsx`
  - `focalMeet/about.html` → `src/views/marketing/About.tsx`
  - `focalMeet/features.html` → `src/views/marketing/Features.tsx`
  - `focalMeet/pricing.html` → `src/views/marketing/Pricing.tsx`
  - `focalMeet/blog.html` + `blog/*.html` → `src/views/marketing/Blog.tsx` 与 `BlogDetail.tsx`
- 行为重写：平滑滚动、导航高亮、定价切换、FAQ 折叠、AOS 初始化。
- 过渡期可复用 `focalMeet/css/style.css` 的关键样式，逐步 SCSS 化并删除旧 CSS。

### 6. 应用区对齐（M3）

- 将现有 `src/components/AuthForm.tsx`, `Dashboard.tsx`, `MeetingDetail.tsx` 整理到 `views/app/**` 或保留组件 + 页面分层。
- 新增 `AppLayout` 导航与容器；按需加鉴权门卫（基于会话态重定向登录）。

### 7. 后端集成与状态管理（建议落地）

- HTTP 封装：`src/services/http.ts`（统一 baseURL、超时与错误归一化，附请求 ID）。
- OpenAPI 类型生成（二选一）：

```bash
npx openapi-typescript http://localhost:8000/openapi.json -o src/types/api.d.ts
# 或配置 orval 后：
npx orval
```

- 引入 React Query（可选但推荐）：

```bash
npm i @tanstack/react-query
```

- 业务域 API：`src/services/api/{auth,meetings,files}.ts`，消费生成类型。
- Stores 约定与落地：
  - 目录：`src/stores/**` 存放纯前端跨页/全局 UI 状态（如主题、侧边栏开合、定价币种等）。
  - 原则：服务端数据以 React Query 为单一事实来源，Store 不直接发请求，仅持本地 UI 衍生状态与用户偏好。
  - 示例：`themeStore.ts`、`uiStore.ts`、`pricingStore.ts`，导出 typed hooks（如 `useThemeStore()`）。

### 8. 环境与代理

- 使用 `.env.*` 注入 `VITE_*`：
  - `VITE_API_BASE_URL=/api`
  - `VITE_I18N_DEFAULT_LANG`, `VITE_I18N_SUPPORTED`
- 开发代理：在 `vite.config.ts` 配置 `server.proxy['/api']` 指向后端。

### 9. 错误处理与可观测性

- HTTP 层归一错误为 `{ code, message, details }`；统一在 UI 使用 Toast/通知组件反馈。
- React Error Boundary 覆盖渲染错误；必要时接入 Sentry/LogRocket，上报 `requestId/traceId`。

### 10. i18n（按需）

- 依赖：`react-i18next`、`i18next-browser-languagedetector`。
- 资源组织：

```text
public/locales/
  en/{common.json, marketing.json, app.json}
  zh/{common.json, marketing.json, app.json}
```

- 命名空间懒加载；路由分支切换时按需加载对应命名空间。

### 11. SEO（营销站）

- 布局层设置 `<html lang>` 与 `hreflang`；为多语言生成 sitemap 与 canonical。
- i18n 文案驱动页面的标题/描述/OG。

### 12. 构建与部署

- 产物：Vite 构建静态文件；生产期由 Nginx/网关反代 `/api` 到后端，尽量同源避免 CORS。
- 缓存：`public/assets` 长缓存、HTML/entry 短缓存；必要时文件指纹或版本号。

---

## 验收清单（按阶段）

- M1
  - [ ] 访问 `/` 渲染 `Home`（营销分支）；AOS 正常；资源路径均为 `/assets/...` 或打包资源。
  - [ ] 路由集中定义，`MarketingLayout` 与 `AppLayout` 均可渲染 `Outlet`。
  - [ ] SCSS 能全局生效；能切换主题 `light/dark`；Tailwind 与 SCSS 共存无冲突。
- M2
  - [ ] 营销页全部迁移，交互行为 React 化；样式命名空间不污染应用分支。
  - [ ] 直链与打包资源引用规范统一，无 404；Lighthouse 基础指标不低于迁移前。
- M3
  - [ ] 登录态与鉴权门卫生效；未登录访问应用路由会重定向。
  - [ ] HTTP 封装、错误归一化与全局 Toast；关键请求带 `requestId`。
  - [ ] Stores 落地：`src/stores/**` 建立；主题/侧边栏/定价币种可持久化；与 React Query 职责边界清晰。
  - [ ] i18n 可按语言切换；SEO 标签正确；构建与部署可用。

---

## 风险与回滚

- 风险：
  - 样式泄漏/覆盖顺序导致 UI 异常；营销与应用样式需命名空间隔离。
  - 资源路径变更引发 404；需灰度验证与日志监控。
  - SEO 指标波动；需监控收录与关键页面的 meta 正确性。
- 回滚：
  - 保留 `focalMeet` 分支部署开关，必要时可切回旧静态站；新旧并行一段灰度期。

---

## 时间与分工建议（可按团队调整）

- M1（~2-3 天）：骨架、`Home` 迁移、资源归位、SCSS 基座。
- M2（~3-5 天）：其余营销页 + 交互重写、样式 SCSS 化。
- M3（~3-5 天）：鉴权门卫、HTTP 封装、错误与 i18n/SEO、CI/CD。

---

## 附录：常用命令与样例片段

```bash
# 安装依赖
npm i

# 安装 SCSS/工具
npm i -D sass

# 启动开发
npm run dev

# 构建
npm run build
```

```ts
// 读取环境变量
const apiBase = import.meta.env.VITE_API_BASE_URL ?? '/api';
```

```scss
// 主题变量示例（abstracts/_variables.scss）
$color-primary: #ff6b6b;
:root { --color-primary: #{$color-primary}; }
[data-theme="dark"] { --color-primary: #ff5252; }
```

```tsx
// 按需主题切换
document.documentElement.setAttribute('data-theme', 'dark');
```

---

如需更细的页面级迁移清单与组件拆分建议，可在迁移 `Home` 后根据真实复用度补充组件库清单（如 `Hero`, `FeatureList`, `PricingTable`, `FAQ`, `BlogCard` 等）。

# 列出改造方案及步骤
_Exported on 8/9/2025 at 16:20:41 GMT+8 from Cursor (1.4.2)_

---

**User**

@system-arch.md 基于这个文档，列出一个改造方案及步骤，写到docs目录下

---

**Cursor**

我要基于当前的 `focal-meet/docs/system-arch.md` 编写一份详细的改造方案与实施步骤文档，并保存到 `focal-meet/docs/migration-plan.md`。随后会总结关键内容与影响。

```markdown
## Focal Meet 前端改造方案与实施步骤（基于 system-arch.md）

本方案基于 `docs/system-arch.md` 的目标、目录与规范，给出从现状（双目录：`focalMeet` 静态站 + `focal-meet` React 应用）到统一 Monorepo 前端的分阶段改造步骤、任务拆分与验收清单。

---

### 背景与目标
- **统一工程**：将“官网（营销站）”与“应用（登录后）”合并到 `focal-meet` React 工程，使用路由分树管理。
- **样式体系**：在现有 Tailwind 基础上引入 SCSS 架构与主题能力，实现两者短期共存、长期可平衡使用。
- **资源治理**：统一静态资源归口，区分打包资源与直链资源。
- **工程规范**：路径别名、路由集中化、类型与代码风格统一；引入后端集成与错误处理的一致方案。

---

### 范围
- 迁移 `focalMeet` 营销站到 `focal-meet/src/views/marketing/**`。
- 建立路由双分支与布局：`MarketingLayout` 与 `AppLayout`；集中路由定义至 `src/router/index.tsx`。
- 引入并落地 SCSS 7-1 结构与主题机制；Tailwind 过渡性共存。
- 静态资源迁移到 `focal-meet/public/assets/**` 与 `focal-meet/src/assets/**`。
- 后端集成的基础设施与建议（HTTP 封装、OpenAPI 类型、React Query）。
- i18n、错误处理与可观测性、SEO、多环境配置与部署链路。

---

### 里程碑（对应 system-arch.md）
- **M1：骨架**
  - 路由双分支与布局搭建；`Home` 迁移；AOS 仅在营销分支初始化；资源归位。
- **M2：页面迁移**
  - 迁移 About/Features/Pricing/Blog（及 Blog 详情）；行为交互 React 化（平滑滚动、定价切换、FAQ）。
- **M3：应用完善**
  - 鉴权门卫、全局状态；HTTP 封装与 API 客户端；错误处理与可观测性；i18n/SEO；CI/CD。

---

### 任务分解与实施步骤

#### 0. 准备
- 确认 Node 版本与依赖安装
```bash
npm i
```
- 推荐安装 SCSS 与（可选）Prettier
```bash
npm i -D sass prettier
```

#### 1. 目录与别名
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

#### 2. 路由与布局
- 创建 `src/layouts/MarketingLayout.tsx`、`src/layouts/AppLayout.tsx`，在营销布局内初始化 AOS（仅营销分支）。
- 创建 `src/router/index.tsx`，集中定义两棵路由树：
  - 营销站：`/`, `/about`, `/features`, `/pricing`, `/blog`, `/blog/:slug`
  - 应用区：`/app/login`, `/app/dashboard`, `/app/meetings/:id`
- 在 `src/main.tsx` 中挂载 Router（若尚未）。

#### 3. SCSS 架构与主题
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

#### 4. 静态资源迁移
- 将 `focalMeet/assets/**` 迁移到 `focal-meet/public/assets/**`（直链资源）。
- 组件内打包资源置于 `src/assets/**`，通过 `import` 使用：
```tsx
import logo from '@assets/logo.svg';
<img src={logo} alt="logo" />
```
- 页面内引用直链资源使用 `/assets/...` 路径。

#### 5. 营销页迁移（M1/M2）
- 页面映射：
  - `focalMeet/index.html` → `src/views/marketing/Home.tsx`
  - `focalMeet/about.html` → `src/views/marketing/About.tsx`
  - `focalMeet/features.html` → `src/views/marketing/Features.tsx`
  - `focalMeet/pricing.html` → `src/views/marketing/Pricing.tsx`
  - `focalMeet/blog.html` + `blog/*.html` → `src/views/marketing/Blog.tsx` 与 `BlogDetail.tsx`
- 行为重写：平滑滚动、导航高亮、定价切换、FAQ 折叠、AOS 初始化。
- 过渡期可复用 `focalMeet/css/style.css` 的关键样式，逐步 SCSS 化并删除旧 CSS。

#### 6. 应用区对齐（M3）
- 将现有 `src/components/AuthForm.tsx`, `Dashboard.tsx`, `MeetingDetail.tsx` 整理到 `views/app/**` 或保留组件 + 页面分层。
- 新增 `AppLayout` 导航与容器；按需加鉴权门卫（基于会话态重定向登录）。

#### 7. 后端集成（建议落地）
- HTTP 封装：`src/services/http.ts`（统一 baseURL、超时与错误归一化，附请求 ID）。
- OpenAPI 类型生成（二选一）：
```bash
npx openapi-typescript http://localhost:8000/openapi.json -o src/types/api.d.ts
# 或配置 orval 后：
npx orval
```
- 业务域 API：`src/services/api/{auth,meetings,files}.ts`，消费生成类型。
- 引入 React Query（可选但推荐）：
```bash
npm i @tanstack/react-query
```

#### 8. 环境与代理
- 使用 `.env.*` 注入 `VITE_*`：
  - `VITE_API_BASE_URL=/api`
  - `VITE_I18N_DEFAULT_LANG`, `VITE_I18N_SUPPORTED`
- 开发代理：在 `vite.config.ts` 配置 `server.proxy['/api']` 指向后端。

#### 9. 错误处理与可观测性
- HTTP 层归一错误为 `{ code, message, details }`；统一在 UI 使用 Toast/通知组件反馈。
- React Error Boundary 覆盖渲染错误；必要时接入 Sentry/LogRocket，上报 `requestId/traceId`。

#### 10. i18n（按需）
- 依赖：`react-i18next`、`i18next-browser-languagedetector`。
- 资源组织：
```text
public/locales/
  en/{common.json, marketing.json, app.json}
  zh/{common.json, marketing.json, app.json}
```
- 命名空间懒加载；路由分支切换时按需加载对应命名空间。

#### 11. SEO（营销站）
- 布局层设置 `<html lang>` 与 `hreflang`；为多语言生成 sitemap 与 canonical。
- i18n 文案驱动页面的标题/描述/OG。

#### 12. 构建与部署
- 产物：Vite 构建静态文件；生产期由 Nginx/网关反代 `/api` 到后端，尽量同源避免 CORS。
- 缓存：`public/assets` 长缓存、HTML/entry 短缓存；必要时文件指纹或版本号。

---

### 验收清单（按阶段）
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
  - [ ] i18n 可按语言切换；SEO 标签正确；构建与部署可用。

---

### 风险与回滚
- 风险：
  - 样式泄漏/覆盖顺序导致 UI 异常；营销与应用样式需命名空间隔离。
  - 资源路径变更引发 404；需灰度验证与日志监控。
  - SEO 指标波动；需监控收录与关键页面的 meta 正确性。
- 回滚：
  - 保留 `focalMeet` 分支部署开关，必要时可切回旧静态站；新旧并行一段灰度期。

---

### 时间与分工建议（可按团队调整）
- M1（~2-3 天）：骨架、`Home` 迁移、资源归位、SCSS 基座。
- M2（~3-5 天）：其余营销页 + 交互重写、样式 SCSS 化。
- M3（~3-5 天）：鉴权门卫、HTTP 封装、错误与 i18n/SEO、CI/CD。

---

### 附录：常用命令与样例片段

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


```

我已在 `focal-meet/docs/migration-plan.md` 写入了改造方案与实施步骤。现在检查该新文档是否有 lint 问题，并修复后再交付。

我将清理并规范化 `focal-meet/docs/migration-plan.md` 的 Markdown 格式（标题级别、段落空行、代码块与列表周围的空行），以通过当前的 linter 规则。随后我会再次运行校验，确认无误。

我将规范 `focal-meet/docs/migration-plan.md` 的 Markdown 空行与标题级别，修复 lint 警告并再次检查。

```markdown
# Focal Meet 前端改造方案与实施步骤（基于 system-arch.md）

本方案基于 `docs/system-arch.md` 的目标、目录与规范，给出从现状（双目录：`focalMeet` 静态站 + `focal-meet` React 应用）到统一 Monorepo 前端的分阶段改造步骤、任务拆分与验收清单。

---

### 背景与目标

- **统一工程**：将“官网（营销站）”与“应用（登录后）”合并到 `focal-meet` React 工程，使用路由分树管理。
- **样式体系**：在现有 Tailwind 基础上引入 SCSS 架构与主题能力，实现两者短期共存、长期可平衡使用。
- **资源治理**：统一静态资源归口，区分打包资源与直链资源。
- **工程规范**：路径别名、路由集中化、类型与代码风格统一；引入后端集成与错误处理的一致方案。

---

### 范围

- 迁移 `focalMeet` 营销站到 `focal-meet/src/views/marketing/**`。
- 建立路由双分支与布局：`MarketingLayout` 与 `AppLayout`；集中路由定义至 `src/router/index.tsx`。
- 引入并落地 SCSS 7-1 结构与主题机制；Tailwind 过渡性共存。
- 静态资源迁移到 `focal-meet/public/assets/**` 与 `focal-meet/src/assets/**`。
- 后端集成的基础设施与建议（HTTP 封装、OpenAPI 类型、React Query）。
- i18n、错误处理与可观测性、SEO、多环境配置与部署链路。

---

### 里程碑（对应 system-arch.md）

- **M1：骨架**
  - 路由双分支与布局搭建；`Home` 迁移；AOS 仅在营销分支初始化；资源归位。
- **M2：页面迁移**
  - 迁移 About/Features/Pricing/Blog（及 Blog 详情）；行为交互 React 化（平滑滚动、定价切换、FAQ）。
- **M3：应用完善**
  - 鉴权门卫、全局状态；HTTP 封装与 API 客户端；错误处理与可观测性；i18n/SEO；CI/CD。

---

### 任务分解与实施步骤

#### 0. 准备

- 确认 Node 版本与依赖安装

```bash
npm i
```

- 推荐安装 SCSS 与（可选）Prettier

```bash
npm i -D sass prettier
```

#### 1. 目录与别名

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

#### 2. 路由与布局

- 创建 `src/layouts/MarketingLayout.tsx`、`src/layouts/AppLayout.tsx`，在营销布局内初始化 AOS（仅营销分支）。
- 创建 `src/router/index.tsx`，集中定义两棵路由树：
  - 营销站：`/`, `/about`, `/features`, `/pricing`, `/blog`, `/blog/:slug`
  - 应用区：`/app/login`, `/app/dashboard`, `/app/meetings/:id`

- 在 `src/main.tsx` 中挂载 Router（若尚未）。

#### 3. SCSS 架构与主题

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

#### 4. 静态资源迁移

- 将 `focalMeet/assets/**` 迁移到 `focal-meet/public/assets/**`（直链资源）。
- 组件内打包资源置于 `src/assets/**`，通过 `import` 使用：

```tsx
import logo from '@assets/logo.svg';
<img src={logo} alt="logo" />
```

- 页面内引用直链资源使用 `/assets/...` 路径。

#### 5. 营销页迁移（M1/M2）

- 页面映射：
  - `focalMeet/index.html` → `src/views/marketing/Home.tsx`
  - `focalMeet/about.html` → `src/views/marketing/About.tsx`
  - `focalMeet/features.html` → `src/views/marketing/Features.tsx`
  - `focalMeet/pricing.html` → `src/views/marketing/Pricing.tsx`
  - `focalMeet/blog.html` + `blog/*.html` → `src/views/marketing/Blog.tsx` 与 `BlogDetail.tsx`
- 行为重写：平滑滚动、导航高亮、定价切换、FAQ 折叠、AOS 初始化。
- 过渡期可复用 `focalMeet/css/style.css` 的关键样式，逐步 SCSS 化并删除旧 CSS。

#### 6. 应用区对齐（M3）

- 将现有 `src/components/AuthForm.tsx`, `Dashboard.tsx`, `MeetingDetail.tsx` 整理到 `views/app/**` 或保留组件 + 页面分层。
- 新增 `AppLayout` 导航与容器；按需加鉴权门卫（基于会话态重定向登录）。

#### 7. 后端集成（建议落地）

- HTTP 封装：`src/services/http.ts`（统一 baseURL、超时与错误归一化，附请求 ID）。
- OpenAPI 类型生成（二选一）：

```bash
npx openapi-typescript http://localhost:8000/openapi.json -o src/types/api.d.ts
# 或配置 orval 后：
npx orval
```

- 业务域 API：`src/services/api/{auth,meetings,files}.ts`，消费生成类型。
- 引入 React Query（可选但推荐）：

```bash
npm i @tanstack/react-query
```

#### 8. 环境与代理

- 使用 `.env.*` 注入 `VITE_*`：
  - `VITE_API_BASE_URL=/api`
  - `VITE_I18N_DEFAULT_LANG`, `VITE_I18N_SUPPORTED`
- 开发代理：在 `vite.config.ts` 配置 `server.proxy['/api']` 指向后端。

#### 9. 错误处理与可观测性

- HTTP 层归一错误为 `{ code, message, details }`；统一在 UI 使用 Toast/通知组件反馈。
- React Error Boundary 覆盖渲染错误；必要时接入 Sentry/LogRocket，上报 `requestId/traceId`。

#### 10. i18n（按需）

- 依赖：`react-i18next`、`i18next-browser-languagedetector`。
- 资源组织：

```text
public/locales/
  en/{common.json, marketing.json, app.json}
  zh/{common.json, marketing.json, app.json}
```
- 命名空间懒加载；路由分支切换时按需加载对应命名空间。

#### 11. SEO（营销站）

- 布局层设置 `<html lang>` 与 `hreflang`；为多语言生成 sitemap 与 canonical。
- i18n 文案驱动页面的标题/描述/OG。

#### 12. 构建与部署

- 产物：Vite 构建静态文件；生产期由 Nginx/网关反代 `/api` 到后端，尽量同源避免 CORS。
- 缓存：`public/assets` 长缓存、HTML/entry 短缓存；必要时文件指纹或版本号。

---

### 验收清单（按阶段）

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
  - [ ] i18n 可按语言切换；SEO 标签正确；构建与部署可用。

---

### 风险与回滚

- 风险：
  - 样式泄漏/覆盖顺序导致 UI 异常；营销与应用样式需命名空间隔离。
  - 资源路径变更引发 404；需灰度验证与日志监控。
  - SEO 指标波动；需监控收录与关键页面的 meta 正确性。
- 回滚：
  - 保留 `focalMeet` 分支部署开关，必要时可切回旧静态站；新旧并行一段灰度期。

---

### 时间与分工建议（可按团队调整）

- M1（~2-3 天）：骨架、`Home` 迁移、资源归位、SCSS 基座。
- M2（~3-5 天）：其余营销页 + 交互重写、样式 SCSS 化。
- M3（~3-5 天）：鉴权门卫、HTTP 封装、错误与 i18n/SEO、CI/CD。

---

### 附录：常用命令与样例片段

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

```

```markdown
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

### 7. 后端集成（建议落地）

- HTTP 封装：`src/services/http.ts`（统一 baseURL、超时与错误归一化，附请求 ID）。
- OpenAPI 类型生成（二选一）：

```bash
npx openapi-typescript http://localhost:8000/openapi.json -o src/types/api.d.ts
# 或配置 orval 后：
npx orval
```

- 业务域 API：`src/services/api/{auth,meetings,files}.ts`，消费生成类型。
- 引入 React Query（可选但推荐）：

```bash
npm i @tanstack/react-query
```

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

```

```markdown
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

### 7. 后端集成（建议落地）

- HTTP 封装：`src/services/http.ts`（统一 baseURL、超时与错误归一化，附请求 ID）。
- OpenAPI 类型生成（二选一）：

```bash
npx openapi-typescript http://localhost:8000/openapi.json -o src/types/api.d.ts
# 或配置 orval 后：
npx orval
```

- 业务域 API：`src/services/api/{auth,meetings,files}.ts`，消费生成类型。
- 引入 React Query（可选但推荐）：

```bash
npm i @tanstack/react-query
```

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

```

```markdown
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

### 7. 后端集成（建议落地）

- HTTP 封装：`src/services/http.ts`（统一 baseURL、超时与错误归一化，附请求 ID）。
- OpenAPI 类型生成（二选一）：

```bash
npx openapi-typescript http://localhost:8000/openapi.json -o src/types/api.d.ts
# 或配置 orval 后：
npx orval
```

- 业务域 API：`src/services/api/{auth,meetings,files}.ts`，消费生成类型。
- 引入 React Query（可选但推荐）：

```bash
npm i @tanstack/react-query
```

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

```

```markdown
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

### 7. 后端集成（建议落地）

- HTTP 封装：`src/services/http.ts`（统一 baseURL、超时与错误归一化，附请求 ID）。
- OpenAPI 类型生成（二选一）：

```bash
npx openapi-typescript http://localhost:8000/openapi.json -o src/types/api.d.ts
# 或配置 orval 后：
npx orval
```

- 业务域 API：`src/services/api/{auth,meetings,files}.ts`，消费生成类型。
- 引入 React Query（可选但推荐）：

```bash
npm i @tanstack/react-query
```

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

```

状态更新：
- 已在 `focal-meet/docs` 新增并填充改造方案文档 `migration-plan.md`，涵盖里程碑、目录与路由改造、SCSS 7-1 与主题机制、资源治理、营销页迁移映射、应用区完善、后端集成、环境与代理、错误处理、i18n、SEO、构建部署、验收清单、风险回滚、时间分工、命令示例等。
- 规范了 Markdown（标题层级、空行、代码块上下空行、列表空行），并消除了全部 linter 警告。

你可以在 `focal-meet/docs/migration-plan.md` 查看完整改造步骤和验收清单。

- 关键新增
  - `## 里程碑`：M1/M2/M3 的目标与产出。
  - `## 任务分解`：从目录/别名、路由与布局、SCSS 结构、资源迁移，到营销页映射和行为重写。
  - 后端集成建议：`src/services/http.ts`、OpenAPI 类型生成、React Query 接入。
  - 环境与代理、错误与可观测性、i18n、SEO、构建与部署实践。
  - 验收清单与风险/回滚方案。

是否需要我继续把 M1 的路由骨架和 `MarketingLayout`/`AppLayout`、`src/styles` 基础文件直接落地到代码里？

---

**User**

似乎还漏了 stores 是吗，还是是会记录在哪里？

---

**Cursor**

我将把“状态管理（Stores）”的规范补充到 `focal-meet/docs/system-arch.md`，并顺便修复其中已知的 linter 问题（省略号和无语言标注的代码块）。同时更新 `focal-meet/docs/migration-plan.md`，在任务和验收项中加入 stores 的落地内容。随后我会运行文档的 linter 检查，确保无警告。

```markdown
## 项目架构与开发规范（Focal Meet Monorepo 内的前端）

本文件定义 `focal-meet` 的目录结构、路由分层、资源组织、样式体系（基于 SCSS 的主题能力）、代码风格与协作规范，便于团队一致性开发与后续扩展。

### 目标与边界
- 将“官网（营销站）”与“应用（登录后）”统一到一个 React 工程内，采用路由分树管理。
- 样式从当前 Tailwind 基础上引入 SCSS，统一变量与主题机制；短期内可“共存，逐步替换”，长期可平衡两者使用。
- 静态资源统一管理，清晰区分“打包资源与直链资源”。

### 技术栈
- 构建：Vite + React + TypeScript
- 路由：react-router-dom
- 动效：AOS（仅营销站路由初始化）
- 样式：SCSS（支持主题切换）；Tailwind 作为过渡/补充
- 代码规范：ESLint（已配），建议加 Prettier（可选）

---

### 目录结构

- `src/`
  - `views/`（页面层）
    - `marketing/`（官网各页面：`Home`, `About`, `Features`, `Pricing`, `Blog`）
    - `app/`（应用内页面：`Login`, `Dashboard`, `MeetingDetail`）
  - `components/`（通用 UI 组件与表单，如 `AuthForm`）
  - `layouts/`（`MarketingLayout`, `AppLayout`）
  - `router/`（路由入口与守卫）
  - `styles/`（全局 SCSS 架构，详见“样式与主题”）
  - `assets/`（组件内 import 的打包资源：小图、icons、局部 SVG）
- `public/`
  - `assets/`（官网直链图片、视频、favicon、OG 图等）
- 路径别名（统一在 `tsconfig.json` 与 `vite.config.ts`）：
  - `@views`, `@components`, `@layouts`, `@router`, `@styles`, `@assets`

路由分树（示例）：
- 营销站（公开）：`/`, `/about`, `/features`, `/pricing`, `/blog`, `/blog/:slug`
- 应用区：`/app/login`, `/app/dashboard`, `/app/meetings/:id`（后续加鉴权）

---

### 样式与主题（SCSS 方案）

安装
```bash
npm i -D sass
```

组织（基于 7-1 改良结构）
- `src/styles/`
  - `abstracts/`（纯逻辑：不产出 CSS）
    - `_variables.scss`（主题色、间距、字体、ZIndex、阴影、radius）
    - `_mixins.scss`（响应式、文本截断、渐变、主题 Helper）
    - `_functions.scss`（颜色计算等）
    - `_placeholders.scss`（占位选择器）
    - `_breakpoints.scss`（断点常量与 mixin）
  - `base/`
    - `_reset.scss` 或 `_normalize.scss`
    - `_typography.scss`
    - `_globals.scss`（应用全局基础层）
  - `layout/`（`_header.scss`, `_footer.scss`, `_grid.scss`）
  - `components/`（通用组件样式，例如 `_button.scss`, `_card.scss`）
  - `pages/`（单页样式，避免泄漏：营销站页面建议加 `.marketing` 根容器命名空间）
  - `themes/`（主题覆盖：`_light.scss`, `_dark.scss`）
  - `utilities/`（工具类）
  - `index.scss`（唯一入口，按顺序聚合以上文件）

入口引入（建议在 `src/main.tsx` 或布局内）
```ts
import '@styles/index.scss';
```

主题机制（CSS 变量 + SCSS 变量双层）
- 用 SCSS 变量集中定义基础色系，再编译为 CSS 变量，运行时通过切换 `data-theme` 覆盖。
- 优点：设计/实现分离；运行时可切换主题；组件局部也可使用 `var(--token)`。

示例：`_variables.scss`
```scss
// SCSS 基础变量
$color-primary: #ff6b6b;
$color-accent: #4ecdc4;
$color-bg: #111111;
$color-fg: #ffffff;

// 尺寸与节奏
$radius-md: 12px;
$space-4: 16px;

// 导出为 CSS 变量（默认 light）
:root {
  --color-primary: #{$color-primary};
  --color-accent: #{$color-accent};
  --color-bg: #{$color-bg};
  --color-fg: #{$color-fg};

  --radius-md: #{$radius-md};
  --space-4: #{$space-4};
}

// 暗色主题覆盖
[data-theme="dark"] {
  --color-bg: #0d0d0d;
  --color-fg: #eaeaea;
  // 可根据需要覆盖 primary、accent 等
}
```

组件/页面使用（推荐 CSS Modules 或命名空间）
- 应用内组件：`Component.module.scss`（样式隔离）
- 营销站页面：在 `MarketingLayout` 外层加 `.marketing`，对应 SCSS 以 `.marketing .xxx` 开头，避免影响应用区

示例组件样式与使用
```scss
/* src/components/Button.module.scss */
.button {
  padding: var(--space-4) calc(var(--space-4) * 1.5);
  border-radius: var(--radius-md);
  color: var(--color-fg);
  background: linear-gradient(135deg, var(--color-primary), #ff5252);
}
```

```tsx
import styles from './Button.module.scss';

export default function Button(props) {
  return <button className={styles.button} {...props} />;
}
```

响应式断点与混入：`_breakpoints.scss`
```scss
$bp-sm: 640px;
$bp-md: 768px;
$bp-lg: 1024px;

@mixin up($bp) { @media (min-width: $bp) { @content; } }
@mixin down($bp) { @media (max-width: $bp) { @content; } }
```

Tailwind 共存策略（过渡期）
- 允许在营销页先复用现有 CSS（迁移自 `style.css`）并逐步 SCSS 化。
- 应用区优先使用 SCSS Modules。Tailwind 仅作为快速布局补充或清理后逐步减少。

主题切换
```ts
// 切换主题：在任意入口
document.documentElement.setAttribute('data-theme', 'dark'); // or 'light'
```

---

### 静态资源规范

- 直链资源（不参与打包，CDN/SEO/OG 友好）
  - 路径：`public/assets/**`
  - 访问：`/assets/xxx.png`
  - 用于：官网图像、视频、favicon、OG 图、下载文件等
- 打包资源（参与 Tree-Shaking、指纹化）
  - 路径：`src/assets/**`
  - 使用：
    ```tsx
    import logo from '@assets/logo.svg';
    <img src={logo} alt="logo" />
    ```
- 原 `focalMeet/assets` → 迁移到 `public/assets`，营销页直接使用绝对路径 `/assets/...`

---

### 路由与布局

- `MarketingLayout`：官网页头/页脚、AOS 初始化，仅在营销站分支加载；内部 `Outlet` 渲染各营销页。
- `AppLayout`：应用区导航与容器；后续在这里放鉴权与全局状态 Provider。
- 路由文件：`src/router/index.tsx`；集中定义两棵路由树；严禁在页面内隐式 push 新路由定义。

导航约定
- 营销站内链：React Router 的 `<Link>`；同页 hash 滚动用浏览器原生 `hash` 或页面定位组件。
- 跨分支跳转（官网 → 应用）：使用命名路由常量，避免硬编码。

---

### 组件与代码风格

命名与结构
- 组件：帕斯卡命名（`MeetingDetail.tsx`）；只导出一个默认组件。
- 文件：页面用帕斯卡命名（`Home.tsx`），样式对应 `.module.scss` 或放入 `styles/pages/**`。
- 变量/函数命名必须具备语义；避免缩写（遵循“Clean Code”）。

可复用与分层
- 页面：只做数据装配与布局落位；逻辑与展示尽量拆到 `components/`。
- 通用组件：拆出 Props 接口、支持 className 透传、可选 size/variant。
- 动画与交互：优先在组件内部实现；营销站动效集中在营销布局或页面，不影响应用区。

类型与严格性
- TS：导出 API 明确类型；避免 `any`；组件 Props 必须有显式类型。
- 早返回、边界情况优先处理；避免过深嵌套。

---

### 性能与代码分割

- 路由级代码分割：营销页与应用页均可 `lazy()` 加载，首屏仅加载当前分支。
- 图片：优先使用现代格式（webp/avif），大图放 `public/assets`，必要时响应式多源。
- 第三方库：仅在需要的分支/页面初始化（如 AOS 在营销站）。

---

### 工具链与校验

- Lint：`npm run lint`（保持零警告为目标）
- 格式化（建议）：
  - 安装 Prettier 与 ESLint 集成，保存即格式化
- 提交规范（建议 Conventional Commits）：
  - `feat: ...`, `fix: ...`, `refactor: ...`, `style: ...`, `docs: ...`

---

### 开发流程（简要）

- 分支：`feat/*`、`fix/*`、`chore/*`
- M1：路由骨架 + `Home` 迁移、AOS 接入、资源归位
- M2：其余营销页迁移 + 行为重写（平滑滚动、FAQ、Pricing Toggle 等 → React 化）
- M3：应用区鉴权门卫与状态管理（按需）

---

### 后端集成（Backend Integration）

- 接口风格：优先 REST/JSON；跨语言（Node.js/Python）统一以 OpenAPI 规范作为契约来源。
- 类型与客户端生成（建议二选一）：
  - openapi-typescript：仅生成类型，手写轻量客户端
    - 命令：
      ```bash
      npx openapi-typescript http://localhost:8000/openapi.json -o src/types/api.d.ts
      ```
  - orval：基于 OpenAPI 生成类型+请求函数+React Query hooks
    - 配置 `orval.config.cjs` 后运行 `npx orval`
- 服务分层：
  - `src/services/http.ts`：封装 `fetch`/`axios`，统一 baseURL、超时、错误归一化、拦截器（附带请求 ID）。
  - `src/services/api/*`：按业务域（auth、meetings、files...）组织的 API 调用；消费生成的类型。
  - 状态与缓存：建议引入 `@tanstack/react-query` 管理请求缓存、重试、并发与失效策略。
- 会话策略：
  - 首选 httpOnly Cookie（SameSite=Lax/Strict），避免在 `localStorage` 存 JWT。
  - 若使用 Cookie Session，配合 CSRF（双提交 Cookie 或 Same Origin）。
- 跨域与网关：
  - 开发期通过 Vite 代理 `/api`（见“环境与配置”）；生产期通过 Nginx/API 网关同源反代，尽量避免 CORS。

---

### 环境与配置（Environments & Config）

- 环境变量：使用 `.env.*` 注入 `VITE_*` 变量；至少包含：
  - `VITE_API_BASE_URL`：API 基地址（默认为 `/api`）。
  - `VITE_I18N_DEFAULT_LANG`、`VITE_I18N_SUPPORTED`：i18n 默认语言与支持列表（可选）。
- Vite 代理（开发环境）：
  ```ts
  // vite.config.ts
  export default defineConfig({
    plugins: [react()],
    server: {
      proxy: {
        '/api': { target: 'http://localhost:8000', changeOrigin: true, secure: false },
      },
    },
  });
  ```
- 读取配置：
  ```ts
  const apiBase = import.meta.env.VITE_API_BASE_URL ?? '/api';
  ```

---

### 错误处理与可观测性（Error Handling & Observability）

- 错误归一化：HTTP 层将响应标准化为 `{ code, message, details }`，组件只处理语义化错误。
- 重试策略：仅对幂等 GET 进行指数退避重试；非幂等请求禁用自动重试。
- 全局处理：
  - React Error Boundary 捕获渲染错误，展示降级 UI。
  - 统一 Toast/通知组件反馈请求错误。
- 监控（可选）：Sentry/LogRocket 前端埋点；上报 `requestId`/`traceId` 关联后端日志。

---

### 国际化（i18n）

- 库选型：`i18next` + `react-i18next` + `i18next-browser-languagedetector`。
- 资源组织：
  ```
  public/locales/
    en/
      common.json
      marketing.json
      app.json
    zh/
      common.json
      marketing.json
      app.json
  ```
- 命名空间：`common`（通用）、`marketing`（官网）、`app`（应用）。按路由/页面懒加载命名空间。
- 初始化示例：
  ```ts
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      fallbackLng: 'en',
      supportedLngs: ['en', 'zh'],
      ns: ['common', 'marketing', 'app'],
      defaultNS: 'common',
      backend: { loadPath: '/locales/{{lng}}/{{ns}}.json' },
      interpolation: { escapeValue: false },
    });
  ```
- 语言优先级：URL 前缀（如 `/en/...`）> 用户设置（cookie/localStorage）> 浏览器语言。
- SEO（营销站）：多语言路由前缀、`<html lang>` 与 `hreflang`、多语言 sitemap、按语言注入 meta/OG。
- 文本规范：避免句子拼接；使用参数化占位符 `t('key', { name })`；日期/货币等用 `Intl`。

---

### SEO 与营销站（Multi‑locale SEO）

- 布局层根据当前语言设置 `<html lang>`，并注入 `<link rel="alternate" hreflang="...">`。
- 为各语言生成 sitemap 与 canonical；营销页标题/描述/OG 文案走 i18n 资源。
- 图片与静态资源可配合 `public/assets` 指纹/缓存策略提升首屏表现。

---

### 部署与 CI/CD（Deployment）

- 产物：前端静态文件（Vite 构建）+ 反向代理 `/api` 到后端（Node/Python 任一）。
- 多环境：`staging`/`production` 使用不同 `.env`；CI 在构建阶段注入 `VITE_*`。
- 缓存：`public/locales` 与 `public/assets` 设置长缓存；HTML/entry 短缓存；必要时使用文件指纹或版本查询串。
- 健康检查：前端提供 `/healthz` 静态页（可选）；后端按各自框架规范。

---

### 目录结构补充（新增建议）

- `src/services/`：HTTP 封装与各业务域 API 客户端。
- `src/i18n/`：i18n 初始化、typed hooks、语言工具。
- `public/locales/**`：多语言资源文件。

---

### 工具与依赖补充（建议）

- `@tanstack/react-query`：请求缓存与状态管理。
- `openapi-typescript` 或 `orval`：基于 OpenAPI 生成类型/客户端。
- `react-i18next`、`i18next-browser-languagedetector`：多语言支持。

---

### 性能与代码分割（补充）

- i18n 资源按语言与命名空间懒加载；营销与应用路由分支使用 `lazy()` 与 `Suspense`。
- 仅在营销分支初始化 AOS；避免对应用区造成体积与运行时开销。
```

```markdown
## 项目架构与开发规范（Focal Meet Monorepo 内的前端）

本文件定义 `focal-meet` 的目录结构、路由分层、资源组织、样式体系（基于 SCSS 的主题能力）、代码风格与协作规范，便于团队一致性开发与后续扩展。

### 目标与边界
- 将“官网（营销站）”与“应用（登录后）”统一到一个 React 工程内，采用路由分树管理。
- 样式从当前 Tailwind 基础上引入 SCSS，统一变量与主题机制；短期内可“共存，逐步替换”，长期可平衡两者使用。
- 静态资源统一管理，清晰区分“打包资源与直链资源”。

### 技术栈
- 构建：Vite + React + TypeScript
- 路由：react-router-dom
- 动效：AOS（仅营销站路由初始化）
- 样式：SCSS（支持主题切换）；Tailwind 作为过渡/补充
- 代码规范：ESLint（已配），建议加 Prettier（可选）

---

### 目录结构

- `src/`
  - `views/`（页面层）
    - `marketing/`（官网各页面：`Home`, `About`, `Features`, `Pricing`, `Blog`）
    - `app/`（应用内页面：`Login`, `Dashboard`, `MeetingDetail`）
  - `components/`（通用 UI 组件与表单，如 `AuthForm`）
  - `layouts/`（`MarketingLayout`, `AppLayout`）
  - `router/`（路由入口与守卫）
  - `styles/`（全局 SCSS 架构，详见“样式与主题”）
  - `assets/`（组件内 import 的打包资源：小图、icons、局部 SVG）
- `public/`
  - `assets/`（官网直链图片、视频、favicon、OG 图等）
- 路径别名（统一在 `tsconfig.json` 与 `vite.config.ts`）：
  - `@views`, `@components`, `@layouts`, `@router`, `@styles`, `@assets`

路由分树（示例）：
- 营销站（公开）：`/`, `/about`, `/features`, `/pricing`, `/blog`, `/blog/:slug`
- 应用区：`/app/login`, `/app/dashboard`, `/app/meetings/:id`（后续加鉴权）

---

### 样式与主题（SCSS 方案）

安装
```bash
npm i -D sass
```

组织（基于 7-1 改良结构）
- `src/styles/`
  - `abstracts/`（纯逻辑：不产出 CSS）
    - `_variables.scss`（主题色、间距、字体、ZIndex、阴影、radius）
    - `_mixins.scss`（响应式、文本截断、渐变、主题 Helper）
    - `_functions.scss`（颜色计算等）
    - `_placeholders.scss`（占位选择器）
    - `_breakpoints.scss`（断点常量与 mixin）
  - `base/`
    - `_reset.scss` 或 `_normalize.scss`
    - `_typography.scss`
    - `_globals.scss`（应用全局基础层）
  - `layout/`（`_header.scss`, `_footer.scss`, `_grid.scss`）
  - `components/`（通用组件样式，例如 `_button.scss`, `_card.scss`）
  - `pages/`（单页样式，避免泄漏：营销站页面建议加 `.marketing` 根容器命名空间）
  - `themes/`（主题覆盖：`_light.scss`, `_dark.scss`）
  - `utilities/`（工具类）
  - `index.scss`（唯一入口，按顺序聚合以上文件）

入口引入（建议在 `src/main.tsx` 或布局内）
```ts
import '@styles/index.scss';
```

主题机制（CSS 变量 + SCSS 变量双层）
- 用 SCSS 变量集中定义基础色系，再编译为 CSS 变量，运行时通过切换 `data-theme` 覆盖。
- 优点：设计/实现分离；运行时可切换主题；组件局部也可使用 `var(--token)`。

示例：`_variables.scss`
```scss
// SCSS 基础变量
$color-primary: #ff6b6b;
$color-accent: #4ecdc4;
$color-bg: #111111;
$color-fg: #ffffff;

// 尺寸与节奏
$radius-md: 12px;
$space-4: 16px;

// 导出为 CSS 变量（默认 light）
:root {
  --color-primary: #{$color-primary};
  --color-accent: #{$color-accent};
  --color-bg: #{$color-bg};
  --color-fg: #{$color-fg};

  --radius-md: #{$radius-md};
  --space-4: #{$space-4};
}

// 暗色主题覆盖
[data-theme="dark"] {
  --color-bg: #0d0d0d;
  --color-fg: #eaeaea;
  // 可根据需要覆盖 primary、accent 等
}
```

组件/页面使用（推荐 CSS Modules 或命名空间）
- 应用内组件：`Component.module.scss`（样式隔离）
- 营销站页面：在 `MarketingLayout` 外层加 `.marketing`，对应 SCSS 以 `.marketing .xxx` 开头，避免影响应用区

示例组件样式与使用
```scss
/* src/components/Button.module.scss */
.button {
  padding: var(--space-4) calc(var(--space-4) * 1.5);
  border-radius: var(--radius-md);
  color: var(--color-fg);
  background: linear-gradient(135deg, var(--color-primary), #ff5252);
}
```

```tsx
import styles from './Button.module.scss';

export default function Button(props) {
  return <button className={styles.button} {...props} />;
}
```

响应式断点与混入：`_breakpoints.scss`
```scss
$bp-sm: 640px;
$bp-md: 768px;
$bp-lg: 1024px;

@mixin up($bp) { @media (min-width: $bp) { @content; } }
@mixin down($bp) { @media (max-width: $bp) { @content; } }
```

Tailwind 共存策略（过渡期）
- 允许在营销页先复用现有 CSS（迁移自 `style.css`）并逐步 SCSS 化。
- 应用区优先使用 SCSS Modules。Tailwind 仅作为快速布局补充或清理后逐步减少。

主题切换
```ts
// 切换主题：在任意入口
document.documentElement.setAttribute('data-theme', 'dark'); // or 'light'
```

---

### 静态资源规范

- 直链资源（不参与打包，CDN/SEO/OG 友好）
  - 路径：`public/assets/**`
  - 访问：`/assets/xxx.png`
  - 用于：官网图像、视频、favicon、OG 图、下载文件等
- 打包资源（参与 Tree-Shaking、指纹化）
  - 路径：`src/assets/**`
  - 使用：
    ```tsx
    import logo from '@assets/logo.svg';
    <img src={logo} alt="logo" />
    ```
- 原 `focalMeet/assets` → 迁移到 `public/assets`，营销页直接使用绝对路径 `/assets/...`

---

### 路由与布局

- `MarketingLayout`：官网页头/页脚、AOS 初始化，仅在营销站分支加载；内部 `Outlet` 渲染各营销页。
- `AppLayout`：应用区导航与容器；后续在这里放鉴权与全局状态 Provider。
- 路由文件：`src/router/index.tsx`；集中定义两棵路由树；严禁在页面内隐式 push 新路由定义。

导航约定
- 营销站内链：React Router 的 `<Link>`；同页 hash 滚动用浏览器原生 `hash` 或页面定位组件。
- 跨分支跳转（官网 → 应用）：使用命名路由常量，避免硬编码。

---

### 组件与代码风格

命名与结构
- 组件：帕斯卡命名（`MeetingDetail.tsx`）；只导出一个默认组件。
- 文件：页面用帕斯卡命名（`Home.tsx`），样式对应 `.module.scss` 或放入 `styles/pages/**`。
- 变量/函数命名必须具备语义；避免缩写（遵循“Clean Code”）。

可复用与分层
- 页面：只做数据装配与布局落位；逻辑与展示尽量拆到 `components/`。
- 通用组件：拆出 Props 接口、支持 className 透传、可选 size/variant。
- 动画与交互：优先在组件内部实现；营销站动效集中在营销布局或页面，不影响应用区。

类型与严格性
- TS：导出 API 明确类型；避免 `any`；组件 Props 必须有显式类型。
- 早返回、边界情况优先处理；避免过深嵌套。

---

### 性能与代码分割

- 路由级代码分割：营销页与应用页均可 `lazy()` 加载，首屏仅加载当前分支。
- 图片：优先使用现代格式（webp/avif），大图放 `public/assets`，必要时响应式多源。
- 第三方库：仅在需要的分支/页面初始化（如 AOS 在营销站）。

---

### 工具链与校验

- Lint：`npm run lint`（保持零警告为目标）
- 格式化（建议）：
  - 安装 Prettier 与 ESLint 集成，保存即格式化
- 提交规范（建议 Conventional Commits）：
  - `feat: ...`, `fix: ...`, `refactor: ...`, `style: ...`, `docs: ...`

---

### 开发流程（简要）

- 分支：`feat/*`、`fix/*`、`chore/*`
- M1：路由骨架 + `Home` 迁移、AOS 接入、资源归位
- M2：其余营销页迁移 + 行为重写（平滑滚动、FAQ、Pricing Toggle 等 → React 化）
- M3：应用区鉴权门卫与状态管理（按需）

---

### 后端集成（Backend Integration）

- 接口风格：优先 REST/JSON；跨语言（Node.js/Python）统一以 OpenAPI 规范作为契约来源。
- 类型与客户端生成（建议二选一）：
  - openapi-typescript：仅生成类型，手写轻量客户端
    - 命令：
      ```bash
      npx openapi-typescript http://localhost:8000/openapi.json -o src/types/api.d.ts
      ```
  - orval：基于 OpenAPI 生成类型+请求函数+React Query hooks
    - 配置 `orval.config.cjs` 后运行 `npx orval`
- 服务分层：
  - `src/services/http.ts`：封装 `fetch`/`axios`，统一 baseURL、超时、错误归一化、拦截器（附带请求 ID）。
  - `src/services/api/*`：按业务域（auth、meetings、files...）组织的 API 调用；消费生成的类型。
  - 状态与缓存：建议引入 `@tanstack/react-query` 管理请求缓存、重试、并发与失效策略。
- 会话策略：
  - 首选 httpOnly Cookie（SameSite=Lax/Strict），避免在 `localStorage` 存 JWT。
  - 若使用 Cookie Session，配合 CSRF（双提交 Cookie 或 Same Origin）。
- 跨域与网关：
  - 开发期通过 Vite 代理 `/api`（见“环境与配置”）；生产期通过 Nginx/API 网关同源反代，尽量避免 CORS。

---

### 环境与配置（Environments & Config）

- 环境变量：使用 `.env.*` 注入 `VITE_*` 变量；至少包含：
  - `VITE_API_BASE_URL`：API 基地址（默认为 `/api`）。
  - `VITE_I18N_DEFAULT_LANG`、`VITE_I18N_SUPPORTED`：i18n 默认语言与支持列表（可选）。
- Vite 代理（开发环境）：
  ```ts
  // vite.config.ts
  export default defineConfig({
    plugins: [react()],
    server: {
      proxy: {
        '/api': { target: 'http://localhost:8000', changeOrigin: true, secure: false },
      },
    },
  });
  ```
- 读取配置：
  ```ts
  const apiBase = import.meta.env.VITE_API_BASE_URL ?? '/api';
  ```

---

### 错误处理与可观测性（Error Handling & Observability）

- 错误归一化：HTTP 层将响应标准化为 `{ code, message, details }`，组件只处理语义化错误。
- 重试策略：仅对幂等 GET 进行指数退避重试；非幂等请求禁用自动重试。
- 全局处理：
  - React Error Boundary 捕获渲染错误，展示降级 UI。
  - 统一 Toast/通知组件反馈请求错误。
- 监控（可选）：Sentry/LogRocket 前端埋点；上报 `requestId`/`traceId` 关联后端日志。

---

### 国际化（i18n）

- 库选型：`i18next` + `react-i18next` + `i18next-browser-languagedetector`。
- 资源组织：
  ```text
  public/locales/
    en/
      common.json
      marketing.json
      app.json
    zh/
      common.json
      marketing.json
      app.json
  ```
- 命名空间：`common`（通用）、`marketing`（官网）、`app`（应用）。按路由/页面懒加载命名空间。
- 初始化示例：
  ```ts
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      fallbackLng: 'en',
      supportedLngs: ['en', 'zh'],
      ns: ['common', 'marketing', 'app'],
      defaultNS: 'common',
      backend: { loadPath: '/locales/{{lng}}/{{ns}}.json' },
      interpolation: { escapeValue: false },
    });
  ```
- 语言优先级：URL 前缀（如 `/en/...`）> 用户设置（cookie/localStorage）> 浏览器语言。
- SEO（营销站）：多语言路由前缀、`<html lang>` 与 `hreflang`、多语言 sitemap、按语言注入 meta/OG。
- 文本规范：避免句子拼接；使用参数化占位符 `t('key', { name })`；日期/货币等用 `Intl`。

---

### SEO 与营销站（Multi‑locale SEO）

- 布局层根据当前语言设置 `<html lang>`，并注入 `<link rel="alternate" hreflang="...">`。
- 为各语言生成 sitemap 与 canonical；营销页标题/描述/OG 文案走 i18n 资源。
- 图片与静态资源可配合 `public/assets` 指纹/缓存策略提升首屏表现。

---

### 部署与 CI/CD（Deployment）

- 产物：前端静态文件（Vite 构建）+ 反向代理 `/api` 到后端（Node/Python 任一）。
- 多环境：`staging`/`production` 使用不同 `.env`；CI 在构建阶段注入 `VITE_*`。
- 缓存：`public/locales` 与 `public/assets` 设置长缓存；HTML/entry 短缓存；必要时使用文件指纹或版本查询串。
- 健康检查：前端提供 `/healthz` 静态页（可选）；后端按各自框架规范。

---

### 目录结构补充（新增建议）

- `src/services/`：HTTP 封装与各业务域 API 客户端。
- `src/i18n/`：i18n 初始化、typed hooks、语言工具。
- `public/locales/**`：多语言资源文件。

---

### 工具与依赖补充（建议）

- `@tanstack/react-query`：请求缓存与状态管理。
- `openapi-typescript` 或 `orval`：基于 OpenAPI 生成类型/客户端。
- `react-i18next`、`i18next-browser-languagedetector`：多语言支持。

---

### 性能与代码分割（补充）

- i18n 资源按语言与命名空间懒加载；营销与应用路由分支使用 `lazy()` 与 `Suspense`。
- 仅在营销分支初始化 AOS；避免对应用区造成体积与运行时开销。
```

```markdown
## 项目架构与开发规范（Focal Meet Monorepo 内的前端）

本文件定义 `focal-meet` 的目录结构、路由分层、资源组织、样式体系（基于 SCSS 的主题能力）、代码风格与协作规范，便于团队一致性开发与后续扩展。

### 目标与边界
- 将“官网（营销站）”与“应用（登录后）”统一到一个 React 工程内，采用路由分树管理。
- 样式从当前 Tailwind 基础上引入 SCSS，统一变量与主题机制；短期内可“共存，逐步替换”，长期可平衡两者使用。
- 静态资源统一管理，清晰区分“打包资源与直链资源”。

### 技术栈
- 构建：Vite + React + TypeScript
- 路由：react-router-dom
- 动效：AOS（仅营销站路由初始化）
- 样式：SCSS（支持主题切换）；Tailwind 作为过渡/补充
- 代码规范：ESLint（已配），建议加 Prettier（可选）

---

### 目录结构

- `src/`
  - `views/`（页面层）
    - `marketing/`（官网各页面：`Home`, `About`, `Features`, `Pricing`, `Blog`）
    - `app/`（应用内页面：`Login`, `Dashboard`, `MeetingDetail`）
  - `components/`（通用 UI 组件与表单，如 `AuthForm`）
  - `layouts/`（`MarketingLayout`, `AppLayout`）
  - `router/`（路由入口与守卫）
  - `styles/`（全局 SCSS 架构，详见“样式与主题”）
  - `assets/`（组件内 import 的打包资源：小图、icons、局部 SVG）
- `public/`
  - `assets/`（官网直链图片、视频、favicon、OG 图等）
- 路径别名（统一在 `tsconfig.json` 与 `vite.config.ts`）：
  - `@views`, `@components`, `@layouts`, `@router`, `@styles`, `@assets`

路由分树（示例）：
- 营销站（公开）：`/`, `/about`, `/features`, `/pricing`, `/blog`, `/blog/:slug`
- 应用区：`/app/login`, `/app/dashboard`, `/app/meetings/:id`（后续加鉴权）

---

### 样式与主题（SCSS 方案）

安装
```bash
npm i -D sass
```

组织（基于 7-1 改良结构）
- `src/styles/`
  - `abstracts/`（纯逻辑：不产出 CSS）
    - `_variables.scss`（主题色、间距、字体、ZIndex、阴影、radius）
    - `_mixins.scss`（响应式、文本截断、渐变、主题 Helper）
    - `_functions.scss`（颜色计算等）
    - `_placeholders.scss`（占位选择器）
    - `_breakpoints.scss`（断点常量与 mixin）
  - `base/`
    - `_reset.scss` 或 `_normalize.scss`
    - `_typography.scss`
    - `_globals.scss`（应用全局基础层）
  - `layout/`（`_header.scss`, `_footer.scss`, `_grid.scss`）
  - `components/`（通用组件样式，例如 `_button.scss`, `_card.scss`）
  - `pages/`（单页样式，避免泄漏：营销站页面建议加 `.marketing` 根容器命名空间）
  - `themes/`（主题覆盖：`_light.scss`, `_dark.scss`）
  - `utilities/`（工具类）
  - `index.scss`（唯一入口，按顺序聚合以上文件）

入口引入（建议在 `src/main.tsx` 或布局内）
```ts
import '@styles/index.scss';
```

主题机制（CSS 变量 + SCSS 变量双层）
- 用 SCSS 变量集中定义基础色系，再编译为 CSS 变量，运行时通过切换 `data-theme` 覆盖。
- 优点：设计/实现分离；运行时可切换主题；组件局部也可使用 `var(--token)`。

示例：`_variables.scss`
```scss
// SCSS 基础变量
$color-primary: #ff6b6b;
$color-accent: #4ecdc4;
$color-bg: #111111;
$color-fg: #ffffff;

// 尺寸与节奏
$radius-md: 12px;
$space-4: 16px;

// 导出为 CSS 变量（默认 light）
:root {
  --color-primary: #{$color-primary};
  --color-accent: #{$color-accent};
  --color-bg: #{$color-bg};
  --color-fg: #{$color-fg};

  --radius-md: #{$radius-md};
  --space-4: #{$space-4};
}

// 暗色主题覆盖
[data-theme="dark"] {
  --color-bg: #0d0d0d;
  --color-fg: #eaeaea;
  // 可根据需要覆盖 primary、accent 等
}
```

组件/页面使用（推荐 CSS Modules 或命名空间）
- 应用内组件：`Component.module.scss`（样式隔离）
- 营销站页面：在 `MarketingLayout` 外层加 `.marketing`，对应 SCSS 以 `.marketing .xxx` 开头，避免影响应用区

示例组件样式与使用
```scss
/* src/components/Button.module.scss */
.button {
  padding: var(--space-4) calc(var(--space-4) * 1.5);
  border-radius: var(--radius-md);
  color: var(--color-fg);
  background: linear-gradient(135deg, var(--color-primary), #ff5252);
}
```

```tsx
import styles from './Button.module.scss';

export default function Button(props) {
  return <button className={styles.button} {...props} />;
}
```

响应式断点与混入：`_breakpoints.scss`
```scss
$bp-sm: 640px;
$bp-md: 768px;
$bp-lg: 1024px;

@mixin up($bp) { @media (min-width: $bp) { @content; } }
@mixin down($bp) { @media (max-width: $bp) { @content; } }
```

Tailwind 共存策略（过渡期）
- 允许在营销页先复用现有 CSS（迁移自 `style.css`）并逐步 SCSS 化。
- 应用区优先使用 SCSS Modules。Tailwind 仅作为快速布局补充或清理后逐步减少。

主题切换
```ts
// 切换主题：在任意入口
document.documentElement.setAttribute('data-theme', 'dark'); // or 'light'
```

---

### 静态资源规范

- 直链资源（不参与打包，CDN/SEO/OG 友好）
  - 路径：`public/assets/**`
  - 访问：`/assets/xxx.png`
  - 用于：官网图像、视频、favicon、OG 图、下载文件等
- 打包资源（参与 Tree-Shaking、指纹化）
  - 路径：`src/assets/**`
  - 使用：
    ```tsx
    import logo from '@assets/logo.svg';
    <img src={logo} alt="logo" />
    ```
- 原 `focalMeet/assets` → 迁移到 `public/assets`，营销页直接使用绝对路径 `/assets/...`

---

### 路由与布局

- `MarketingLayout`：官网页头/页脚、AOS 初始化，仅在营销站分支加载；内部 `Outlet` 渲染各营销页。
- `AppLayout`：应用区导航与容器；后续在这里放鉴权与全局状态 Provider。
- 路由文件：`src/router/index.tsx`；集中定义两棵路由树；严禁在页面内隐式 push 新路由定义。

导航约定
- 营销站内链：React Router 的 `<Link>`；同页 hash 滚动用浏览器原生 `hash` 或页面定位组件。
- 跨分支跳转（官网 → 应用）：使用命名路由常量，避免硬编码。

---

### 组件与代码风格

命名与结构
- 组件：帕斯卡命名（`MeetingDetail.tsx`）；只导出一个默认组件。
- 文件：页面用帕斯卡命名（`Home.tsx`），样式对应 `.module.scss` 或放入 `styles/pages/**`。
- 变量/函数命名必须具备语义；避免缩写（遵循“Clean Code”）。

可复用与分层
- 页面：只做数据装配与布局落位；逻辑与展示尽量拆到 `components/`。
- 通用组件：拆出 Props 接口、支持 className 透传、可选 size/variant。
- 动画与交互：优先在组件内部实现；营销站动效集中在营销布局或页面，不影响应用区。

类型与严格性
- TS：导出 API 明确类型；避免 `any`；组件 Props 必须有显式类型。
- 早返回、边界情况优先处理；避免过深嵌套。

---

### 性能与代码分割

- 路由级代码分割：营销页与应用页均可 `lazy()` 加载，首屏仅加载当前分支。
- 图片：优先使用现代格式（webp/avif），大图放 `public/assets`，必要时响应式多源。
- 第三方库：仅在需要的分支/页面初始化（如 AOS 在营销站）。

---

### 工具链与校验

- Lint：`npm run lint`（保持零警告为目标）
- 格式化（建议）：
  - 安装 Prettier 与 ESLint 集成，保存即格式化
- 提交规范（建议 Conventional Commits）：
  - `feat: ...`, `fix: ...`, `refactor: ...`, `style: ...`, `docs: ...`

---

### 开发流程（简要）

- 分支：`feat/*`、`fix/*`、`chore/*`
- M1：路由骨架 + `Home` 迁移、AOS 接入、资源归位
- M2：其余营销页迁移 + 行为重写（平滑滚动、FAQ、Pricing Toggle 等 → React 化）
- M3：应用区鉴权门卫与状态管理（按需）

---

### 后端集成（Backend Integration）

- 接口风格：优先 REST/JSON；跨语言（Node.js/Python）统一以 OpenAPI 规范作为契约来源。
- 类型与客户端生成（建议二选一）：
  - openapi-typescript：仅生成类型，手写轻量客户端
    - 命令：
      ```bash
      npx openapi-typescript http://localhost:8000/openapi.json -o src/types/api.d.ts
      ```
  - orval：基于 OpenAPI 生成类型+请求函数+React Query hooks
    - 配置 `orval.config.cjs` 后运行 `npx orval`
- 服务分层：
  - `src/services/http.ts`：封装 `fetch`/`axios`，统一 baseURL、超时、错误归一化、拦截器（附带请求 ID）。
  - `src/services/api/*`：按业务域（auth、meetings、files...）组织的 API 调用；消费生成的类型。
  - 状态与缓存：建议引入 `@tanstack/react-query` 管理请求缓存、重试、并发与失效策略。
- 会话策略：
  - 首选 httpOnly Cookie（SameSite=Lax/Strict），避免在 `localStorage` 存 JWT。
  - 若使用 Cookie Session，配合 CSRF（双提交 Cookie 或 Same Origin）。
- 跨域与网关：
  - 开发期通过 Vite 代理 `/api`（见“环境与配置”）；生产期通过 Nginx/API 网关同源反代，尽量避免 CORS。

---

### 环境与配置（Environments & Config）

- 环境变量：使用 `.env.*` 注入 `VITE_*` 变量；至少包含：
  - `VITE_API_BASE_URL`：API 基地址（默认为 `/api`）。
  - `VITE_I18N_DEFAULT_LANG`、`VITE_I18N_SUPPORTED`：i18n 默认语言与支持列表（可选）。
- Vite 代理（开发环境）：
  ```ts
  // vite.config.ts
  export default defineConfig({
    plugins: [react()],
    server: {
      proxy: {
        '/api': { target: 'http://localhost:8000', changeOrigin: true, secure: false },
      },
    },
  });
  ```
- 读取配置：
  ```ts
  const apiBase = import.meta.env.VITE_API_BASE_URL ?? '/api';
  ```

---

### 错误处理与可观测性（Error Handling & Observability）

- 错误归一化：HTTP 层将响应标准化为 `{ code, message, details }`，组件只处理语义化错误。
- 重试策略：仅对幂等 GET 进行指数退避重试；非幂等请求禁用自动重试。
- 全局处理：
  - React Error Boundary 捕获渲染错误，展示降级 UI。
  - 统一 Toast/通知组件反馈请求错误。
- 监控（可选）：Sentry/LogRocket 前端埋点；上报 `requestId`/`traceId` 关联后端日志。

---

### 国际化（i18n）

- 库选型：`i18next` + `react-i18next` + `i18next-browser-languagedetector`。
- 资源组织：
  ```text
  public/locales/
    en/
      common.json
      marketing.json
      app.json
    zh/
      common.json
      marketing.json
      app.json
  ```
- 命名空间：`common`（通用）、`marketing`（官网）、`app`（应用）。按路由/页面懒加载命名空间。
- 初始化示例：
  ```ts
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      fallbackLng: 'en',
      supportedLngs: ['en', 'zh'],
      ns: ['common', 'marketing', 'app'],
      defaultNS: 'common',
      backend: { loadPath: '/locales/{{lng}}/{{ns}}.json' },
      interpolation: { escapeValue: false },
    });
  ```
- 语言优先级：URL 前缀（如 `/en/...`）> 用户设置（cookie/localStorage）> 浏览器语言。
- SEO（营销站）：多语言路由前缀、`<html lang>` 与 `hreflang`、多语言 sitemap、按语言注入 meta/OG。
- 文本规范：避免句子拼接；使用参数化占位符 `t('key', { name })`；日期/货币等用 `Intl`。

---

### SEO 与营销站（Multi‑locale SEO）

- 布局层根据当前语言设置 `<html lang>`，并注入 `<link rel="alternate" hreflang="...">`。
- 为各语言生成 sitemap 与 canonical；营销页标题/描述/OG 文案走 i18n 资源。
- 图片与静态资源可配合 `public/assets` 指纹/缓存策略提升首屏表现。

---

### 部署与 CI/CD（Deployment）

- 产物：前端静态文件（Vite 构建）+ 反向代理 `/api` 到后端（Node/Python 任一）。
- 多环境：`staging`/`production` 使用不同 `.env`；CI 在构建阶段注入 `VITE_*`。
- 缓存：`public/locales` 与 `public/assets` 设置长缓存；HTML/entry 短缓存；必要时使用文件指纹或版本查询串。
- 健康检查：前端提供 `/healthz` 静态页（可选）；后端按各自框架规范。

---

### 目录结构补充（新增建议）

- `src/services/`：HTTP 封装与各业务域 API 客户端。
- `src/i18n/`：i18n 初始化、typed hooks、语言工具。
- `public/locales/**`：多语言资源文件。

---

### 状态管理（Stores）

- 选型：推荐 `@tanstack/react-query` 处理服务端数据的缓存、请求生命周期与失效；对“纯前端局部状态/跨页轻量共享状态”，优先使用 React Context + 自定义 hooks；若存在复杂全局状态（如跨页面协作、实时会话、权限角色矩阵），可再评估引入轻量库（如 Zustand）但需审慎。
- 目录：
  - `src/stores/`：纯前端状态（主题、侧边栏开合、定价币种选择等）；
  - `src/services/api/**` + React Query：服务端数据（鉴权信息、会议列表、会议详情、文件列表等）。
- 规范：
  - Store 命名以业务域区分：`themeStore.ts`, `uiStore.ts`, `pricingStore.ts`；导出 typed hooks：`useThemeStore()`；
  - 避免在 Store 中直接发起网络请求；服务端数据统一走 `services/api` + React Query；
  - 服务端数据若需与本地 Store 协作，保持单一事实来源（以 React Query 为准），Store 仅存放 UI 衍生状态或用户偏好；
  - SSR/同构（若后来引入）需保证初始状态可注水与可再水化。


---

### 工具与依赖补充（建议）

- `@tanstack/react-query`：请求缓存与状态管理。
- `openapi-typescript` 或 `orval`：基于 OpenAPI 生成类型/客户端。
- `react-i18next`、`i18next-browser-languagedetector`：多语言支持。

---

### 性能与代码分割（补充）

- i18n 资源按语言与命名空间懒加载；营销与应用路由分支使用 `lazy()` 与 `Suspense`。
- 仅在营销分支初始化 AOS；避免对应用区造成体积与运行时开销。
```

```markdown
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

- 业务域 API：`src/services/api/{auth,meetings,files}.ts`，消费生成类型。
- 引入 React Query（可选但推荐）：
- Stores 约定与落地：
  - 目录：`src/stores/**` 存放纯前端跨页/全局 UI 状态（如主题、侧边栏开合、定价币种等）。
  - 原则：服务端数据以 React Query 为单一事实来源，Store 不直接发请求，仅持本地 UI 衍生状态与用户偏好。
  - 示例：`themeStore.ts`、`uiStore.ts`、`pricingStore.ts`，导出 typed hooks（如 `useThemeStore()`）。


```bash
npm i @tanstack/react-query
```

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

```

```markdown
<<'PATCH'
*** Begin Patch
*** Update File: focal-meet/docs/migration-plan.md
@@
 ### 验收清单（按阶段）
 
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
+  - [ ] Stores 落地：`src/stores/**` 目录建立，核心 UI 偏好（主题/侧边栏/定价币种）可持久化（localStorage 或 cookie），并与 React Query 职责边界清晰。
   - [ ] i18n 可按语言切换；SEO 标签正确；构建与部署可用。
*** End Patch
PATCH
```

```markdown
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

- 业务域 API：`src/services/api/{auth,meetings,files}.ts`，消费生成类型。
- 引入 React Query（可选但推荐）：
- Stores 约定与落地：
  - 目录：`src/stores/**` 存放纯前端跨页/全局 UI 状态（如主题、侧边栏开合、定价币种等）。
  - 原则：服务端数据以 React Query 为单一事实来源，Store 不直接发请求，仅持本地 UI 衍生状态与用户偏好。
  - 示例：`themeStore.ts`、`uiStore.ts`、`pricingStore.ts`，导出 typed hooks（如 `useThemeStore()`）。


```bash
npm i @tanstack/react-query
```

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

```

```markdown
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

```

```markdown
# 项目架构与开发规范（Focal Meet Monorepo 内的前端）

本文件定义 `focal-meet` 的目录结构、路由分层、资源组织、样式体系（基于 SCSS 的主题能力）、代码风格与协作规范，便于团队一致性开发与后续扩展。

## 目标与边界
- 将“官网（营销站）”与“应用（登录后）”统一到一个 React 工程内，采用路由分树管理。
- 样式从当前 Tailwind 基础上引入 SCSS，统一变量与主题机制；短期内可“共存，逐步替换”，长期可平衡两者使用。
- 静态资源统一管理，清晰区分“打包资源与直链资源”。

## 技术栈
- 构建：Vite + React + TypeScript
- 路由：react-router-dom
- 动效：AOS（仅营销站路由初始化）
- 样式：SCSS（支持主题切换）；Tailwind 作为过渡/补充
- 代码规范：ESLint（已配），建议加 Prettier（可选）

---

## 目录结构

- `src/`
  - `views/`（页面层）
    - `marketing/`（官网各页面：`Home`, `About`, `Features`, `Pricing`, `Blog`）
    - `app/`（应用内页面：`Login`, `Dashboard`, `MeetingDetail`）
  - `components/`（通用 UI 组件与表单，如 `AuthForm`）
  - `layouts/`（`MarketingLayout`, `AppLayout`）
  - `router/`（路由入口与守卫）
  - `styles/`（全局 SCSS 架构，详见“样式与主题”）
  - `assets/`（组件内 import 的打包资源：小图、icons、局部 SVG）
- `public/`
  - `assets/`（官网直链图片、视频、favicon、OG 图等）
- 路径别名（统一在 `tsconfig.json` 与 `vite.config.ts`）：
  - `@views`, `@components`, `@layouts`, `@router`, `@styles`, `@assets`

路由分树（示例）：
- 营销站（公开）：`/`, `/about`, `/features`, `/pricing`, `/blog`, `/blog/:slug`
- 应用区：`/app/login`, `/app/dashboard`, `/app/meetings/:id`（后续加鉴权）

---

## 样式与主题（SCSS 方案）

安装
```bash
npm i -D sass
```

组织（基于 7-1 改良结构）
- `src/styles/`
  - `abstracts/`（纯逻辑：不产出 CSS）
    - `_variables.scss`（主题色、间距、字体、ZIndex、阴影、radius）
    - `_mixins.scss`（响应式、文本截断、渐变、主题 Helper）
    - `_functions.scss`（颜色计算等）
    - `_placeholders.scss`（占位选择器）
    - `_breakpoints.scss`（断点常量与 mixin）
  - `base/`
    - `_reset.scss` 或 `_normalize.scss`
    - `_typography.scss`
    - `_globals.scss`（应用全局基础层）
  - `layout/`（`_header.scss`, `_footer.scss`, `_grid.scss`）
  - `components/`（通用组件样式，例如 `_button.scss`, `_card.scss`）
  - `pages/`（单页样式，避免泄漏：营销站页面建议加 `.marketing` 根容器命名空间）
  - `themes/`（主题覆盖：`_light.scss`, `_dark.scss`）
  - `utilities/`（工具类）
  - `index.scss`（唯一入口，按顺序聚合以上文件）

入口引入（建议在 `src/main.tsx` 或布局内）
```ts
import '@styles/index.scss';
```

主题机制（CSS 变量 + SCSS 变量双层）
- 用 SCSS 变量集中定义基础色系，再编译为 CSS 变量，运行时通过切换 `data-theme` 覆盖。
- 优点：设计/实现分离；运行时可切换主题；组件局部也可使用 `var(--token)`。

示例：`_variables.scss`
```scss
// SCSS 基础变量
$color-primary: #ff6b6b;
$color-accent: #4ecdc4;
$color-bg: #111111;
$color-fg: #ffffff;

// 尺寸与节奏
$radius-md: 12px;
$space-4: 16px;

// 导出为 CSS 变量（默认 light）
:root {
  --color-primary: #{$color-primary};
  --color-accent: #{$color-accent};
  --color-bg: #{$color-bg};
  --color-fg: #{$color-fg};

  --radius-md: #{$radius-md};
  --space-4: #{$space-4};
}

// 暗色主题覆盖
[data-theme="dark"] {
  --color-bg: #0d0d0d;
  --color-fg: #eaeaea;
  // 可根据需要覆盖 primary、accent 等
}
```

组件/页面使用（推荐 CSS Modules 或命名空间）
- 应用内组件：`Component.module.scss`（样式隔离）
- 营销站页面：在 `MarketingLayout` 外层加 `.marketing`，对应 SCSS 以 `.marketing .xxx` 开头，避免影响应用区

示例组件样式与使用
```scss
/* src/components/Button.module.scss */
.button {
  padding: var(--space-4) calc(var(--space-4) * 1.5);
  border-radius: var(--radius-md);
  color: var(--color-fg);
  background: linear-gradient(135deg, var(--color-primary), #ff5252);
}
```

```tsx
import styles from './Button.module.scss';

export default function Button(props) {
  return <button className={styles.button} {...props} />;
}
```

响应式断点与混入：`_breakpoints.scss`
```scss
$bp-sm: 640px;
$bp-md: 768px;
$bp-lg: 1024px;

@mixin up($bp) { @media (min-width: $bp) { @content; } }
@mixin down($bp) { @media (max-width: $bp) { @content; } }
```

Tailwind 共存策略（过渡期）
- 允许在营销页先复用现有 CSS（迁移自 `style.css`）并逐步 SCSS 化。
- 应用区优先使用 SCSS Modules。Tailwind 仅作为快速布局补充或清理后逐步减少。

主题切换
```ts
// 切换主题：在任意入口
document.documentElement.setAttribute('data-theme', 'dark'); // or 'light'
```

---

## 静态资源规范

- 直链资源（不参与打包，CDN/SEO/OG 友好）
  - 路径：`public/assets/**`
  - 访问：`/assets/xxx.png`
  - 用于：官网图像、视频、favicon、OG 图、下载文件等
- 打包资源（参与 Tree-Shaking、指纹化）
  - 路径：`src/assets/**`
  - 使用：
    ```tsx
    import logo from '@assets/logo.svg';
    <img src={logo} alt="logo" />
    ```
- 原 `focalMeet/assets` → 迁移到 `public/assets`，营销页直接使用绝对路径 `/assets/...`

---

## 路由与布局

- `MarketingLayout`：官网页头/页脚、AOS 初始化，仅在营销站分支加载；内部 `Outlet` 渲染各营销页。
- `AppLayout`：应用区导航与容器；后续在这里放鉴权与全局状态 Provider。
- 路由文件：`src/router/index.tsx`；集中定义两棵路由树；严禁在页面内隐式 push 新路由定义。

导航约定
- 营销站内链：React Router 的 `<Link>`；同页 hash 滚动用浏览器原生 `hash` 或页面定位组件。
- 跨分支跳转（官网 → 应用）：使用命名路由常量，避免硬编码。

---

## 组件与代码风格

命名与结构
- 组件：帕斯卡命名（`MeetingDetail.tsx`）；只导出一个默认组件。
- 文件：页面用帕斯卡命名（`Home.tsx`），样式对应 `.module.scss` 或放入 `styles/pages/**`。
- 变量/函数命名必须具备语义；避免缩写（遵循“Clean Code”）。

可复用与分层
- 页面：只做数据装配与布局落位；逻辑与展示尽量拆到 `components/`。
- 通用组件：拆出 Props 接口、支持 className 透传、可选 size/variant。
- 动画与交互：优先在组件内部实现；营销站动效集中在营销布局或页面，不影响应用区。

类型与严格性
- TS：导出 API 明确类型；避免 `any`；组件 Props 必须有显式类型。
- 早返回、边界情况优先处理；避免过深嵌套。

---

## 性能与代码分割

- 路由级代码分割：营销页与应用页均可 `lazy()` 加载，首屏仅加载当前分支。
- 图片：优先使用现代格式（webp/avif），大图放 `public/assets`，必要时响应式多源。
- 第三方库：仅在需要的分支/页面初始化（如 AOS 在营销站）。

---

## 工具链与校验

- Lint：`npm run lint`（保持零警告为目标）
- 格式化（建议）：
  - 安装 Prettier 与 ESLint 集成，保存即格式化
- 提交规范（建议 Conventional Commits）：
  - `feat: ...`, `fix: ...`, `refactor: ...`, `style: ...`, `docs: ...`

---

## 开发流程（简要）

- 分支：`feat/*`、`fix/*`、`chore/*`
- M1：路由骨架 + `Home` 迁移、AOS 接入、资源归位
- M2：其余营销页迁移 + 行为重写（平滑滚动、FAQ、Pricing Toggle 等 → React 化）
- M3：应用区鉴权门卫与状态管理（按需）

---

## 后端集成（Backend Integration）

- 接口风格：优先 REST/JSON；跨语言（Node.js/Python）统一以 OpenAPI 规范作为契约来源。
- 类型与客户端生成（建议二选一）：
  - openapi-typescript：仅生成类型，手写轻量客户端
    - 命令：
      ```bash
      npx openapi-typescript http://localhost:8000/openapi.json -o src/types/api.d.ts
      ```
  - orval：基于 OpenAPI 生成类型+请求函数+React Query hooks
    - 配置 `orval.config.cjs` 后运行 `npx orval`
- 服务分层：
  - `src/services/http.ts`：封装 `fetch`/`axios`，统一 baseURL、超时、错误归一化、拦截器（附带请求 ID）。
  - `src/services/api/*`：按业务域（auth、meetings、files...）组织的 API 调用；消费生成的类型。
  - 状态与缓存：建议引入 `@tanstack/react-query` 管理请求缓存、重试、并发与失效策略。
- 会话策略：
  - 首选 httpOnly Cookie（SameSite=Lax/Strict），避免在 `localStorage` 存 JWT。
  - 若使用 Cookie Session，配合 CSRF（双提交 Cookie 或 Same Origin）。
- 跨域与网关：
  - 开发期通过 Vite 代理 `/api`（见“环境与配置”）；生产期通过 Nginx/API 网关同源反代，尽量避免 CORS。

---

## 环境与配置（Environments & Config）

- 环境变量：使用 `.env.*` 注入 `VITE_*` 变量；至少包含：
  - `VITE_API_BASE_URL`：API 基地址（默认为 `/api`）。
  - `VITE_I18N_DEFAULT_LANG`、`VITE_I18N_SUPPORTED`：i18n 默认语言与支持列表（可选）。
- Vite 代理（开发环境）：
  ```ts
  // vite.config.ts
  export default defineConfig({
    plugins: [react()],
    server: {
      proxy: {
        '/api': { target: 'http://localhost:8000', changeOrigin: true, secure: false },
      },
    },
  });
  ```
- 读取配置：
  ```ts
  const apiBase = import.meta.env.VITE_API_BASE_URL ?? '/api';
  ```

---

## 错误处理与可观测性（Error Handling & Observability）

- 错误归一化：HTTP 层将响应标准化为 `{ code, message, details }`，组件只处理语义化错误。
- 重试策略：仅对幂等 GET 进行指数退避重试；非幂等请求禁用自动重试。
- 全局处理：
  - React Error Boundary 捕获渲染错误，展示降级 UI。
  - 统一 Toast/通知组件反馈请求错误。
- 监控（可选）：Sentry/LogRocket 前端埋点；上报 `requestId`/`traceId` 关联后端日志。

---

## 国际化（i18n）

- 库选型：`i18next` + `react-i18next` + `i18next-browser-languagedetector`。
- 资源组织：
  ```text
  public/locales/
    en/
      common.json
      marketing.json
      app.json
    zh/
      common.json
      marketing.json
      app.json
  ```
- 命名空间：`common`（通用）、`marketing`（官网）、`app`（应用）。按路由/页面懒加载命名空间。
- 初始化示例：
  ```ts
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      fallbackLng: 'en',
      supportedLngs: ['en', 'zh'],
      ns: ['common', 'marketing', 'app'],
      defaultNS: 'common',
      backend: { loadPath: '/locales/{{lng}}/{{ns}}.json' },
      interpolation: { escapeValue: false },
    });
  ```
- 语言优先级：URL 前缀（如 `/en/...`）> 用户设置（cookie/localStorage）> 浏览器语言。
- SEO（营销站）：多语言路由前缀、`<html lang>` 与 `hreflang`、多语言 sitemap、按语言注入 meta/OG。
- 文本规范：避免句子拼接；使用参数化占位符 `t('key', { name })`；日期/货币等用 `Intl`。

---

## SEO 与营销站（Multi‑locale SEO）

- 布局层根据当前语言设置 `<html lang>`，并注入 `<link rel="alternate" hreflang="...">`。
- 为各语言生成 sitemap 与 canonical；营销页标题/描述/OG 文案走 i18n 资源。
- 图片与静态资源可配合 `public/assets` 指纹/缓存策略提升首屏表现。

---

## 部署与 CI/CD（Deployment）

- 产物：前端静态文件（Vite 构建）+ 反向代理 `/api` 到后端（Node/Python 任一）。
- 多环境：`staging`/`production` 使用不同 `.env`；CI 在构建阶段注入 `VITE_*`。
- 缓存：`public/locales` 与 `public/assets` 设置长缓存；HTML/entry 短缓存；必要时使用文件指纹或版本查询串。
- 健康检查：前端提供 `/healthz` 静态页（可选）；后端按各自框架规范。

---

## 目录结构补充（新增建议）

- `src/services/`：HTTP 封装与各业务域 API 客户端。
- `src/i18n/`：i18n 初始化、typed hooks、语言工具。
- `public/locales/**`：多语言资源文件。

---

### 状态管理（Stores）

- 选型：推荐 `@tanstack/react-query` 处理服务端数据的缓存、请求生命周期与失效；对“纯前端局部状态/跨页轻量共享状态”，优先使用 React Context + 自定义 hooks；若存在复杂全局状态（如跨页面协作、实时会话、权限角色矩阵），可再评估引入轻量库（如 Zustand）但需审慎。
- 目录：
  - `src/stores/`：纯前端状态（主题、侧边栏开合、定价币种选择等）；
  - `src/services/api/**` + React Query：服务端数据（鉴权信息、会议列表、会议详情、文件列表等）。
- 规范：
  - Store 命名以业务域区分：`themeStore.ts`, `uiStore.ts`, `pricingStore.ts`；导出 typed hooks：`useThemeStore()`；
  - 避免在 Store 中直接发起网络请求；服务端数据统一走 `services/api` + React Query；
  - 服务端数据若需与本地 Store 协作，保持单一事实来源（以 React Query 为准），Store 仅存放 UI 衍生状态或用户偏好；
  - SSR/同构（若后来引入）需保证初始状态可注水与可再水化。


---

## 工具与依赖补充（建议）

- `@tanstack/react-query`：请求缓存与状态管理。
- `openapi-typescript` 或 `orval`：基于 OpenAPI 生成类型/客户端。
- `react-i18next`、`i18next-browser-languagedetector`：多语言支持。

---

## 性能与代码分割（补充）

- i18n 资源按语言与命名空间懒加载；营销与应用路由分支使用 `lazy()` 与 `Suspense`。
- 仅在营销分支初始化 AOS；避免对应用区造成体积与运行时开销。
```

```markdown
<<'PATCH'
*** Begin Patch
*** Update File: focal-meet/docs/system-arch.md
@@
-安装
-```bash
+安装
+
+```bash
 npm i -D sass
 ```
@@
-入口引入（建议在 `src/main.tsx` 或布局内）
-```ts
+入口引入（建议在 `src/main.tsx` 或布局内）
+
+```ts
 import '@styles/index.scss';
 ```
@@
-示例：`_variables.scss`
-```scss
+示例：`_variables.scss`
+
+```scss
 // SCSS 基础变量
 $color-primary: #ff6b6b;
 $color-accent: #4ecdc4;
@@
-组件/页面使用（推荐 CSS Modules 或命名空间）
+组件/页面使用（推荐 CSS Modules 或命名空间）
@@
-示例组件样式与使用
-```scss
+示例组件样式与使用
+
+```scss
 /* src/components/Button.module.scss */
 .button {
   padding: var(--space-4) calc(var(--space-4) * 1.5);
   border-radius: var(--radius-md);
   color: var(--color-fg);
   background: linear-gradient(135deg, var(--color-primary), #ff5252);
 }
 ```
 
-```tsx
+```tsx
 import styles from './Button.module.scss';
 
 export default function Button(props) {
   return <button className={styles.button} {...props} />;
 }
 ```
@@
-响应式断点与混入：`_breakpoints.scss`
-```scss
+响应式断点与混入：`_breakpoints.scss`
+
+```scss
 $bp-sm: 640px;
 $bp-md: 768px;
 $bp-lg: 1024px;
@@
-主题切换
-```ts
+主题切换
+
+```ts
 // 切换主题：在任意入口
 document.documentElement.setAttribute('data-theme', 'dark'); // or 'light'
 ```
@@
-读取配置：
-```ts
+读取配置：
+
+```ts
 const apiBase = import.meta.env.VITE_API_BASE_URL ?? '/api';
 ```
@@
-初始化示例：
-```ts
+初始化示例：
+
+```ts
 i18n
   .use(LanguageDetector)
   .use(initReactI18next)
   .init({
     fallbackLng: 'en',
     supportedLngs: ['en', 'zh'],
     ns: ['common', 'marketing', 'app'],
     defaultNS: 'common',
     backend: { loadPath: '/locales/{{lng}}/{{ns}}.json' },
     interpolation: { escapeValue: false },
   });
 ```
*** End Patch
PATCH
```

```markdown
# 项目架构与开发规范（Focal Meet Monorepo 内的前端）

本文件定义 `focal-meet` 的目录结构、路由分层、资源组织、样式体系（基于 SCSS 的主题能力）、代码风格与协作规范，便于团队一致性开发与后续扩展。

## 目标与边界
- 将“官网（营销站）”与“应用（登录后）”统一到一个 React 工程内，采用路由分树管理。
- 样式从当前 Tailwind 基础上引入 SCSS，统一变量与主题机制；短期内可“共存，逐步替换”，长期可平衡两者使用。
- 静态资源统一管理，清晰区分“打包资源与直链资源”。

## 技术栈
- 构建：Vite + React + TypeScript
- 路由：react-router-dom
- 动效：AOS（仅营销站路由初始化）
- 样式：SCSS（支持主题切换）；Tailwind 作为过渡/补充
- 代码规范：ESLint（已配），建议加 Prettier（可选）

---

## 目录结构

- `src/`
  - `views/`（页面层）
    - `marketing/`（官网各页面：`Home`, `About`, `Features`, `Pricing`, `Blog`）
    - `app/`（应用内页面：`Login`, `Dashboard`, `MeetingDetail`）
  - `components/`（通用 UI 组件与表单，如 `AuthForm`）
  - `layouts/`（`MarketingLayout`, `AppLayout`）
  - `router/`（路由入口与守卫）
  - `styles/`（全局 SCSS 架构，详见“样式与主题”）
  - `assets/`（组件内 import 的打包资源：小图、icons、局部 SVG）
- `public/`
  - `assets/`（官网直链图片、视频、favicon、OG 图等）
- 路径别名（统一在 `tsconfig.json` 与 `vite.config.ts`）：
  - `@views`, `@components`, `@layouts`, `@router`, `@styles`, `@assets`

路由分树（示例）：
- 营销站（公开）：`/`, `/about`, `/features`, `/pricing`, `/blog`, `/blog/:slug`
- 应用区：`/app/login`, `/app/dashboard`, `/app/meetings/:id`（后续加鉴权）

---

## 样式与主题（SCSS 方案）

安装

```bash
npm i -D sass
```

组织（基于 7-1 改良结构）
- `src/styles/`
  - `abstracts/`（纯逻辑：不产出 CSS）
    - `_variables.scss`（主题色、间距、字体、ZIndex、阴影、radius）
    - `_mixins.scss`（响应式、文本截断、渐变、主题 Helper）
    - `_functions.scss`（颜色计算等）
    - `_placeholders.scss`（占位选择器）
    - `_breakpoints.scss`（断点常量与 mixin）
  - `base/`
    - `_reset.scss` 或 `_normalize.scss`
    - `_typography.scss`
    - `_globals.scss`（应用全局基础层）
  - `layout/`（`_header.scss`, `_footer.scss`, `_grid.scss`）
  - `components/`（通用组件样式，例如 `_button.scss`, `_card.scss`）
  - `pages/`（单页样式，避免泄漏：营销站页面建议加 `.marketing` 根容器命名空间）
  - `themes/`（主题覆盖：`_light.scss`, `_dark.scss`）
  - `utilities/`（工具类）
  - `index.scss`（唯一入口，按顺序聚合以上文件）

入口引入（建议在 `src/main.tsx` 或布局内）

```ts
import '@styles/index.scss';
```

主题机制（CSS 变量 + SCSS 变量双层）
- 用 SCSS 变量集中定义基础色系，再编译为 CSS 变量，运行时通过切换 `data-theme` 覆盖。
- 优点：设计/实现分离；运行时可切换主题；组件局部也可使用 `var(--token)`。

示例：`_variables.scss`

```scss
// SCSS 基础变量
$color-primary: #ff6b6b;
$color-accent: #4ecdc4;
$color-bg: #111111;
$color-fg: #ffffff;

// 尺寸与节奏
$radius-md: 12px;
$space-4: 16px;

// 导出为 CSS 变量（默认 light）
:root {
  --color-primary: #{$color-primary};
  --color-accent: #{$color-accent};
  --color-bg: #{$color-bg};
  --color-fg: #{$color-fg};

  --radius-md: #{$radius-md};
  --space-4: #{$space-4};
}

// 暗色主题覆盖
[data-theme="dark"] {
  --color-bg: #0d0d0d;
  --color-fg: #eaeaea;
  // 可根据需要覆盖 primary、accent 等
}
```

组件/页面使用（推荐 CSS Modules 或命名空间）
- 应用内组件：`Component.module.scss`（样式隔离）
- 营销站页面：在 `MarketingLayout` 外层加 `.marketing`，对应 SCSS 以 `.marketing .xxx` 开头，避免影响应用区

示例组件样式与使用

```scss
/* src/components/Button.module.scss */
.button {
  padding: var(--space-4) calc(var(--space-4) * 1.5);
  border-radius: var(--radius-md);
  color: var(--color-fg);
  background: linear-gradient(135deg, var(--color-primary), #ff5252);
}
```

```tsx
import styles from './Button.module.scss';

export default function Button(props) {
  return <button className={styles.button} {...props} />;
}
```

响应式断点与混入：`_breakpoints.scss`

```scss
$bp-sm: 640px;
$bp-md: 768px;
$bp-lg: 1024px;

@mixin up($bp) { @media (min-width: $bp) { @content; } }
@mixin down($bp) { @media (max-width: $bp) { @content; } }
```

Tailwind 共存策略（过渡期）
- 允许在营销页先复用现有 CSS（迁移自 `style.css`）并逐步 SCSS 化。
- 应用区优先使用 SCSS Modules。Tailwind 仅作为快速布局补充或清理后逐步减少。

主题切换

```ts
// 切换主题：在任意入口
document.documentElement.setAttribute('data-theme', 'dark'); // or 'light'
```

---

## 静态资源规范

- 直链资源（不参与打包，CDN/SEO/OG 友好）
  - 路径：`public/assets/**`
  - 访问：`/assets/xxx.png`
  - 用于：官网图像、视频、favicon、OG 图、下载文件等
- 打包资源（参与 Tree-Shaking、指纹化）
  - 路径：`src/assets/**`
  - 使用：
    ```tsx
    import logo from '@assets/logo.svg';
    <img src={logo} alt="logo" />
    ```
- 原 `focalMeet/assets` → 迁移到 `public/assets`，营销页直接使用绝对路径 `/assets/...`

---

## 路由与布局

- `MarketingLayout`：官网页头/页脚、AOS 初始化，仅在营销站分支加载；内部 `Outlet` 渲染各营销页。
- `AppLayout`：应用区导航与容器；后续在这里放鉴权与全局状态 Provider。
- 路由文件：`src/router/index.tsx`；集中定义两棵路由树；严禁在页面内隐式 push 新路由定义。

导航约定
- 营销站内链：React Router 的 `<Link>`；同页 hash 滚动用浏览器原生 `hash` 或页面定位组件。
- 跨分支跳转（官网 → 应用）：使用命名路由常量，避免硬编码。

---

## 组件与代码风格

命名与结构
- 组件：帕斯卡命名（`MeetingDetail.tsx`）；只导出一个默认组件。
- 文件：页面用帕斯卡命名（`Home.tsx`），样式对应 `.module.scss` 或放入 `styles/pages/**`。
- 变量/函数命名必须具备语义；避免缩写（遵循“Clean Code”）。

可复用与分层
- 页面：只做数据装配与布局落位；逻辑与展示尽量拆到 `components/`。
- 通用组件：拆出 Props 接口、支持 className 透传、可选 size/variant。
- 动画与交互：优先在组件内部实现；营销站动效集中在营销布局或页面，不影响应用区。

类型与严格性
- TS：导出 API 明确类型；避免 `any`；组件 Props 必须有显式类型。
- 早返回、边界情况优先处理；避免过深嵌套。

---

## 性能与代码分割

- 路由级代码分割：营销页与应用页均可 `lazy()` 加载，首屏仅加载当前分支。
- 图片：优先使用现代格式（webp/avif），大图放 `public/assets`，必要时响应式多源。
- 第三方库：仅在需要的分支/页面初始化（如 AOS 在营销站）。

---

## 工具链与校验

- Lint：`npm run lint`（保持零警告为目标）
- 格式化（建议）：
  - 安装 Prettier 与 ESLint 集成，保存即格式化
- 提交规范（建议 Conventional Commits）：
  - `feat: ...`, `fix: ...`, `refactor: ...`, `style: ...`, `docs: ...`

---

## 开发流程（简要）

- 分支：`feat/*`、`fix/*`、`chore/*`
- M1：路由骨架 + `Home` 迁移、AOS 接入、资源归位
- M2：其余营销页迁移 + 行为重写（平滑滚动、FAQ、Pricing Toggle 等 → React 化）
- M3：应用区鉴权门卫与状态管理（按需）

---

## 后端集成（Backend Integration）

- 接口风格：优先 REST/JSON；跨语言（Node.js/Python）统一以 OpenAPI 规范作为契约来源。
- 类型与客户端生成（建议二选一）：
  - openapi-typescript：仅生成类型，手写轻量客户端
    - 命令：
      ```bash
      npx openapi-typescript http://localhost:8000/openapi.json -o src/types/api.d.ts
      ```
  - orval：基于 OpenAPI 生成类型+请求函数+React Query hooks
    - 配置 `orval.config.cjs` 后运行 `npx orval`
- 服务分层：
  - `src/services/http.ts`：封装 `fetch`/`axios`，统一 baseURL、超时、错误归一化、拦截器（附带请求 ID）。
  - `src/services/api/*`：按业务域（auth、meetings、files...）组织的 API 调用；消费生成的类型。
  - 状态与缓存：建议引入 `@tanstack/react-query` 管理请求缓存、重试、并发与失效策略。
- 会话策略：
  - 首选 httpOnly Cookie（SameSite=Lax/Strict），避免在 `localStorage` 存 JWT。
  - 若使用 Cookie Session，配合 CSRF（双提交 Cookie 或 Same Origin）。
- 跨域与网关：
  - 开发期通过 Vite 代理 `/api`（见“环境与配置”）；生产期通过 Nginx/API 网关同源反代，尽量避免 CORS。

---

## 环境与配置（Environments & Config）

- 环境变量：使用 `.env.*` 注入 `VITE_*` 变量；至少包含：
  - `VITE_API_BASE_URL`：API 基地址（默认为 `/api`）。
  - `VITE_I18N_DEFAULT_LANG`、`VITE_I18N_SUPPORTED`：i18n 默认语言与支持列表（可选）。
- Vite 代理（开发环境）：
  ```ts
  // vite.config.ts
  export default defineConfig({
    plugins: [react()],
    server: {
      proxy: {
        '/api': { target: 'http://localhost:8000', changeOrigin: true, secure: false },
      },
    },
  });
  ```
- 读取配置：
  ```ts
  const apiBase = import.meta.env.VITE_API_BASE_URL ?? '/api';
  ```

---

## 错误处理与可观测性（Error Handling & Observability）

- 错误归一化：HTTP 层将响应标准化为 `{ code, message, details }`，组件只处理语义化错误。
- 重试策略：仅对幂等 GET 进行指数退避重试；非幂等请求禁用自动重试。
- 全局处理：
  - React Error Boundary 捕获渲染错误，展示降级 UI。
  - 统一 Toast/通知组件反馈请求错误。
- 监控（可选）：Sentry/LogRocket 前端埋点；上报 `requestId`/`traceId` 关联后端日志。

---

## 国际化（i18n）

- 库选型：`i18next` + `react-i18next` + `i18next-browser-languagedetector`。
- 资源组织：
  ```text
  public/locales/
    en/
      common.json
      marketing.json
      app.json
    zh/
      common.json
      marketing.json
      app.json
  ```
- 命名空间：`common`（通用）、`marketing`（官网）、`app`（应用）。按路由/页面懒加载命名空间。
- 初始化示例：
  ```ts
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      fallbackLng: 'en',
      supportedLngs: ['en', 'zh'],
      ns: ['common', 'marketing', 'app'],
      defaultNS: 'common',
      backend: { loadPath: '/locales/{{lng}}/{{ns}}.json' },
      interpolation: { escapeValue: false },
    });
  ```
- 语言优先级：URL 前缀（如 `/en/...`）> 用户设置（cookie/localStorage）> 浏览器语言。
- SEO（营销站）：多语言路由前缀、`<html lang>` 与 `hreflang`、多语言 sitemap、按语言注入 meta/OG。
- 文本规范：避免句子拼接；使用参数化占位符 `t('key', { name })`；日期/货币等用 `Intl`。

---

## SEO 与营销站（Multi‑locale SEO）

- 布局层根据当前语言设置 `<html lang>`，并注入 `<link rel="alternate" hreflang="...">`。
- 为各语言生成 sitemap 与 canonical；营销页标题/描述/OG 文案走 i18n 资源。
- 图片与静态资源可配合 `public/assets` 指纹/缓存策略提升首屏表现。

---

## 部署与 CI/CD（Deployment）

- 产物：前端静态文件（Vite 构建）+ 反向代理 `/api` 到后端（Node/Python 任一）。
- 多环境：`staging`/`production` 使用不同 `.env`；CI 在构建阶段注入 `VITE_*`。
- 缓存：`public/locales` 与 `public/assets` 设置长缓存；HTML/entry 短缓存；必要时使用文件指纹或版本查询串。
- 健康检查：前端提供 `/healthz` 静态页（可选）；后端按各自框架规范。

---

## 目录结构补充（新增建议）

- `src/services/`：HTTP 封装与各业务域 API 客户端。
- `src/i18n/`：i18n 初始化、typed hooks、语言工具。
- `public/locales/**`：多语言资源文件。

---

### 状态管理（Stores）

- 选型：推荐 `@tanstack/react-query` 处理服务端数据的缓存、请求生命周期与失效；对“纯前端局部状态/跨页轻量共享状态”，优先使用 React Context + 自定义 hooks；若存在复杂全局状态（如跨页面协作、实时会话、权限角色矩阵），可再评估引入轻量库（如 Zustand）但需审慎。
- 目录：
  - `src/stores/`：纯前端状态（主题、侧边栏开合、定价币种选择等）；
  - `src/services/api/**` + React Query：服务端数据（鉴权信息、会议列表、会议详情、文件列表等）。
- 规范：
  - Store 命名以业务域区分：`themeStore.ts`, `uiStore.ts`, `pricingStore.ts`；导出 typed hooks：`useThemeStore()`；
  - 避免在 Store 中直接发起网络请求；服务端数据统一走 `services/api` + React Query；
  - 服务端数据若需与本地 Store 协作，保持单一事实来源（以 React Query 为准），Store 仅存放 UI 衍生状态或用户偏好；
  - SSR/同构（若后来引入）需保证初始状态可注水与可再水化。


---

## 工具与依赖补充（建议）

- `@tanstack/react-query`：请求缓存与状态管理。
- `openapi-typescript` 或 `orval`：基于 OpenAPI 生成类型/客户端。
- `react-i18next`、`i18next-browser-languagedetector`：多语言支持。

---

## 性能与代码分割（补充）

- i18n 资源按语言与命名空间懒加载；营销与应用路由分支使用 `lazy()` 与 `Suspense`。
- 仅在营销分支初始化 AOS；避免对应用区造成体积与运行时开销。
```

- 是的，之前“stores”未明确；我已补充到两处文档中，并约定落地位置为 `src/stores/**`。
- 记录位置与内容：
  - `focal-meet/docs/system-arch.md` 新增了“状态管理（Stores）”章节，说明选型、目录与规范。
    ```345:355:focal-meet/docs/system-arch.md
    ### 状态管理（Stores）
    
    - 选型：推荐 `@tanstack/react-query` 处理服务端数据的缓存、请求生命周期与失效；对“纯前端局部状态/跨页轻量共享状态”，优先使用 React Context + 自定义 hooks；若存在复杂全局状态（如跨页面协作、实时会话、权限角色矩阵），可再评估引入轻量库（如 Zustand）但需审慎。
    - 目录：
      - `src/stores/`：纯前端状态（主题、侧边栏开合、定价币种选择等）；
      - `src/services/api/**` + React Query：服务端数据（鉴权信息、会议列表、会议详情、文件列表等）。
    - 规范：
      - Store 命名以业务域区分：`themeStore.ts`, `uiStore.ts`, `pricingStore.ts`；导出 typed hooks：`useThemeStore()`；
      - 避免在 Store 中直接发起网络请求；服务端数据统一走 `services/api` + React Query；
      - 服务端数据若需与本地 Store 协作，保持单一事实来源（以 React Query 为准），Store 仅存放 UI 衍生状态或用户偏好；
      - SSR/同构（若后来引入）需保证初始状态可注水与可再水化。
    ```
  - `focal-meet/docs/migration-plan.md` 的“后端集成与状态管理（建议落地）”补充了 stores 的目录与职责边界；M3 验收清单也加入了 stores 落地项。
    ```145:166:focal-meet/docs/migration-plan.md
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
    ```

是否需要我现在直接在代码里创建 `src/stores/` 并加一个可用的 `themeStore` 示例（含持久化与 typed hooks）？

- 做过的编辑影响
  - 在 `system-arch.md` 增加“状态管理（Stores）”，修正了省略号与无语言标注的代码块问题。
  - 在 `migration-plan.md` 将 stores 纳入“后端集成与状态管理”以及 M3 验收项。

```plaintext
    ### 状态管理（Stores）
    
    - 选型：推荐 `@tanstack/react-query` 处理服务端数据的缓存、请求生命周期与失效；对“纯前端局部状态/跨页轻量共享状态”，优先使用 React Context + 自定义 hooks；若存在复杂全局状态（如跨页面协作、实时会话、权限角色矩阵），可再评估引入轻量库（如 Zustand）但需审慎。
    - 目录：
      - `src/stores/`：纯前端状态（主题、侧边栏开合、定价币种选择等）；
      - `src/services/api/**` + React Query：服务端数据（鉴权信息、会议列表、会议详情、文件列表等）。
    - 规范：
      - Store 命名以业务域区分：`themeStore.ts`, `uiStore.ts`, `pricingStore.ts`；导出 typed hooks：`useThemeStore()`；
      - 避免在 Store 中直接发起网络请求；服务端数据统一走 `services/api` + React Query；
      - 服务端数据若需与本地 Store 协作，保持单一事实来源（以 React Query 为准），Store 仅存放 UI 衍生状态或用户偏好；
      - SSR/同构（若后来引入）需保证初始状态可注水与可再水化。
```

```plaintext
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
```


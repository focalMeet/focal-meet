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
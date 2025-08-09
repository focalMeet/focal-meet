# 检查项目结构是否符合标准
_Exported on 8/9/2025 at 16:19:49 GMT+8 from Cursor (1.4.2)_

---

**User**

帮我看下这个项目结构是不是有点问题，是一个标准的 react 的项目结构吗，因为 @focal-meet/ 这个文件夹是我们产品登录后的页面，然后 @focalMeet/ 是我为这个产品做的官网的h5项目。最终是要把单纯的h5官网内容加到 focal-meet 的 react 项目里面去的。你先帮我分析一下项目架构对不对。

---

**Cursor**

我先快速扫一遍两个项目的关键文件，确认 `focal-meet` 是否是标准的 Vite + React + TS 结构，以及 `focalMeet` 的静态站点资源结构如何组织，便于后续合并进一个代码库。随后给你结论和建议的目录结构方案。

### 结论先说
- `focal-meet` 是一个标准的 Vite + React + TypeScript + Tailwind 的最小化项目结构，没问题。但目前更像一个“原型单页”，用 `useState` 切视图，没有路由与页面分层，`components` 里放了实际的“页面”组件（`Dashboard`, `MeetingDetail`），这不是常规最佳实践。
- `focalMeet` 是一个独立的静态 H5 官网页面集合（多 HTML + 独立 CSS/JS 资源），结构清楚，方便直接部署或迁移。
- 从产品目标看，应该合并到一个 React 代码库里，建议在 `focal-meet` 中引入路由与页面分层，把“营销网站（官网）”和“应用（登录后）”两套路由树整合。

### 现状点评（简洁）
- `focal-meet`:
  - 标配文件齐全（`vite.config.ts`, `tsconfig*`, `tailwind.config.js`, `postcss.config.js`）。
  - 缺少 `public/` 目录（Vite 可选，但合并静态资源时会用到）。
  - 没有 `react-router-dom`，`App.tsx` 用 `useState` 切换 `'auth' | 'dashboard' | 'meeting-detail'`。
  - `components` 里包含“页面级组件”，建议迁到 `src/pages/` 或 `src/app/`。
- `focalMeet`:
  - 多页静态站点，`index.html` 引用 `css/style.css` 与 `js/script.js`，还用到 AOS CDN。资源路径相对清晰，适合直接搬到 `public/` 或转 React 页面。

### 推荐目标结构（合并为一个 React 工程）
- 建议在 `focal-meet` 中调整为页面/路由分层，官网与应用分离：
  - `src/`
    - `pages/marketing/`（官网各页：`Home`, `About`, `Features`, `Pricing`, `Blog`, `BlogArticle`）
    - `pages/app/`（应用内页：`Login`, `Dashboard`, `MeetingDetail`, …）
    - `components/`（通用组件）
    - `layouts/`（`MarketingLayout`, `AppLayout`）
    - `router/`（路由入口）
    - `styles/`（全局样式或专用样式）
  - `public/`（图标与不经打包的静态资源；若保留纯静态官网，也可把整站放这里）
- 路由建议（示例）：
  - 官网（公开）：`/`, `/about`, `/features`, `/pricing`, `/blog`, `/blog/:slug`
  - 应用：`/app/login`, `/app/dashboard`, `/app/meetings/:id`（带登录保护）

### 合并方案对比
- 方案 A（快速上线，改动小）：把整个 `focalMeet` 拷到 `focal-meet/public/`，路径保持一致（`public/index.html`, `public/css`, `public/js`, `public/assets`），从 React 里用普通链接跳过去（如 `/site/index.html`）。优点是快；缺点是与 SPA 分离、SEO/路由体验一般、样式和脚本全局污染不可控。
- 方案 B（推荐，体验最佳）：把 `focalMeet` 的页面转成 React 页面：
  - 在 `src/pages/marketing/` 下用 JSX 复刻结构，并在对应页面里按需 `import '.../style.css'`（或逐步 Tailwind 化）。
  - AOS 改为包依赖或按需懒加载，仅在营销路由挂载时初始化（避免影响应用页）。
  - 资源图像放 `public/assets` 或用 `import` 打包。
  - 优点：统一路由、代码分割、样式可控、后续维护方便；缺点：初次迁移需要一些工作量。

### 你现在这套结构要改的关键点
- 加路由：引入 `react-router-dom`，将 `AuthForm`, `Dashboard`, `MeetingDetail` 改为页面路由；`App.tsx` 改为路由入口，不再用本地 `useState` 切视图。
- 分层目录：把页面组件迁到 `src/pages/...`，通用 UI 留在 `src/components/`。
- 新建 `public/`：用于 favicon、官网资源或迁移过渡。
- 合并官网：
  - 快速版：直接放 `focalMeet` 到 `public/site/`，更新链接为 `/site/index.html`。
  - 最佳版：逐页迁到 `src/pages/marketing/`，CSS 按页面懒加载或模块化，避免与 Tailwind 冲突。

如果你确认采用方案 B，我可以直接在当前项目里：
- 安装 `react-router-dom` 并改造路由骨架；
- 建 `src/pages/marketing/`，先把 `index.html` 转为 `Home` 页面（保持 `style.css` 按需导入）；
- 建 `src/pages/app/`，把现有 `Dashboard`/`MeetingDetail` 接入 `/app` 路由；
- 新建 `public/assets`，搬运所需静态文件；
- 保证本地 `npm run dev` 一次性可跑通。

- 影响范围小的过渡做法：先创建 `public/site/` 跑通静态官网，再逐步页面化迁移。

- 额外建议：后续把登录保护加到 `/app/*` 路由（简单的 `RequireAuth` 组件），并把 `package.json` 的 `name` 从 `vite-react-typescript-starter` 改成你的产品名。

- 需要我现在就动手把路由骨架和第一个营销页接进去吗？我可以直接按方案 B 开始改造。

---

**User**

pages能改成views吗

---

**Cursor**

可以。在你这套 Vite + React + react-router 的项目里，目录名不影响路由行为（不是文件驱动路由），把 `pages` 改成 `views` 完全没问题。注意点：

- 保持一致性：把文件移到 `src/views/...` 后，更新所有导入路径与路由引用。
- 建议结构：
  - `src/views/marketing/*`
  - `src/views/app/*`
  - `src/components/*`, `src/layouts/*`, `src/router/*`
- 若想少写相对路径，可加路径别名（可选）：
  - 在 `tsconfig.json` 的 `compilerOptions.paths` 里添加：
    ```json
    {
      "compilerOptions": {
        "baseUrl": ".",
        "paths": {
          "@views/*": ["src/views/*"],
          "@components/*": ["src/components/*"]
        }
      }
    }
    ```
  - 在 `vite.config.ts` 里添加别名：
    ```ts
    import path from 'node:path';

    export default defineConfig({
      plugins: [react()],
      resolve: {
        alias: {
          '@views': path.resolve(__dirname, 'src/views'),
          '@components': path.resolve(__dirname, 'src/components'),
        },
      },
    });
    ```

- 只有在使用文件路由框架（如 Next.js、Remix 或 vite-plugin-pages）时，目录名才会有硬性约定；你当前栈不受限。

- 我可以顺手把骨架改成 `views` 并加好别名配置。需要我现在就调整吗？

- 变更要点
  - 目录命名换成 `views` 不影响功能
  - 更新导入与路由引用
  - 可选添加 `@views/*` 路径别名

```json
    {
      "compilerOptions": {
        "baseUrl": ".",
        "paths": {
          "@views/*": ["src/views/*"],
          "@components/*": ["src/components/*"]
        }
      }
    }
```

```typescript
    import path from 'node:path';

    export default defineConfig({
      plugins: [react()],
      resolve: {
        alias: {
          '@views': path.resolve(__dirname, 'src/views'),
          '@components': path.resolve(__dirname, 'src/components'),
        },
      },
    });
```

---

**User**

是不是还缺少了 assets 目录，来访图片的

---

**Cursor**

是的，目前 `focal-meet` 里没有 `assets` 或 `public` 目录。严格来说不“必须”，但为了放官网图片/静态资源，建议加这两个用法之一（通常两者并存）：

- 建议一：`public/assets`（静态直链）
  - 用于 favicon、OG 图、官网图片等，按原路径直接访问。
  - 在代码或 HTML 里这样引用：`/assets/xxx.png`。
  - 可以把 `C:\coding\focalMeet\assets` 直接拷到 `focal-meet/public/assets`，原始 HTML 引用基本不用改（把相对路径改成 `/assets/...` 即可）。

- 建议二：`src/assets`（打包内引用）
  - 供 React 组件里 `import` 使用，参与打包、哈希与按需加载。
  - 用法：
    ```tsx
    import hero from '../assets/hero.png';
    <img src={hero} alt="" />
    ```

推荐同时使用：
- 官网静态资源 → `public/assets`
- 应用内局部图片/图标 → `src/assets`

需要的话我可以直接给你创建 `public/assets` 并把 `focalMeet/assets` 拷进去，然后把引用路径统一成 `/assets/...`。

- 我建议补充目录
  - 新增 `public/assets` 用于官网静态图片
  - 可选新增 `src/assets` 用于组件内 import 使用

```typescriptreact
    import hero from '../assets/hero.png';
    <img src={hero} alt="" />
```

---

**User**

可以的，按照刚下的方案B和让你再改的2点，输出一个修改方案，分步骤

---

**Cursor**

我来给你一个可直接执行的方案 B 改造清单（已按你要求把 pages 命名为 views，并补上 assets 规划），从零到可运行，逐步推进。

### 步骤 0：准备分支
- 新建分支开发，方便回滚。

```bash
git checkout -b feat/marketing-merge
```

### 步骤 1：安装依赖
- 加路由与 AOS（把 AOS 从 CDN 换成包，便于在 React 里按需初始化）

```bash
npm i react-router-dom aos
```

### 步骤 2：目录分层（加入 views 与公共资源）
- 新建目录：
  - `src/views/marketing/`
  - `src/views/app/`
  - `src/layouts/`
  - `src/router/`
  - `src/styles/`（存放营销站 CSS）
  - `src/assets/`（组件内 import 的图片/图标）
  - `public/assets/`（官网静态图片直链）
- 从 `C:\coding\focalMeet\assets` 拷到 `focal-meet/public/assets`。

### 步骤 3：路径别名（可选但强烈建议）
- 在 `tsconfig.json` 增加：
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@views/*": ["src/views/*"],
      "@components/*": ["src/components/*"],
      "@layouts/*": ["src/layouts/*"],
      "@router/*": ["src/router/*"],
      "@styles/*": ["src/styles/*"],
      "@assets/*": ["src/assets/*"]
    }
  }
}
```
- 在 `vite.config.ts` 增加：
```ts
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@views': path.resolve(__dirname, 'src/views'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@layouts': path.resolve(__dirname, 'src/layouts'),
      '@router': path.resolve(__dirname, 'src/router'),
      '@styles': path.resolve(__dirname, 'src/styles'),
      '@assets': path.resolve(__dirname, 'src/assets'),
    },
  },
});
```

### 步骤 4：整理现有应用页面到 views
- 移动文件：
  - `src/components/AuthForm.tsx` → 仍留在 `components`（它是表单组件）
  - `src/components/Dashboard.tsx` → `src/views/app/Dashboard.tsx`
  - `src/components/MeetingDetail.tsx` → `src/views/app/MeetingDetail.tsx`
- 新建 `src/views/app/Login.tsx`（用现有 `AuthForm` 组装成一个页面）。
- 这样 `components` 专注通用组件，`views` 承载页面。

### 步骤 5：引入路由骨架
- 新建 `src/router/index.tsx`，配置两棵路由树：
  - 公开营销站：`/`（后续扩展 `/about`, `/features`, `/pricing`, `/blog`）
  - 应用区：`/app/login`, `/app/dashboard`, `/app/meetings/:id`
- 修改 `src/App.tsx`：
  - 移除用 `useState` 切视图的逻辑，只保留路由出口。
- `src/main.tsx` 基本不动。

示例（仅骨架，实际你实现时可按需精简/增补）：
```tsx
// src/router/index.tsx
import { createBrowserRouter } from 'react-router-dom';
import MarketingLayout from '@layouts/MarketingLayout';
import AppLayout from '@layouts/AppLayout';
import Home from '@views/marketing/Home';
import Login from '@views/app/Login';
import Dashboard from '@views/app/Dashboard';
import MeetingDetail from '@views/app/MeetingDetail';

export const router = createBrowserRouter([
  {
    element: <MarketingLayout />,
    children: [
      { path: '/', element: <Home /> },
      // { path: '/about', element: <About /> }, ...
    ],
  },
  {
    path: '/app',
    element: <AppLayout />,
    children: [
      { path: 'login', element: <Login /> },
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'meetings/:id', element: <MeetingDetail /> },
    ],
  },
]);
```

### 步骤 6：布局组件
- 新建 `src/layouts/MarketingLayout.tsx`：放官网的 Header/Footer（可先简单占位），内部 `Outlet` 渲染营销页面。
- 新建 `src/layouts/AppLayout.tsx`：应用区的顶栏/容器，内部 `Outlet` 渲染应用页面。

### 步骤 7：迁移官网首页为 React 视图
- 把 `C:\coding\focalMeet\index.html` 转为 `src/views/marketing/Home.tsx` 的 JSX 结构。
- 样式：
  - 将 `C:\coding\focalMeet\css\style.css` → `src/styles/marketing.css`
  - 在 `Home.tsx` 顶部 `import '@styles/marketing.css'`
  - AOS 样式：`import 'aos/dist/aos.css'`
- 图片引用：
  - 将原 HTML 中 `assets/...` 改为 `/assets/...`（因为已放到 `public/assets`）
  - JSX 中使用：`<img src="/assets/xxx.png" />`
- JS 行为（先做最小可用，后续增强）：
  - 安装包后在 `MarketingLayout` 里初始化 AOS：
    ```tsx
    import AOS from 'aos';
    import 'aos/dist/aos.css';
    useEffect(() => { AOS.init({ duration: 1000, easing: 'ease-out-cubic', once: true, offset: 100 }); }, []);
    ```
  - 其它 `script.js` 行为（平滑滚动、header 滚动态、FAQ、pricing toggle、ripple 等）后续按页面逐步用 React 重写；第一阶段可以先不实现，以便尽快联通路由。

### 步骤 8：应用区接通
- `Login.tsx` 使用现有 `AuthForm`；登录成功后用路由跳转至 `/app/dashboard`。
- `Dashboard.tsx` 与 `MeetingDetail.tsx` 已迁至 `views/app`，按路由访问。
- 可新增一个简易的鉴权门卫（`RequireAuth`）在 `/app/*` 层封装（后续接入真实鉴权再完善）。

### 步骤 9：验证与启动
```bash
npm run dev
```
- 验证：
  - `/` 正常展示营销首页（样式和图片资源加载正常）
  - `/app/login` 登录页显示，登录后跳转 `/app/dashboard`
  - `/app/meetings/123` 会议详情可打开
- 有路径或样式冲突时，优先在 `marketing.css` 加命名空间容器（如给营销布局最外层加 `class="marketing"`，把规则前缀成 `.marketing .xxx` 以避免影响应用区）。

### 步骤 10：逐页迁移官网其它页面（增量推进）
- 依次迁移 `about.html`, `features.html`, `pricing.html`, `blog.html` → `src/views/marketing/...`
- 若有博文单页（`/blog/*.html`），可先用 React 视图硬编码，后续再考虑用 MDX/数据驱动。

### 步骤 11：收尾与规范
- `package.json.name` 从 `vite-react-typescript-starter` 改为你的产品名。
- `eslint` 跑一遍修正导入路径和未用变量。
- 补充 `README` 路由说明与资源组织规范（`public/assets` vs `src/assets` 的使用约定）。

——
需要的话，我可以按这个步骤直接提交第一阶段改造：完成目录调整、路由骨架、营销首页迁移与 AOS 接入，并保证 `/` 与 `/app/*` 都能跑通。

- 这次变更会涉及的关键文件/目录
  - 新增：`src/views/**`, `src/layouts/**`, `src/router/index.tsx`, `src/styles/marketing.css`
  - 调整：`src/App.tsx`（改为只承载路由）、`vite.config.ts`（别名）、`tsconfig.json`（paths）
  - 资源：`public/assets/**`（拷贝自原 `focalMeet/assets`）

- 资源推荐放置
  - 官网静态图片：`public/assets/**`（用绝对路径 `/assets/...`）
  - 组件私有图片：`src/assets/**`（用 `import img from '@assets/..'`）

- 里程碑
  - M1：路由骨架 + 首页迁移上线
  - M2：其余营销页迁移 + 交互补齐
  - M3：应用区鉴权与状态管理接入

小结
- 已给出方案 B 的落地步骤，并按你的要求使用 `views` 命名与补齐 `assets` 组织。
- 先把 `Home` 迁入 React、统一资源到 `public/assets`，路由分树（营销 vs 应用）；后续逐页迁移与交互重写。

```shellscript
git checkout -b feat/marketing-merge
```

```shellscript
npm i react-router-dom aos
```

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@views/*": ["src/views/*"],
      "@components/*": ["src/components/*"],
      "@layouts/*": ["src/layouts/*"],
      "@router/*": ["src/router/*"],
      "@styles/*": ["src/styles/*"],
      "@assets/*": ["src/assets/*"]
    }
  }
}
```

```typescript
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@views': path.resolve(__dirname, 'src/views'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@layouts': path.resolve(__dirname, 'src/layouts'),
      '@router': path.resolve(__dirname, 'src/router'),
      '@styles': path.resolve(__dirname, 'src/styles'),
      '@assets': path.resolve(__dirname, 'src/assets'),
    },
  },
});
```

```typescriptreact
// src/router/index.tsx
import { createBrowserRouter } from 'react-router-dom';
import MarketingLayout from '@layouts/MarketingLayout';
import AppLayout from '@layouts/AppLayout';
import Home from '@views/marketing/Home';
import Login from '@views/app/Login';
import Dashboard from '@views/app/Dashboard';
import MeetingDetail from '@views/app/MeetingDetail';

export const router = createBrowserRouter([
  {
    element: <MarketingLayout />,
    children: [
      { path: '/', element: <Home /> },
      // { path: '/about', element: <About /> }, ...
    ],
  },
  {
    path: '/app',
    element: <AppLayout />,
    children: [
      { path: 'login', element: <Login /> },
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'meetings/:id', element: <MeetingDetail /> },
    ],
  },
]);
```

```typescriptreact
    import AOS from 'aos';
    import 'aos/dist/aos.css';
    useEffect(() => { AOS.init({ duration: 1000, easing: 'ease-out-cubic', once: true, offset: 100 }); }, []);
```

```shellscript
npm run dev
```

---

**User**

我认可你现在的方案，以及也统一步骤三。我希望你先输出一个文档，来描述一下项目架构，以及开发规范，比如样式的设计，我想要scss来改造，这样对后面可以调整主题色之类的。你再输出一下这份文件。

---

**Cursor**

### 项目架构与开发规范（Focal Meet Monorepo 内的前端）

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

### 可访问性与国际化（基础约定）

- 必备 a11y：表单 label/aria、语义化标签、图片 `alt`。
- 文案：营销页可暂硬编码；应用区组件尽量集中文案以便后续 i18n 接入（例如使用常量或简单钩子，后续替换为 i18n 库）。

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

### 示例清单（落地最小集）

- 新增（样式骨架）
  - `src/styles/abstracts/_variables.scss`
  - `src/styles/abstracts/_mixins.scss`
  - `src/styles/abstracts/_breakpoints.scss`
  - `src/styles/base/_globals.scss`
  - `src/styles/themes/_light.scss`, `src/styles/themes/_dark.scss`
  - `src/styles/index.scss`（聚合以上）
- 组件样式示例：`*.module.scss`（应用区优先）
- 营销站样式迁移：将旧 `style.css` 内容分拆到 `styles/pages/**`，并在 `Home` 中按需引入；第一阶段可直接全局引一次，命名空间 `.marketing` 限制影响面。

---

### 执行须知

- AOS 只在 `MarketingLayout` 内初始化；避免污染应用区。
- 图片优先放 `public/assets`，JSX 使用绝对路径 `/assets/...`；组件局部图片走 `src/assets` + import。
- Tailwind 与 SCSS 共存期间，优先在新代码中用 SCSS；逐步将旧的长串 Tailwind 类抽象为组件样式或 SCSS 工具类。

---

- 需要我基于本规范初始化 `styles` 目录与 SCSS 主题骨架，并提交第一批文件吗？我可以按上述结构直接落地，保证不影响现有功能。

- 变更影响范围
  - 新增样式文件与入口引入
  - 不改动现有组件逻辑，仅新增样式组织与主题能力

- 依赖
  - 需新增 dev 依赖：`sass`

- 主题切换示例
  ```ts
  // e.g., 放在全局设置里
  const isDark = matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  ```

- 断点使用示例
  ```scss
  .card {
    padding: 12px;
    @include up($bp-md) { padding: 16px; }
  }
  ```

- 图片使用示例
  ```tsx
  // 直链
  <img src="/assets/hero/cover.webp" alt="Focal Meet" />
  // 打包
  import icon from '@assets/icons/mic.svg';
  <img src={icon} alt="Mic" />
  ```

- 页面命名与导入
  - 文件名：`Home.tsx`, `Pricing.tsx`
  - 导入：`import Home from '@views/marketing/Home'`

- 样式命名空间
  - 营销站根：`<div className="marketing">...</div>`
  - 对应样式：`.marketing .hero { ... }`

- 架构关键点
  - 两棵路由树清晰隔离
  - 样式分层：抽象变量 → 全局 → 布局/组件/页面 → 主题覆盖
  - 资源双通道：`public/assets` 与 `src/assets` 分工明确

- 我可以按此文档落地 M1 的样式骨架、主题与路由布局接入，随时开始。

- 变更摘要
  - 引入 SCSS 与主题机制（CSS 变量 + SCSS 变量）
  - 明确官网/应用的路由与布局分层
  - 规范静态资源使用与样式组织，支持后续主题色一键调整

- 下一步建议
  - 执行依赖安装与 `styles` 目录初始化
  - 将 `Home` 首屏迁移到 React，并验证 `/assets` 引用路径与 AOS 初始化正常

```shellscript
npm i -D sass
```

```typescript
import '@styles/index.scss';
```

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

```scss
/* src/components/Button.module.scss */
.button {
  padding: var(--space-4) calc(var(--space-4) * 1.5);
  border-radius: var(--radius-md);
  color: var(--color-fg);
  background: linear-gradient(135deg, var(--color-primary), #ff5252);
}
```

```typescriptreact
import styles from './Button.module.scss';

export default function Button(props) {
  return <button className={styles.button} {...props} />;
}
```

```scss
$bp-sm: 640px;
$bp-md: 768px;
$bp-lg: 1024px;

@mixin up($bp) { @media (min-width: $bp) { @content; } }
@mixin down($bp) { @media (max-width: $bp) { @content; } }
```

```typescript
// 切换主题：在任意入口
document.documentElement.setAttribute('data-theme', 'dark'); // or 'light'
```

```typescriptreact
    import logo from '@assets/logo.svg';
    <img src={logo} alt="logo" />
```

```typescript
  // e.g., 放在全局设置里
  const isDark = matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
```

```scss
  .card {
    padding: 12px;
    @include up($bp-md) { padding: 16px; }
  }
```

```typescriptreact
  // 直链
  <img src="/assets/hero/cover.webp" alt="Focal Meet" />
  // 打包
  import icon from '@assets/icons/mic.svg';
  <img src={icon} alt="Mic" />
```

---

**User**

我已经把系统架构和开发规范加到 @system-arch.md 里面了，我后续还会接入一个后端，可能是 nodejs 也可能是python，另外会需要适配多国语言，看是否需要调整系统设计文档里面的内容

---

**Cursor**

### 建议补充与调整点（面向后端接入与多语言）

我建议在 `docs/system-arch.md` 增补以下章节，并对现有内容轻量修订，保证无论后端用 Node.js 还是 Python，都能以“技术栈无关”的方式接入；同时完善 i18n 的工程化与 SEO。

### 需要新增的章节与要点

- 后端集成（Backend Integration）
  - 接口风格：REST/JSON（GraphQL 亦可，但需单独规范）。统一以 OpenAPI 作为契约来源。
  - 契约生成：
    - 后端生成 OpenAPI（FastAPI/NestJS/Express+swagger），前端用 `openapi-typescript` 或 `orval` 生成 TS 类型与 API 客户端。
    - 若仅 Node（未来可能锁定），也可选 tRPC，但跨语言不通用，优先 OpenAPI。
  - API 客户端分层：
    - `src/services/http.ts`：封装 `fetch`/`axios`，做 baseURL、超时、重试、错误归一化。
    - `src/services/api/*`：按业务域划分（auth, meetings, files…），全部使用生成的类型。
    - 建议引入 TanStack Query 管理缓存/请求态（`@tanstack/react-query`）。
  - 环境与网关：
    - 本地：Vite 代理 `/api` 到后端（避免 CORS）。生产：建议 Nginx/API 网关统一转发。
    - 环境变量：`.env.*` 使用 `VITE_API_BASE_URL`、`VITE_FEATURE_FLAGS_*`。
  - 安全与会话：
    - Cookie-Session（跨子域同站策略）或 JWT（httpOnly Cookie 最佳，避免 localStorage）。
    - CSRF：如使用 Cookie Session，需要 CSRF Token（双提交或 SameSite=strict + Same Origin）。
    - CORS：若不同源，限制 Origin/Methods/Credentials；优先通过网关规避 CORS。

- 开发环境与配置（Environments & Config）
  - `.env.local`、`.env.development`、`.env.production` 约定；文档化所有 `VITE_*` 变量。
  - Vite 代理配置范例（开发）：
    ```ts
    // vite.config.ts
    server: {
      proxy: {
        '/api': { target: 'http://localhost:8000', changeOrigin: true, secure: false }
      }
    }
    ```
  - 配置读取：
    ```ts
    const apiBase = import.meta.env.VITE_API_BASE_URL ?? '/api';
    ```

- 错误处理与监控（Error Handling & Observability）
  - 错误归一化：HTTP 层解析后统一抛出 { code, message, details }。
  - 前端监控：Sentry/LogRocket（可选）；最低限度错误边界组件和全局 Toast。
  - 重试策略：幂等 GET 自动重试，非幂等禁用自动重试。

- 多语言架构（Internationalization）
  - 库：`i18next` + `react-i18next` + `i18next-browser-languagedetector`。
  - 资源组织：
    - `public/locales/{en,zh,...}/{common,marketing,app}.json`
    - 命名空间：`common`（通用）、`marketing`（官网）、`app`（应用）
  - 初始化（按路由分支懒加载命名空间）：
    ```ts
    i18n.use(LanguageDetector).use(initReactI18next).init({
      fallbackLng: 'en',
      supportedLngs: ['en', 'zh'],
      ns: ['common', 'marketing', 'app'],
      defaultNS: 'common',
      backend: { loadPath: '/locales/{{lng}}/{{ns}}.json' }
    });
    ```
  - 语言路由策略：
    - 官网（SEO 友好）：路径前缀 `/en/...`、`/zh/...`，生成 `hreflang`、sitemap 按语言。
    - 应用：可用前缀或仅内部 i18n（非 SEO 关键），优先内部切换不改 URL。
  - 语言偏好：优先 URL > 用户设置 > 浏览器语言；存储于 cookie/localStorage。
  - 文本格式化：统一用 `Intl`（日期、数字、货币）；按语言动态切换 locale。
  - 设计规范：避免拼接句子；使用完整句子与占位参数（`t('key', { name })`）。

- SEO 与营销站（Multi-locale SEO）
  - `<html lang="...">`、`<link rel="alternate" hreflang="...">` 自动注入（布局层根据当前语言）。
  - 每种语言 sitemap；规范 canonical。
  - 元信息与 OG 多语言：集中配置或按页面钩子注入。

- 样式与主题补充（与 i18n 配合）
  - 方向性支持（如需 RTL）：在 `data-dir="rtl"` 下切换部分布局（预留）。
  - 颜色与密度等主题仍走 CSS 变量；语言切换不改变主题。

- 部署与 CI/CD（简述）
  - 构建产物：前后端分离部署或同域静态 + 反向代理 `/api`。
  - 多环境：`staging`、`prod` 对应 `.env`；CD 时注入 `VITE_*`。
  - i18n 资源缓存：`Cache-Control` + 版本号（文件名指纹或 query 版本）。

### 现有章节的微调建议

- “目录结构”中加入：
  - `src/services/`（HTTP 基础与 API 域服务）
  - `src/i18n/`（初始化、typed hooks、语言工具）或放到 `src/lib/`
  - `public/locales/**`（i18n 资源）
- “工具链与校验”中加入：
  - 建议引入 `@tanstack/react-query`、`openapi-typescript` 或 `orval`、`react-i18next`
- “性能与代码分割”中加入：
  - i18n 命名空间与语言资源按需懒加载；路由分支与视图懒加载
- “执行须知”中加入：
  - 开发时通过 Vite 代理 `/api`；生产经 Nginx 统一反代，避免 CORS
  - AOS 仍仅在营销路由初始化；i18n 初始化在应用入口，命名空间按页面加载

### 文档可直接添加的段落示例

- Backend Integration 段内添加 OpenAPI → TS 类型生成的命令示例：
  ```bash
  npx openapi-typescript http://localhost:8000/openapi.json -o src/types/api.d.ts
  ```
  或使用 `orval` 配置生成客户端与 hooks。

- i18n 的目录示例：
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

- 开发代理与环境变量清单：
  - `VITE_API_BASE_URL`、`VITE_I18N_DEFAULT_LANG`、`VITE_I18N_SUPPORTED` 等

### 是否需要现在就改文档
- 建议将上述新增章节添加至 `system-arch.md` 顶层目录中，与现有“样式与主题”“路由与布局”“静态资源规范”并列。
- 我可以按上述要点为你把文档增量补齐，并提交最小落地代码骨架（`src/services/http.ts`、`src/i18n/init.ts`、Vite 代理、`public/locales` 目录与样例 JSON）。

- 关键影响
  - 明确前后端契约与环境变量，用 OpenAPI 打通类型链路
  - 固化 i18n 的目录、加载策略与 SEO 约定
  - 预留 Node/Python 任一后端的接入通道，不锁栈

- 需要我直接更新 `docs/system-arch.md` 并创建 `public/locales` 与 `src/services`、`src/i18n` 的骨架吗？我可以一次性补齐最小模板与示例。

```typescript
    // vite.config.ts
    server: {
      proxy: {
        '/api': { target: 'http://localhost:8000', changeOrigin: true, secure: false }
      }
    }
```

```typescript
    const apiBase = import.meta.env.VITE_API_BASE_URL ?? '/api';
```

```typescript
    i18n.use(LanguageDetector).use(initReactI18next).init({
      fallbackLng: 'en',
      supportedLngs: ['en', 'zh'],
      ns: ['common', 'marketing', 'app'],
      defaultNS: 'common',
      backend: { loadPath: '/locales/{{lng}}/{{ns}}.json' }
    });
```

```shellscript
  npx openapi-typescript http://localhost:8000/openapi.json -o src/types/api.d.ts
```

```plaintext
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

---

**User**

你先直接更新到文档里面去

---

**Cursor**

我将把后端接入、多语言、环境配置、错误监控、SEO 和部署等章节直接追加到 `docs/system-arch.md`，并加上对现有“目录结构/工具链/性能/执行须知”的补充说明。随后你就能在文档里看到这些新增内容。

我将把后端集成、环境与配置、多语言、错误监控、SEO、多环境部署等章节追加到 `docs/system-arch.md` 文档末尾，保持与现有风格一致并给出可执行示例。随后你可以在该文件中查看更新内容。

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

### 可访问性与国际化（基础约定）

- 必备 a11y：表单 label/aria、语义化标签、图片 `alt`。
- 文案：营销页可暂硬编码；应用区组件尽量集中文案以便后续 i18n 接入（例如使用常量或简单钩子，后续替换为 i18n 库）。

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

### 示例清单（落地最小集）

- 新增（样式骨架）
  - `src/styles/abstracts/_variables.scss`
  - `src/styles/abstracts/_mixins.scss`
  - `src/styles/abstracts/_breakpoints.scss`
  - `src/styles/base/_globals.scss`
  - `src/styles/themes/_light.scss`, `src/styles/themes/_dark.scss`
  - `src/styles/index.scss`（聚合以上）
- 组件样式示例：`*.module.scss`（应用区优先）
- 营销站样式迁移：将旧 `style.css` 内容分拆到 `styles/pages/**`，并在 `Home` 中按需引入；第一阶段可直接全局引一次，命名空间 `.marketing` 限制影响面。

---

### 执行须知

- AOS 只在 `MarketingLayout` 内初始化；避免污染应用区。
- 图片优先放 `public/assets`，JSX 使用绝对路径 `/assets/...`；组件局部图片走 `src/assets` + import。
- Tailwind 与 SCSS 共存期间，优先在新代码中用 SCSS；逐步将旧的长串 Tailwind 类抽象为组件样式或 SCSS 工具类。

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
  - `src/services/api/*`：按业务域（auth、meetings、files…）组织的 API 调用；消费生成的类型。
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

已把后端集成、环境配置、多语言、错误监控、SEO、部署等章节追加到 `docs/system-arch.md` 末尾，并补充了目录结构、工具依赖与性能建议，与你现有规范保持一致。

- 关键新增
  - 后端集成：OpenAPI 契约、类型/客户端生成（openapi-typescript/orval）、服务分层、会话与 CORS 策略
  - 环境与配置：`.env.*` 变量清单、Vite 开发代理示例、读取方式
  - 错误与可观测性：错误归一化、重试策略、Error Boundary、监控建议
  - 国际化：i18next 方案、`public/locales` 目录、命名空间与懒加载、语言优先级、SEO 友好
  - SEO：多语言 `lang`/`hreflang`、sitemap 与 canonical、OG 元数据
  - 部署与 CI/CD：静态产物+反代、缓存策略、环境注入
  - 目录与依赖补充：`src/services/`, `src/i18n/`, `public/locales`，以及推荐依赖
  - 性能补充：i18n 资源与路由懒加载、AOS 仅营销分支初始化

- 下一步可选
  - 我可创建 `src/services/`、`src/i18n/` 与 `public/locales` 的最小骨架，并加上示例 i18n 初始化与 HTTP 封装，保证即插即用。


# Resume Builder Landing Page — Motion / Design Reference

> 这是视觉交互参考原型，而不是已完成的简历编辑器。请对照 `motion_preview.mp4` 的真实动效，结合 `index.html` 的 CSS/JavaScript 和附带截图，将视觉语言迁移到实际 Next.js 项目中。不要沿用演示品牌 folio.，应替换为项目实际名称和已有文案。

## 设计目标

制作一个高级、克制、富有电影感的 Resume Builder 落地页。视觉氛围接近我提供的参考录屏：明亮蓝天 + 缓动云层、半透明导航、巨幅居中标题、应用界面从下方浮出，随滚动放大并与后续的淡紫色区域自然过渡。整体是 premium minimal SaaS，不是科技霓虹风，也不是过度花哨的粒子动效。

## 动效清单（务必实际实现，而非只还原静态截图）

1. **Hero sky / Continuous ambient motion** — 蓝色渐变/云层摄影背景，极缓慢水平漂移，约 18–24 秒一个往返周期。叠加很淡的虚化云雾以营造深度。避免明显循环跳帧。
2. **Hero heading entrance** — 页面加载时，Eyebrow、H1、Subheading、CTA 轻微错峰，opacity 0→1 与 translateY(20~32px)→0，时长 0.7~1.2 秒，ease-out。
3. **Editor mockup reveal** — 精致的简历编辑器产品 mockup 从下方 80–120px 向上进入，scale 0.90→1，rotateX 4deg→0，opacity 0→1，轻微 perspective。页面加载 0.2–1.5 秒呈现。
4. **Scroll-linked hero parallax** — 首屏滚动时，云层移动速度慢于前景；大型产品 mockup 轻度 scale 1→1.1 与 translateY；不得出现闪跳。
5. **Split feature section** — 背景从蓝天过渡到极浅薰衣草灰 `#f4f3fb`；左侧标题/段落渐入，右侧 AI 写作辅助 UI 大卡片带一点旋转角度，随滚动从右下浮现并归位。
6. **Templates gallery** — 三张不同风格的简历纸张卡片，以轻微倾斜和错开的时间滑入；hover 时抬升 8–20px 并增强阴影。真实页面可以点选模板进入编辑器。
7. **Final CTA** — 蓝紫渐变背景、简洁大标题、可点击的真实主要行动按钮。
8. **Micro-interactions** — 导航毛玻璃变化、CTA hover、小型状态标识、AI 打字光标，低调、流畅，不喧宾夺主。

## 版式与视觉规范

- Desktop 主展示：1280–1440px 宽；适配 390px 移动端。
- 颜色：天空蓝 `#6f9dd9`、低饱和淡紫 `#f4f3fb`、深灰蓝文字 `#383953`、辅色紫 `#6665ad`、纯白 UI 卡片。
- 风格：large editorial typography、圆角 12–18px、柔和 diffuse shadow、subtle glassmorphism、大面积呼吸感留白。
- 内容结构：Fixed/Floating Nav → Sky Hero → Animated Resume Editor Preview → AI Feature → Templates → Final CTA。
- Resume Builder 核心展示应是**真实简历编辑器的模拟 UI**（侧栏、表单、简历纸张实时预览），不要照搬原参考中的金融 Dashboard。

## Next.js 实现约束

- 拆成 `Navbar`, `Hero`, `ResumeEditorMockup`, `FeatureSpotlight`, `TemplateGallery`, `FinalCTA` 等可维护组件。
- 优先 CSS keyframes 实现持续背景动效，IntersectionObserver + CSS 实现进入视口动效；scroll-linked transform 可用已有 Motion/Framer Motion 或 GSAP，若项目没有依赖则使用 requestAnimationFrame + 滚动进度即可。
- 大型 mockup、背景图必须合理压缩；动画主要使用 `transform` 和 `opacity`；避免持续修改会引起重排的属性。
- `prefers-reduced-motion: reduce` 时去掉循环动画和复杂视差；低性能设备、移动端降低动效幅度。
- CTA 必须接入已有 `/builder` 或真实编辑器路由，不要停留在展示用跳转。
- 保留现有项目技术栈、设计 token、路由和数据层，不要为了视觉重写业务逻辑。
- 尽量实现参考动效本身，**不要直接把视频或一张截图铺到网站上**。

## 给 Claude 的执行任务（可直接复制）

我正在开发一个 Resume Builder Web App。请先查看附件中的 `motion_preview.mp4`（运动效果）、`hero.png` / `features.png` / `templates.png`（画面构成）和 `index.html`（交互原型）。我的重点是“像参考视频一样的连续、丝滑、具有纵深感的真实前端动画”，而不是静态还原。

请先审查当前 Next.js 项目，给出简短的结构/组件和动画触发计划，然后实现 Landing Page。保留已有业务逻辑与路由。使用真实 HTML/CSS/React 组件做简历编辑器模拟，不要用静态截图伪装交互。实现并检查桌面、移动端、prefers-reduced-motion、滚动不卡顿、按钮可用。完成后用浏览器实测整体页面动画与响应式效果，并列出你实际完成的动效及验证结果。

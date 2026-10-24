# Claude — 请根据这个 Demo 精确改进现有 Lume Landing Page

你现在要在**现有的 Next.js 项目里进行局部改版**，不是重新生成全站。附件包括运行版 `index.html`、云层素材 `assets/`、桌面/移动截图和 16 秒 MP4 动画。请先阅读源码，运行本地项目，分析现有 Hero/Nav 文件结构，然后修改并自测。

## 目标

保留现有 Lume 品牌 Logo、Hero 文案、CTA、当前区块顺序和业务链接，升级如下：

### 1. 顶部导航：Liquid Glass

参考 `glass_nav_closeup.png` 和 `index.html` 里 `.nav.liquid-glass` 区段。想要的是**空气感较强、能看出天空透过玻璃的半透明实体**，不要只是全白不透明导航卡片：

- rounded capsule；柔软高光边缘 + 内外双重描边/阴影。
- 半透明浅白/淡蓝渐变与 `backdrop-filter: blur(18px–28px) saturate(1.2–1.6)`，根据真实截图调节。
- CSS `::before/::after` 和额外 highlight layer 模拟表面反光、极轻微镜面扫光；不要高亮得像霓虹灯。
- 鼠标在 Navbar 内移动时使用 requestAnimationFrame 更新反光中心 (`--glass-x`,`--glass-y`)；hover 的导航项获得极淡的内嵌玻璃药丸反光。
- `Start building` 深海军蓝玻璃药丸 + 细微光泽；保留原有事件和路由。
- 移动端适配；不可让 Navbar 导致水平溢出；保留键盘焦点状态。

### 2. 天空和云

参考 Demo 里的 `.hero`, `.sky-cloud`, `.cloud-a...d`, `@keyframes drift-*`。

- 天空蓝色清晰、通透，保持中间标题的足够对比度。
- 云层必须作为**多个独立绝对定位的背景层**，左右云以不同速度缓慢平移/略微上下移动；不要把文字、按钮或 Mockup 与背景一起移动。
- 动画循环要自然、足够慢（35–55 秒级），不可有明显跳帧或一眼看出的循环接缝。
- 使用附件云层 PNG，或按现有项目设计系统重建相当的独立素材；中间标题区域不要被大块白云挡住。
- `prefers-reduced-motion: reduce` 时禁用非必要云动画及玻璃扫光。

### 3. 底部样例界面：文字必须清晰

- 尽可能用 **React + HTML/CSS 组件** 显示 Mockup，而不是让一张低分辨率截图同时承担所有文字内容。
- 真实文本、输入框、分栏和简历预览必须高清晰度，避免 `transform: scale()` 将位图拉伸导致模糊。
- 如果现有页面已经是 HTML，就不要无谓重写；先检查是否存在缩放、父级滤镜、不合适的透明度或截图分辨率问题。
- 可参考 Demo 里的 `.product-stage`, `.app`, `.edit-panel`, `.paper`，但是保留项目既有业务数据、路由、语言与功能。
- 首屏布局仍然是：顶部胶囊导航 → 中间标题/副标题/CTA → 下方大型编辑器产品样例；高度和留白与现有图保持一致。

## 技术与工程约束

- Next.js / TypeScript / Tailwind：尽量用现有技术栈和组件，不为了这些效果额外引入庞大的 3D 库、视频背景或 Shader。
- 玻璃效果只用 CSS + 少量 pointer interaction；不要使用放大的整页截图假装产品界面。
- 充分分离组件和层级：`LiquidGlassNavbar`, `AnimatedSky`, `HeroContent`, `ProductPreview`。
- 确保层级关系、pointer-events、移动端适配和内存释放（RAF 清理）；图片尺寸优化，避免影响 LCP/CLS。
- 用实际 Chrome / Edge 桌面和 390px 手机宽度进行视觉比对。
- 尊重现有导航 href、登录、创建简历、PDF 等真实业务逻辑，不要把 Demo 里的假点击逻辑复制进正式网站。

## 验收标准

1. 顶栏明显具有半透明厚度、边缘高光、模糊透背景和低幅度动态反射，不是平面的白条。
2. 云确实缓慢运动；静止的标题和 Mockup 不随其移动。
3. 放大或浏览 Mockup 时文字清楚，无整体滤镜导致的模糊。
4. 手机端标题、CTA、导航与产品展示无页面级横向溢出；内容可正常操作。
5. 支持减少动画偏好；视觉保持舒适，不眩晕。
6. 告诉我改动的组件文件、关键 CSS 和自测结果，且不要改动无关功能。

**请把附带的 HTML 和 MP4 当作风格与交互规范，用真实现有项目结构实现，不要直接拿整张截图当 Hero 背景。**

# Lume — Liquid Glass Hero Demo

这是可运行的 HTML/CSS/JavaScript 前端视觉原型。重点用于指导现有 Next.js 网站升级 Hero section，而不是替代真实网站的业务逻辑。

## 预览方式

1. 解压整个文件夹，保留 `index.html` 与 `assets/` 的相对目录结构。
2. 用 Chrome / Edge 打开 `index.html`；无需安装依赖。
3. 将鼠标移到顶部导航的链接、Logo 附近和“Start building”按钮上，观察玻璃反光变化。
4. 编辑产品演示区的姓名、邮箱、电话和地址，观察右侧简历实时联动；单击“Write with AI”查看本地示例改写（**非真实 AI API**）。
5. 向下滚动到 `THE LUME EXPERIENCE`，可以对比 Glass on / off、控制云层动效。

## 此次实现

- **Liquid Glass Navbar**：`backdrop-filter` 模糊/色彩、半透明叠层、渐变边框、内侧高光、扫光动画和鼠标跟随局部反射；移动端收起部分菜单。
- **Sky and Clouds**：更通透的天空渐变，独立 PNG 透明云层，不对内容/产品界面做整体位移动画。
- **Sharper Product Preview**：底部编辑器用真实 HTML/CSS 生成，避免原来截图被拉伸造成字体发糊；编辑字段同步更新简历。
- **交互验收**：测试了导航模糊属性、姓名实时同步、简介内容修改、示例 AI 改写、添加 bullet、玻璃开关，以及 390px 移动端无横向页面溢出。

## 文件

- `index.html` — 可运行 Demo（不需要后端）
- `assets/cloud_*.png` — 独立云朵素材，需一起放在项目中
- `hero_preview.png` — 整体首屏截图
- `glass_nav_closeup.png` — 玻璃导航局部参考
- `glass_hover_preview.png` — 鼠标高光状态参考
- `mobile_preview.png` — 移动端参考
- `lume_liquid_glass_motion.mp4` — 真实浏览器录制的动效演示
- `CLAUDE_IMPLEMENTATION_BRIEF.md` — 可复制给 Claude 的实施说明

## 技术/产品说明

本 Demo 展示的是通过 CSS 生成的**视觉折射/反射近似效果**，并非物理级像素光线折射；浏览器 `backdrop-filter` 支持差异会影响外观。

`Sign in`、`Start building`、`Download PDF`、`Score`、`Tailor` 等在演示页面中只有示例行为，不代表已经完成真实身份认证、计费或 PDF 业务流程。集成到你的现有应用时请保留你当前的业务逻辑。

开发正式项目时，建议拆成独立 React 组件（HeroBackground、LiquidGlassNav、HeroCopy、ProductMockup），用 CSS/Framer Motion 控制非必要动画，遵守 `prefers-reduced-motion`。

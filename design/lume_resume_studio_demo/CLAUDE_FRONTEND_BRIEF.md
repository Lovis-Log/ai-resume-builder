# 给 Claude 的任务说明：实现 Lume Resume Studio（Next.js）

你收到一个可交互的 `index.html` 原型，请将它作为**视觉和交互的 source of truth**，而不是复制成一个不可维护的大组件。

## 目标

开发一个面向自用和小范围分享的现代简历编辑器，延续 Lume 蓝色 + 淡紫色品牌。首页高视觉冲击力，编辑器在效率与动态质感之间平衡。整体风格 Soft Minimalism，偏 Linear / Notion，避免复杂后台系统视觉。

## 前端技术

- Next.js App Router + TypeScript
- Tailwind CSS（令牌化颜色/间距/字体）与必要的 CSS Modules
- 可选 shadcn/ui 作为基础控件，视觉细节完全按原型定制
- Motion for React 承载 Drawer、Panel、Template transitions；尊重 reduced motion
- 无账号/支付/数据库依赖的 MVP：localStorage 保存

## 必须保留的体验

1. Dashboard → Create Resume → Studio 主流程
2. 60-72px 图标 Rail + 400-430px 可滚动编辑面板 + 弹性 A4 Live Preview
3. 结构化简历编辑；输入实时反映到预览；预览点选区块可跳转回编辑面板
4. Design 面板切换 Modern / Classic / Editorial、主题色、版面密度
5. AI Drawer 以可替换的模拟数据方式展示优化前后差异、Apply 操作，不把 mock 称为真实 AI
6. 自动保存的轻反馈，不弹打断式通知
7. 导出 PDF（优先确保排版、A4 分页准确）与可编辑 JSON
8. 窄屏支持编辑/预览切换，键盘导航、焦点管理和可访问性

## 视觉与动效细节

- 背景主色 `#f5f7fc`，主文字 `#1b2845`，主蓝 `#416af5`，紫色 `#916af7`
- 顶部 72px，轻盈高质感的设计；头像、路径、保存状态、主按钮
- 内容折叠用轻位移 + 渐隐（~220ms）
- 模板切换缓动、不让纸张容器产生明显跳跃（~350ms）
- AI Drawer 从右侧滑入（~350ms）
- Hover / Focus / Drag / Scroll 状态一致、细腻，避免过多动画
- Logo 是自定义 **L 字形**，不是星芒、Gemini 风格图案

## 架构与验收

- 定义 `Resume` / `Experience` / `Education` / `ThemeOptions` TypeScript 类型
- UI 与数据状态分离；不直接操纵 DOM 更新字段
- 可添加/删除工作经历、折叠板块、显示简历内容
- 不得出现“输入到右侧预览不同步”的问题
- 切换模板不丢失编辑内容
- 保存后重新打开应恢复内容
- 简历较长时应有可预测分页，而非截断内容
- 在 desktop 1440×900 和 mobile 390×844 下手工走完基本流程
- 对 PDF 的字体、文本换行和打印留白做实际验证

代码实现可以升级原型细节，但不必为此加入登录、会员、付费、服务器或数据库。

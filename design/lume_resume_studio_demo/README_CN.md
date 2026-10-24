# Lume — Resume Studio · 可交互 UI Demo

这是一份**单文件、零依赖**的 Resume Builder 编辑器概念原型。可以直接在 Windows 的 Chrome / Edge 浏览器中打开 `index.html` 使用，也可以交给 Claude 作为前端开发参考。

## 体验方法

1. 解压文件，双击 `index.html`。
2. 在 **Write** 模式中编辑姓名、职位、联系方式、简介、工作经历、教育和技能；右侧 A4 画布同步变化。
3. 点击左侧 **调色板图标（Design）**，切换 Modern / Classic / Editorial 三款版式、主题色和页面间距。
4. 点击左侧 **AI 图标**，查看从右侧滑出的 AI 辅助抽屉，体验建议比较与 Apply to resume。
5. 点击右侧简历中的标题/段落，可以跳转到左侧对应编辑区。
6. 点击左上角 Lume Logo，进入 Dashboard；点击已有简历返回，或创建一份空白简历。
7. 点击 **Export PDF** 打开浏览器打印对话框，选择“另存为 PDF”。如需保留可编辑的结构化内容：设置图标 → Export editable JSON。

## 已实现交互

- 编辑器三栏布局、Accordion 折叠与展开、简历实时联动
- 三款模板、六款主题色、三档间距、模板过渡动画
- 预览画布缩放与区域点击联动
- AI 建议 UI、侧滑抽屉、建议应用（**本地模拟，不调用真实 AI API**）
- 浏览器 localStorage 自动保存、简单撤销、可编辑 JSON 下载
- Dashboard + 新简历模板选择对话框
- 响应式：窄屏下 Edit / Preview 切换
- 打印样式、A4 导出路径、减少动效偏好支持

## 关于原型的边界

- 这是 UI/UX **交互原型**，不是完整生产应用，不包含账号系统、云同步、API、真实 AI 推理、完整撤销栈、导入 PDF 或 ATS 评分。
- PDF 使用浏览器原生打印。对于很长的内容，生产版应增加更严格的自动分页、孤行处理和字体一致性验证。
- AI 优化仅展示交互流程，建议由当前示例文字在本地生成；不会上传用户数据。
- 简历内容默认使用英文虚拟人物 Alex Morgan，仅用于展示排版效果。

## 技术建议（供 Claude 实现 Next.js）

建议将单文件拆分成以下组件：

- `ResumeStudio` 主布局
- `StudioTopbar`
- `ToolRail`
- `ContentEditor` + `AccordionSection`
- `DesignPanel` + `TemplatePicker`
- `ResumeCanvas` + `ResumeDocument`（打印 DOM 与普通预览共用）
- `AiAssistantDrawer`（先 Demo mode，后接真实 AI API）
- `Dashboard`

状态以 `Resume` 数据模型、`EditorPreferences`（template、accent、density）、`UIState`（mode、activeSection、drawerOpen、zoom）分开管理。开发时保留 `prefers-reduced-motion` 与键盘可访问性。

**设计原则：** Landing Page 可以更梦幻，Resume Studio 则应轻盈、稳重、明确；动效为用户操作提供反馈，而不是转移注意力。

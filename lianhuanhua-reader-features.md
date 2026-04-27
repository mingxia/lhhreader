# 现代连环画阅读器功能与界面设计（MVP 优先）

## 1. 产品目标（当前阶段）

我们先聚焦 **阅读器界面与阅读体验**，先把“读一本书”的体验打磨到位，再逐步扩展后台导入与运营能力。

一句话定义：

> 一个优先适配电脑端与平板端的现代连环画 Web 阅读器，基于 Next.js + React，使用 JSON 文件管理书籍与页面数据。

当前明确约束：

- 技术栈：Next.js + React
- 优先设备：桌面端、平板横屏
- 数据存储：本地/服务器 JSON 文件（暂不引入数据库）
- 核心任务：阅读器 UI、交互、基础阅读能力

---

## 2. 信息架构（第一阶段）

### 2.1 页面结构

- `/books` 书籍列表页
- `/books/[slug]` 书籍详情页
- `/reader/[bookId]` 阅读器页（核心）
- `/bookshelf` 我的书架（可先做静态/本地数据版）

### 2.2 阅读器页布局（桌面/平板优先）

阅读器采用三层结构：

1. 顶部工具条（可自动隐藏）
2. 中间阅读画布（双页/单页）
3. 底部控制条（页码、进度、模式切换）

默认视觉原则：

- 暖纸色背景
- 克制阴影
- 少按钮、低干扰
- 全屏时最大化内容区

---

## 3. 阅读器界面设计（重点）

## 3.1 顶部工具条（ReaderTopbar）

建议包含：

- 返回书籍详情
- 书名（可省略副标题）
- 阅读模式切换（双页/单页）
- 适应策略（适应宽度/适应高度）
- 缩放控制（+ / - / 100%）
- 全屏按钮
- 更多菜单（目录、快捷键说明、主题）

交互规则：

- 鼠标移动到顶部区域时显示
- 静止约 1.5 秒自动淡出
- 键盘操作后短暂显示状态

## 3.2 中间阅读画布（BookSpread / BookPage）

### 双页模式（默认，桌面和平板横屏）

- 左右两页并排
- 封面页单页显示（进入正文后双页）
- 中缝书脊阴影（轻量）
- 图片完整显示，不裁切
- 容器自适应（优先适应高度）

### 单页模式

- 单页居中
- 适合竖图或细节查看
- 保留左右留白，避免贴边

### 点击热区

- 左 30% 区域：上一页
- 中 40% 区域：显示/隐藏 UI
- 右 30% 区域：下一页

## 3.3 底部控制条（ReaderToolbar）

建议包含：

- 当前页码 / 总页数
  - 双页示例：`12–13 / 64`
- 阅读进度百分比
- 进度条拖动跳转
- 上一页 / 下一页按钮
- 目录按钮（缩略图抽屉，第二优先级）

交互规则：

- 与顶部栏一致：自动隐藏、按需唤起
- 拖动进度条时显示目标页预览（后续增强）

---

## 4. 核心功能设计（MVP）

## 4.1 翻页能力

支持：

- 按钮翻页
- 键盘翻页（← / →）
- 空格键下一页
- 点击左右热区翻页

默认不启用：

- 滚轮翻页（避免误触）

## 4.2 阅读进度

- 自动保存 `currentPage`
- 从上次阅读位置继续
- 显示百分比进度
- 读完后标记 `isFinished`

## 4.3 缩放与适配

首版支持：

- 适应宽度
- 适应高度
- 放大 / 缩小
- 100% 还原

二期再加：

- 放大后拖拽平移
- 双击放大

## 4.4 全屏沉浸

- 一键进入全屏
- 顶部/底部栏自动隐藏
- Esc 退出全屏
- 全屏下保持键盘翻页可用

## 4.5 图片加载策略

- 当前页优先加载
- 预加载后续 2 组页面
- 缓存前后若干页
- 远距离页面释放缓存

目标：翻页“几乎无感等待”。

---

## 5. 数据方案（JSON 文件）

当前阶段不接入数据库，采用 JSON 文件存储。

## 5.1 建议目录

```text
/data
  books.json
  /books
    /journey-to-the-west-001
      book.json
      pages.json
      /pages
        001.webp
        002.webp
      /thumbs
        001.webp
        002.webp
```

## 5.2 数据结构示例

`books.json`（列表索引）

```json
[
  {
    "id": "journey-to-the-west-001",
    "slug": "journey-to-the-west-001",
    "title": "西游记：三打白骨精",
    "cover": "/data/books/journey-to-the-west-001/thumbs/001.webp",
    "author": "吴承恩（原著）",
    "illustrator": "佚名",
    "totalPages": 64,
    "tags": ["古典名著", "神话传说"]
  }
]
```

`book.json`（单本元信息）

```json
{
  "id": "journey-to-the-west-001",
  "title": "西游记：三打白骨精",
  "description": "经典连环画版本",
  "publisher": "示例出版社",
  "publishYear": 1984,
  "totalPages": 64,
  "readingModeDefault": "spread"
}
```

`pages.json`（页面数据）

```json
[
  {
    "pageNumber": 1,
    "imageUrl": "/data/books/journey-to-the-west-001/pages/001.webp",
    "thumbUrl": "/data/books/journey-to-the-west-001/thumbs/001.webp",
    "width": 1600,
    "height": 2400,
    "isCover": true,
    "isBlank": false
  }
]
```

---

## 6. 组件拆分建议（Next.js App Router）

```text
/components/reader/
  ReaderLayout.tsx
  ReaderTopbar.tsx
  ReaderToolbar.tsx
  BookSpread.tsx
  BookPage.tsx
  ReadingProgress.tsx
  ZoomControls.tsx
  FullscreenButton.tsx
  ThumbnailDrawer.tsx

/lib/reader/
  pagination.ts      # 单/双页配对逻辑
  shortcuts.ts       # 键盘映射
  preload.ts         # 预加载策略

/lib/data/
  books.ts           # 读取 books.json
  book.ts            # 读取单本 book.json/pages.json
```

---

## 7. 里程碑计划（从界面到功能）

## Milestone A：阅读器 UI 骨架

- 完成阅读器三层布局
- 完成双页/单页静态切换
- 完成顶部/底部栏自动隐藏

## Milestone B：阅读交互闭环

- 翻页（按钮/键盘/热区）
- 页码与进度展示
- 进度条跳转
- 本地保存阅读进度

## Milestone C：沉浸与性能

- 全屏模式
- 缩放与适应策略
- 预加载与懒加载

## Milestone D：书籍页联动

- `/books`、`/books/[slug]` 与 `/reader/[bookId]` 串联
- 我的书架（基于本地 JSON + localStorage）

---

## 8. 第一版验收标准（Definition of Done）

当以下条件全部满足，可认为 MVP 可用：

1. 用户可从书籍详情进入阅读器。
2. 阅读器默认双页显示，封面单页正确。
3. 可通过键盘与点击热区稳定翻页。
4. 可显示当前页段与总页数、阅读百分比。
5. 刷新后可恢复上次阅读页。
6. 可切换全屏并正常退出。
7. 主要交互在桌面和平板横屏下表现稳定。

---

## 9. 当前决策结论

- **先做阅读器，不先做复杂后台。**
- **先用 JSON 数据源跑通产品闭环。**
- **先把双页阅读体验做到优秀，再扩展导入、管理与搜索。**

品牌表达可沿用：

> 老内容，用新体验重新打开。

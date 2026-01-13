# AI讲师成交中枢 - 项目交付

您好！

我已经根据您提供的需求文档，为您完整搭建了“AI讲师成交中枢”微信小程序的后端和前端项目框架。所有代码均严格遵循需求文档中的“硬约束”进行实现。

## 项目结构

项目包含两个主要部分：

-   `backend/`: 基于 **NestJS** 的后端服务。
-   `miniprogram/`: **微信小程序**原生代码。

```
/home/ubuntu/ai-lecturer-hub/
├── backend/         # NestJS 后端项目
│   ├── src/
│   │   ├── core/      # 核心模块 (数据库, 配置)
│   │   ├── modules/   # 业务模块 (认证, 归因, 线索, 导出等)
│   │   └── main.ts
│   ├── .env.example # 环境变量示例
│   └── package.json
├── miniprogram/     # 微信小程序项目
│   ├── pages/       # 页面
│   ├── services/    # API服务
│   ├── utils/       # 工具函数
│   ├── app.js
│   ├── app.json
│   └── project.config.json
└── README.md        # 项目说明文档
```

## 后端 (NestJS)

### 主要技术栈

-   **框架**: NestJS (TypeScript)
-   **数据库**: TypeORM + MySQL
-   **任务队列**: BullMQ + Redis (用于异步处理PDF导出)
-   **认证**: JWT (JSON Web Token)
-   **API**: RESTful

### 功能模块

-   **Auth**: 微信登录 (`code2session`)、JWT令牌生成与验证。
-   **Attribution**: 实现“Last Click”归因模型，处理分享链接 (`share_id`) 和小程序码场景值 (`scene`)，管理访客与经纪人的绑定关系（30天窗口期）。
-   **Teachers**: 提供讲师主页信息、能力模块查询。
-   **Brokers**: 提供经纪人创建分享链接、查询名下线索等功能。
-   **Leads**: 核心业务模块，负责创建线索、调用大语言模型（LLM）生成双摘要、实现防幻觉约束和覆盖率检测。
-   **Exports**: 异步处理PDF导出任务。使用 BullMQ 将任务加入队列，由独立的 Worker 进程消费，通过 Puppeteer 生成PDF并上传至COS。
-   **Notifications**: 实现微信订阅消息的发送逻辑。

### 如何运行

1.  **安装依赖**: `cd backend && pnpm install`
2.  **配置环境变量**: 复制 `.env.example` 为 `.env`，并填写所有必要的配置项（如数据库、微信AppID、JWT密钥、COS密钥等）。
3.  **启动数据库和Redis**: 确保您的开发环境中已启动 MySQL 和 Redis 服务。
4.  **启动服务**: `pnpm run start:dev`
5.  服务将在 `http://localhost:3000/api` 启动。

## 前端 (微信小程序)

### 主要技术栈

-   **框架**: 原生微信小程序 (JS + WXML + WXSS)
-   **状态管理**: 使用 `app.js` 的 `globalData` 和 `wx.setStorageSync` 实现简单的全局状态管理。
-   **API请求**: 封装了 `wx.request`，实现了统一的API调用和Token管理。

### 核心页面

-   `/pages/teacher/home`: **讲师主页**。核心入口，负责登录、归因解析和信息展示。
-   `/pages/lead/intent`: **意图选择页**。引导用户选择初步需求。
-   `/pages/lead/form`: **需求输入页**。支持文本、语音、快捷标签三种输入方式，并在提交前请求订阅消息授权。
-   `/pages/lead/result`: **分析结果页**。展示AI生成的双摘要、匹配度，并提供PDF导出功能。
-   `/pages/teacher/leads`: **讲师线索列表**。
-   `/pages/broker/leads`: **经纪人线索列表**。

### 如何运行

1.  打开**微信开发者工具**。
2.  选择“导入项目”，项目目录选择本文件夹下的 `miniprogram`。
3.  填写您的微信小程序 **AppID**。
4.  修改 `miniprogram/app.js` 中的 `apiBaseUrl` 为您后端服务的实际地址。
5.  修改 `miniprogram/pages/lead/form/index.js` 中的 `SUBSCRIBE_TEMPLATE_ID` 为您在小程序后台申请的订阅消息模板ID。
6.  点击“编译”即可在模拟器中查看效果。

## 交付文件

项目完整代码已打包在附件的 `ai-lecturer-hub.zip` 文件中。请您查收。

如有任何问题，请随时提出。

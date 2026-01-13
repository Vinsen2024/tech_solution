# AI讲师成交中枢 - 微信小程序

## 开发环境配置

### 1. 导入项目

1. 打开微信开发者工具
2. 选择"导入项目"
3. 选择 `miniprogram` 目录
4. 填入您的 AppID（或使用测试号）

### 2. 配置后端地址

在 `app.js` 中配置 API 地址：

```javascript
globalData: {
  // 开发环境
  apiBaseUrl: 'https://3000-iulcb2h3895jlnp4ni4nr-9619dd09.sg1.manus.computer/api',
  
  // 生产环境（需要替换为您的域名）
  // apiBaseUrl: 'https://your-domain.com/api',
  
  // 开发模式（跳过微信登录）
  devMode: true,
}
```

### 3. 开发模式说明

当 `devMode: true` 时：
- 跳过微信登录流程，使用测试 token
- 跳过归因解析，直接返回空归因
- 方便在开发者工具中调试

**生产环境部署时，请将 `devMode` 设置为 `false`**

### 4. 测试页面

默认首页是讲师主页，会自动加载讲师 ID 为 1 的数据。

您也可以通过编译模式添加启动参数：
- `teacherId=1` - 查看讲师1（王老师）
- `teacherId=2` - 查看讲师2（李教授）

### 5. 域名配置

在微信公众平台配置以下域名：

**request 合法域名：**
- 开发环境：`https://3000-iulcb2h3895jlnp4ni4nr-9619dd09.sg1.manus.computer`
- 生产环境：您的后端 API 域名

**注意：** 开发阶段可以在开发者工具中勾选"不校验合法域名"选项。

## 页面说明

| 页面路径 | 说明 |
|---------|------|
| `/pages/teacher/home/index` | 讲师主页 |
| `/pages/lead/intent/index` | 意图选择页 |
| `/pages/lead/form/index` | 需求输入页 |
| `/pages/lead/result/index` | 结果展示页 |
| `/pages/teacher/leads/index` | 讲师线索列表 |
| `/pages/broker/leads/index` | 经纪人线索列表 |

## 常见问题

### Q: 页面一直显示"加载中"

1. 检查后端服务是否正常运行
2. 检查 `apiBaseUrl` 配置是否正确
3. 在开发者工具中打开"不校验合法域名"选项
4. 查看控制台是否有错误信息

### Q: 如何查看不同讲师的页面

在编译模式中添加启动参数 `teacherId=2` 即可查看讲师2的页面。

### Q: 如何测试经纪人归因

1. 将 `devMode` 设置为 `false`
2. 添加启动参数 `share_id=xxx`（需要是数据库中存在的分享ID）

export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  // 微信小程序配置
  wechat: {
    appId: process.env.WX_APPID || process.env.WECHAT_APP_ID,
    secret: process.env.WX_SECRET || process.env.WECHAT_SECRET,
    newLeadTemplateId: process.env.WECHAT_NEW_LEAD_TEMPLATE_ID,
  },

  // JWT配置
  jwt: {
    secret: process.env.JWT_SECRET || 'your-jwt-secret-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  // 数据库配置（支持微信云托管MySQL）
  database: {
    host: process.env.MYSQL_ADDRESS?.split(':')[0] || process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_ADDRESS?.split(':')[1] || process.env.DB_PORT || '3306', 10),
    username: process.env.MYSQL_USERNAME || process.env.DB_USERNAME || 'root',
    password: process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || process.env.DB_DATABASE || 'ai_lecturer_hub',
  },

  // Redis配置（微信云托管可选）
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
  },

  // 腾讯云COS配置
  cos: {
    secretId: process.env.COS_SECRET_ID,
    secretKey: process.env.COS_SECRET_KEY,
    bucket: process.env.COS_BUCKET,
    region: process.env.COS_REGION || 'ap-guangzhou',
  },

  // LLM配置
  llm: {
    apiKey: process.env.OPENAI_API_KEY || process.env.LLM_API_KEY,
    baseUrl: process.env.LLM_BASE_URL || 'https://api.openai.com/v1',
    model: process.env.LLM_MODEL || 'gpt-4.1-mini',
  },
});

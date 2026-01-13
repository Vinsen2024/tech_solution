// app.js
App({
  globalData: {
    // 用户认证信息
    token: null,
    openid: null,
    userId: null,
    
    // 归因缓存 (按 teacherId 缓存)
    // 格式: { [teacherId]: { brokerId, shareId, expiresAt, brokerInfo } }
    attributionCache: {},
    
    // 用户信息
    userInfo: null,
    
    // API 基础地址
    // 开发环境使用本地地址，生产环境需要替换为真实域名
    apiBaseUrl: 'https://3000-iulcb2h3895jlnp4ni4nr-9619dd09.sg1.manus.computer/api',
    
    // 是否为开发模式（跳过微信登录）
    devMode: true,
  },

  onLaunch() {
    // 从本地存储恢复登录状态
    this.restoreLoginState();
    
    // 开发模式下自动设置测试token
    if (this.globalData.devMode && !this.globalData.token) {
      this.setDevToken();
    }
  },

  /**
   * 开发模式下设置测试token
   */
  setDevToken() {
    // 开发环境使用模拟token
    this.globalData.token = 'dev_test_token';
    this.globalData.openid = 'test_openid_001';
    this.globalData.userId = 1;
    console.log('[DEV] 已设置开发测试token');
  },

  /**
   * 从本地存储恢复登录状态
   */
  restoreLoginState() {
    try {
      const token = wx.getStorageSync('token');
      const openid = wx.getStorageSync('openid');
      const userId = wx.getStorageSync('userId');
      const attributionCache = wx.getStorageSync('attributionCache') || {};

      if (token) {
        this.globalData.token = token;
        this.globalData.openid = openid;
        this.globalData.userId = userId;
        this.globalData.attributionCache = attributionCache;
      }
    } catch (e) {
      console.error('恢复登录状态失败', e);
    }
  },

  /**
   * 保存登录状态到本地存储
   */
  saveLoginState(data) {
    this.globalData.token = data.token;
    this.globalData.openid = data.openid;
    this.globalData.userId = data.userId;

    try {
      wx.setStorageSync('token', data.token);
      wx.setStorageSync('openid', data.openid);
      wx.setStorageSync('userId', data.userId);
    } catch (e) {
      console.error('保存登录状态失败', e);
    }
  },

  /**
   * 保存归因缓存
   */
  saveAttributionCache(teacherId, attribution) {
    this.globalData.attributionCache[teacherId] = attribution;
    
    try {
      wx.setStorageSync('attributionCache', this.globalData.attributionCache);
    } catch (e) {
      console.error('保存归因缓存失败', e);
    }
  },

  /**
   * 获取归因缓存
   */
  getAttributionCache(teacherId) {
    const cache = this.globalData.attributionCache[teacherId];
    
    // 检查是否过期
    if (cache && cache.expiresAt) {
      if (new Date(cache.expiresAt) > new Date()) {
        return cache;
      }
    }
    
    return null;
  },

  /**
   * 清除登录状态
   */
  clearLoginState() {
    this.globalData.token = null;
    this.globalData.openid = null;
    this.globalData.userId = null;
    
    try {
      wx.removeStorageSync('token');
      wx.removeStorageSync('openid');
      wx.removeStorageSync('userId');
    } catch (e) {
      console.error('清除登录状态失败', e);
    }
  },

  /**
   * 检查是否已登录
   */
  isLoggedIn() {
    return !!this.globalData.token;
  },
});

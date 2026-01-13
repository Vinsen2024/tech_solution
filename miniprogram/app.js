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
    apiBaseUrl: 'https://your-api-domain.com/api',
  },

  onLaunch() {
    // 从本地存储恢复登录状态
    this.restoreLoginState();
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

// services/auth.js
const { post } = require('../utils/request');

/**
 * 微信登录
 * 获取 code 并换取 token
 */
function wxLogin() {
  const app = getApp();
  
  return new Promise((resolve, reject) => {
    // 开发模式下直接返回测试数据
    if (app.globalData.devMode) {
      console.log('[DEV] 跳过微信登录，使用测试数据');
      const devData = {
        token: 'dev_test_token',
        openid: 'test_openid_001',
        userId: 1,
        isNewUser: false,
      };
      app.saveLoginState(devData);
      resolve(devData);
      return;
    }
    
    // 检查是否已有有效 token
    if (app.globalData.token) {
      resolve({
        token: app.globalData.token,
        openid: app.globalData.openid,
        userId: app.globalData.userId,
        isNewUser: false,
      });
      return;
    }

    // 调用 wx.login 获取 code
    wx.login({
      success(loginRes) {
        if (loginRes.code) {
          // 调用后端接口换取 token
          post('/auth/wxLogin', { code: loginRes.code })
            .then((data) => {
              // 保存登录状态
              app.saveLoginState(data);
              resolve(data);
            })
            .catch(reject);
        } else {
          reject(new Error('微信登录失败'));
        }
      },
      fail(err) {
        reject(new Error(err.errMsg || '微信登录失败'));
      },
    });
  });
}

/**
 * 确保已登录
 * 如果未登录则自动登录
 */
async function ensureLoggedIn() {
  const app = getApp();
  
  // 开发模式下自动设置token
  if (app.globalData.devMode && !app.globalData.token) {
    app.setDevToken();
  }
  
  if (!app.globalData.token) {
    await wxLogin();
  }
  return {
    token: app.globalData.token,
    openid: app.globalData.openid,
    userId: app.globalData.userId,
  };
}

/**
 * 退出登录
 */
function logout() {
  const app = getApp();
  app.clearLoginState();
}

module.exports = {
  wxLogin,
  ensureLoggedIn,
  logout,
};

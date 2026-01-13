// services/auth.js
const { post } = require('../utils/request');
const app = getApp();

/**
 * 微信登录
 * 获取 code 并换取 token
 */
function wxLogin() {
  return new Promise((resolve, reject) => {
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
  app.clearLoginState();
}

module.exports = {
  wxLogin,
  ensureLoggedIn,
  logout,
};

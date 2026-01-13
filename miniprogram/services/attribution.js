// services/attribution.js
const { post } = require('../utils/request');
const { ensureLoggedIn } = require('./auth');

/**
 * 解析归因
 * 硬约束 6: 归因触发时机
 * @param {number} teacherId - 讲师ID
 * @param {string} shareId - 分享ID (可选)
 * @param {string} scene - 场景值 (可选)
 */
async function resolveAttribution(teacherId, shareId, scene) {
  const app = getApp();
  
  // 开发模式下返回模拟数据
  if (app.globalData.devMode) {
    console.log('[DEV] 跳过归因解析，返回空归因');
    return { brokerId: null, shareId: null };
  }
  
  // 确保已登录
  await ensureLoggedIn();

  // 检查缓存
  const cachedAttribution = app.getAttributionCache(teacherId);
  
  // 如果没有新的 shareId/scene，且缓存有效，直接返回缓存
  if (!shareId && !scene && cachedAttribution) {
    return cachedAttribution;
  }

  try {
    // 调用后端归因解析接口
    const result = await post('/attribution/resolve', {
      teacherId,
      shareId,
      scene,
    });

    // 保存到缓存
    if (result.brokerId) {
      app.saveAttributionCache(teacherId, {
        brokerId: result.brokerId,
        shareId: result.shareId,
        expiresAt: result.expiresAt,
        brokerInfo: result.brokerInfo,
      });
    }

    return result;
  } catch (error) {
    console.error('归因解析失败', error);
    // 返回缓存的归因（如果有）
    return cachedAttribution || { brokerId: null, shareId: null };
  }
}

/**
 * 获取当前归因信息
 * @param {number} teacherId - 讲师ID
 */
function getCurrentAttribution(teacherId) {
  const app = getApp();
  return app.getAttributionCache(teacherId);
}

module.exports = {
  resolveAttribution,
  getCurrentAttribution,
};

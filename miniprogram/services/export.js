// services/export.js
const { get, post } = require('../utils/request');

/**
 * 创建PDF导出任务
 * @param {number} leadId - 线索ID
 */
function createExportJob(leadId) {
  return post('/exports', {
    leadId,
    type: 'MATCH_PDF',
  });
}

/**
 * 获取导出任务状态
 * @param {number} jobId - 任务ID
 */
function getExportStatus(jobId) {
  return get(`/exports/${jobId}`);
}

/**
 * 轮询导出任务状态
 * @param {number} jobId - 任务ID
 * @param {function} onProgress - 进度回调
 * @param {number} interval - 轮询间隔（毫秒）
 * @param {number} timeout - 超时时间（毫秒）
 */
function pollExportStatus(jobId, onProgress, interval = 2000, timeout = 120000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const poll = async () => {
      try {
        const status = await getExportStatus(jobId);
        
        if (onProgress) {
          onProgress(status);
        }
        
        if (status.status === 'SUCCEEDED') {
          resolve(status);
          return;
        }
        
        if (status.status === 'FAILED') {
          reject(new Error(status.errorMessage || '导出失败'));
          return;
        }
        
        // 检查超时
        if (Date.now() - startTime > timeout) {
          reject(new Error('导出超时'));
          return;
        }
        
        // 继续轮询
        setTimeout(poll, interval);
      } catch (error) {
        reject(error);
      }
    };
    
    poll();
  });
}

module.exports = {
  createExportJob,
  getExportStatus,
  pollExportStatus,
};

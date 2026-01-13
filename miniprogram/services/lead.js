// services/lead.js
const { get, post } = require('../utils/request');

/**
 * 创建线索
 * 硬约束 7: Lead 创建必须携带归因信息
 * @param {object} data - 线索数据
 */
function createLead(data) {
  return post('/leads', {
    teacherId: data.teacherId,
    intent: data.intent,
    input: data.input,
    attribution: data.attribution,
  });
}

/**
 * 获取线索摘要详情
 * @param {number} leadId - 线索ID
 */
function getLeadSummary(leadId) {
  return get(`/leads/${leadId}/summary`);
}

/**
 * 获取经纪人的线索列表
 * @param {number} brokerId - 经纪人ID
 * @param {number} page - 页码
 * @param {number} limit - 每页数量
 */
function getBrokerLeads(brokerId, page = 1, limit = 20) {
  return get(`/broker/leads?brokerId=${brokerId}&page=${page}&limit=${limit}`);
}

module.exports = {
  createLead,
  getLeadSummary,
  getBrokerLeads,
};

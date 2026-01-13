// services/teacher.js
const { get } = require('../utils/request');

/**
 * 获取讲师主页信息
 * @param {number} teacherId - 讲师ID
 * @param {number} brokerId - 经纪人ID (可选)
 */
function getTeacherHome(teacherId, brokerId) {
  let url = `/teachers/${teacherId}/home`;
  if (brokerId) {
    url += `?brokerId=${brokerId}`;
  }
  return get(url);
}

/**
 * 获取讲师详情
 * @param {number} teacherId - 讲师ID
 */
function getTeacherDetail(teacherId) {
  return get(`/teachers/${teacherId}`);
}

/**
 * 获取讲师的线索列表
 * @param {number} teacherId - 讲师ID
 * @param {number} page - 页码
 * @param {number} limit - 每页数量
 */
function getTeacherLeads(teacherId, page = 1, limit = 20) {
  return get(`/teacher/leads?teacherId=${teacherId}&page=${page}&limit=${limit}`);
}

module.exports = {
  getTeacherHome,
  getTeacherDetail,
  getTeacherLeads,
};

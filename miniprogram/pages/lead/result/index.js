// pages/lead/result/index.js
const { getLeadSummary } = require('../../../services/lead');
const { createExportJob, pollExportStatus } = require('../../../services/export');

Page({
  data: {
    leadId: null,
    
    // 摘要数据
    leaderSummary: '',
    teacherSummary: '',
    clarifyingQuestions: [],
    coverageScore: 0,
    
    // 显示模式
    summaryMode: 'leader', // leader | teacher
    
    // 加载状态
    loading: true,
    
    // PDF导出状态
    exporting: false,
    exportProgress: '',
  },

  onLoad(options) {
    const { leadId, leaderSummary } = options;
    
    if (!leadId) {
      wx.showToast({ title: '参数错误', icon: 'error' });
      return;
    }

    this.setData({
      leadId: parseInt(leadId, 10),
      leaderSummary: leaderSummary ? decodeURIComponent(leaderSummary) : '',
    });

    this.loadSummary();
  },

  /**
   * 加载完整摘要
   */
  async loadSummary() {
    const { leadId } = this.data;

    try {
      const result = await getLeadSummary(leadId);

      this.setData({
        leaderSummary: result.leaderSummary,
        teacherSummary: result.teacherSummary,
        clarifyingQuestions: result.clarifyingQuestions || [],
        coverageScore: result.coverageScore,
        loading: false,
      });
    } catch (error) {
      console.error('加载摘要失败', error);
      wx.showToast({ title: '加载失败', icon: 'none' });
      this.setData({ loading: false });
    }
  },

  /**
   * 切换摘要模式
   */
  onSwitchMode(e) {
    const { mode } = e.currentTarget.dataset;
    this.setData({ summaryMode: mode });
  },

  /**
   * 导出PDF
   */
  async onExportPdf() {
    const { leadId, exporting } = this.data;
    
    if (exporting) return;

    this.setData({ 
      exporting: true,
      exportProgress: '正在生成PDF...',
    });

    try {
      // 创建导出任务
      const { jobId } = await createExportJob(leadId);

      // 轮询任务状态
      const result = await pollExportStatus(
        jobId,
        (status) => {
          if (status.status === 'RUNNING') {
            this.setData({ exportProgress: '正在生成PDF...' });
          }
        },
      );

      // 下载PDF
      if (result.resultUrl) {
        this.setData({ exportProgress: '正在下载...' });
        
        wx.downloadFile({
          url: result.resultUrl,
          success: (res) => {
            if (res.statusCode === 200) {
              // 打开文档
              wx.openDocument({
                filePath: res.tempFilePath,
                fileType: 'pdf',
                success: () => {
                  wx.showToast({ title: '打开成功', icon: 'success' });
                },
                fail: () => {
                  wx.showToast({ title: '打开失败', icon: 'error' });
                },
              });
            }
          },
          fail: () => {
            wx.showToast({ title: '下载失败', icon: 'error' });
          },
        });
      }
    } catch (error) {
      console.error('导出失败', error);
      wx.showToast({ title: error.message || '导出失败', icon: 'none' });
    } finally {
      this.setData({ 
        exporting: false,
        exportProgress: '',
      });
    }
  },

  /**
   * 返回首页
   */
  onBackHome() {
    wx.navigateBack({
      delta: 10, // 返回多层
      fail: () => {
        wx.reLaunch({ url: '/pages/teacher/home/index' });
      },
    });
  },

  /**
   * 分享
   */
  onShareAppMessage() {
    return {
      title: '我的需求分析报告',
      path: `/pages/lead/result/index?leadId=${this.data.leadId}`,
    };
  },
});

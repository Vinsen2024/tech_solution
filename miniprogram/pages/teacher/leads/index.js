// pages/teacher/leads/index.js
const { getTeacherLeads } = require('../../../services/teacher');
const { ensureLoggedIn } = require('../../../services/auth');

Page({
  data: {
    teacherId: null,
    leads: [],
    loading: true,
    refreshing: false,
    page: 1,
    hasMore: true,
  },

  onLoad(options) {
    const { teacherId } = options;
    
    if (!teacherId) {
      wx.showToast({ title: '参数错误', icon: 'error' });
      return;
    }

    this.setData({
      teacherId: parseInt(teacherId, 10),
    });
  },

  async onShow() {
    await this.loadLeads();
  },

  /**
   * 下拉刷新
   */
  async onPullDownRefresh() {
    this.setData({ 
      refreshing: true,
      page: 1,
      hasMore: true,
    });
    
    await this.loadLeads(true);
    
    wx.stopPullDownRefresh();
    this.setData({ refreshing: false });
  },

  /**
   * 上拉加载更多
   */
  async onReachBottom() {
    if (!this.data.hasMore || this.data.loading) return;
    
    this.setData({ page: this.data.page + 1 });
    await this.loadLeads(false, true);
  },

  /**
   * 加载线索列表
   */
  async loadLeads(refresh = false, loadMore = false) {
    const { teacherId, page, leads } = this.data;

    try {
      await ensureLoggedIn();
      
      this.setData({ loading: true });

      const result = await getTeacherLeads(teacherId, refresh ? 1 : page);

      if (refresh || !loadMore) {
        this.setData({ leads: result });
      } else {
        this.setData({ leads: [...leads, ...result] });
      }

      // 判断是否还有更多
      if (result.length < 20) {
        this.setData({ hasMore: false });
      }

    } catch (error) {
      console.error('加载线索失败', error);
      wx.showToast({ title: '加载失败', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },

  /**
   * 查看线索详情
   */
  onViewLead(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/lead/result/index?leadId=${id}`,
    });
  },

  /**
   * 获取状态标签
   */
  getStatusLabel(status) {
    const statusMap = {
      NEW: '新线索',
      CONTACTED: '已联系',
      QUALIFIED: '已确认',
      CLOSED: '已关闭',
    };
    return statusMap[status] || status;
  },

  /**
   * 格式化时间
   */
  formatTime(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`;
    
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  },
});

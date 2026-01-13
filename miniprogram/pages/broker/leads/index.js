// pages/broker/leads/index.js
const { getBrokerLeads } = require('../../../services/lead');
const { ensureLoggedIn } = require('../../../services/auth');

Page({
  data: {
    brokerId: null,
    leads: [],
    loading: true,
    refreshing: false,
    page: 1,
    hasMore: true,
  },

  onLoad(options) {
    const { brokerId } = options;
    
    if (!brokerId) {
      wx.showToast({ title: '参数错误', icon: 'error' });
      return;
    }

    this.setData({
      brokerId: parseInt(brokerId, 10),
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
    const { brokerId, page, leads } = this.data;

    try {
      await ensureLoggedIn();
      
      this.setData({ loading: true });

      const result = await getBrokerLeads(brokerId, refresh ? 1 : page);

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
});

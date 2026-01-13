// pages/lead/intent/index.js
Page({
  data: {
    teacherId: null,
    
    // 四选一的意图选项
    intentOptions: [
      {
        id: 'training',
        icon: '📚',
        title: '企业培训',
        desc: '为团队定制培训课程',
      },
      {
        id: 'consulting',
        icon: '💡',
        title: '咨询服务',
        desc: '获取专业咨询建议',
      },
      {
        id: 'keynote',
        icon: '🎤',
        title: '演讲邀请',
        desc: '邀请讲师进行演讲',
      },
      {
        id: 'other',
        icon: '✨',
        title: '其他需求',
        desc: '有其他合作意向',
      },
    ],
  },

  onLoad(options) {
    const { teacherId } = options;
    
    if (!teacherId) {
      wx.showToast({ title: '参数错误', icon: 'error' });
      wx.navigateBack();
      return;
    }

    this.setData({
      teacherId: parseInt(teacherId, 10),
    });
  },

  /**
   * 选择意图
   */
  onSelectIntent(e) {
    const { intent } = e.currentTarget.dataset;
    const { teacherId } = this.data;

    // 跳转到需求输入页面
    wx.navigateTo({
      url: `/pages/lead/form/index?teacherId=${teacherId}&intent=${intent}`,
    });
  },
});

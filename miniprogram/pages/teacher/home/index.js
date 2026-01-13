// pages/teacher/home/index.js
const { resolveAttribution, getCurrentAttribution } = require('../../../services/attribution');
const { getTeacherHome } = require('../../../services/teacher');
const { ensureLoggedIn } = require('../../../services/auth');

Page({
  data: {
    loading: true,
    teacherId: null,
    shareId: null,
    scene: null,
    
    // 讲师信息
    teacher: null,
    modules: [],
    
    // 归因信息
    attribution: null,
    contactInfo: null, // 显示的联系方式（讲师或经纪人）
  },

  /**
   * 页面加载
   * 硬约束 6.1: 归因触发时机 - onLoad
   */
  async onLoad(options) {
    const { teacherId, share_id, scene } = options;
    
    if (!teacherId) {
      wx.showToast({ title: '参数错误', icon: 'error' });
      return;
    }

    this.setData({
      teacherId: parseInt(teacherId, 10),
      shareId: share_id || null,
      scene: scene || null,
    });

    await this.initPage();
  },

  /**
   * 页面显示
   * 硬约束 6.1: 归因触发时机 - onShow
   */
  async onShow() {
    // 如果已有 teacherId，重新解析归因
    if (this.data.teacherId && !this.data.loading) {
      await this.resolveAndUpdateAttribution();
    }
  },

  /**
   * 初始化页面
   */
  async initPage() {
    try {
      this.setData({ loading: true });

      // 1. 确保已登录
      await ensureLoggedIn();

      // 2. 解析归因
      await this.resolveAndUpdateAttribution();

      // 3. 获取讲师主页信息
      await this.loadTeacherHome();

    } catch (error) {
      console.error('初始化页面失败', error);
      wx.showToast({ title: error.message || '加载失败', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },

  /**
   * 解析并更新归因
   */
  async resolveAndUpdateAttribution() {
    const { teacherId, shareId, scene } = this.data;

    const attribution = await resolveAttribution(teacherId, shareId, scene);
    
    this.setData({ attribution });
  },

  /**
   * 加载讲师主页信息
   */
  async loadTeacherHome() {
    const { teacherId, attribution } = this.data;
    const brokerId = attribution?.brokerId;

    const homeData = await getTeacherHome(teacherId, brokerId);

    // 硬约束 6.3: 联系人显示规则
    let contactInfo;
    if (attribution?.brokerId && attribution?.brokerInfo) {
      // 有经纪人归因 -> 显示经纪人联系方式
      contactInfo = {
        type: 'broker',
        name: attribution.brokerInfo.name,
        avatar: attribution.brokerInfo.avatar,
        ...attribution.brokerInfo.contactInfo,
      };
    } else if (homeData.teacher.contactInfo) {
      // 无经纪人归因 -> 显示讲师联系方式
      contactInfo = {
        type: 'teacher',
        name: homeData.teacher.name,
        avatar: homeData.teacher.avatar,
        ...homeData.teacher.contactInfo,
      };
    }

    this.setData({
      teacher: homeData.teacher,
      modules: homeData.modules,
      contactInfo,
    });
  },

  /**
   * 点击 CTA 按钮
   */
  onCtaClick() {
    const { teacherId, attribution } = this.data;

    // 跳转到意图选择页面
    wx.navigateTo({
      url: `/pages/lead/intent/index?teacherId=${teacherId}`,
    });
  },

  /**
   * 拨打电话
   */
  onCallPhone() {
    const { contactInfo } = this.data;
    if (contactInfo?.phone) {
      wx.makePhoneCall({
        phoneNumber: contactInfo.phone,
      });
    }
  },

  /**
   * 复制微信号
   */
  onCopyWechat() {
    const { contactInfo } = this.data;
    if (contactInfo?.wechat) {
      wx.setClipboardData({
        data: contactInfo.wechat,
        success() {
          wx.showToast({ title: '微信号已复制', icon: 'success' });
        },
      });
    }
  },

  /**
   * 分享
   */
  onShareAppMessage() {
    const { teacherId, teacher, attribution } = this.data;
    
    return {
      title: teacher?.name ? `${teacher.name} - AI讲师` : 'AI讲师',
      path: `/pages/teacher/home/index?teacherId=${teacherId}${attribution?.shareId ? `&share_id=${attribution.shareId}` : ''}`,
    };
  },
});

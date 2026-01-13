// pages/lead/form/index.js
const { createLead } = require('../../../services/lead');
const { getCurrentAttribution } = require('../../../services/attribution');

// 订阅消息模板ID（需要在小程序后台申请后替换）
const SUBSCRIBE_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';

Page({
  data: {
    teacherId: null,
    intent: null,
    
    // 输入方式
    inputType: 'text', // text | voice | select
    
    // 文本输入
    textContent: '',
    
    // 语音输入
    isRecording: false,
    voiceUrl: null,
    voiceDuration: 0,
    
    // 快捷选项
    quickOptions: [
      '希望了解培训课程内容',
      '需要定制化培训方案',
      '想了解讲师的过往案例',
      '咨询培训费用和时间',
    ],
    selectedOptions: [],
    
    // 提交状态
    submitting: false,
  },

  onLoad(options) {
    const { teacherId, intent } = options;
    
    if (!teacherId || !intent) {
      wx.showToast({ title: '参数错误', icon: 'error' });
      wx.navigateBack();
      return;
    }

    this.setData({
      teacherId: parseInt(teacherId, 10),
      intent,
    });
  },

  /**
   * 切换输入方式
   */
  onSwitchInputType(e) {
    const { type } = e.currentTarget.dataset;
    this.setData({ inputType: type });
  },

  /**
   * 文本输入变化
   */
  onTextInput(e) {
    this.setData({ textContent: e.detail.value });
  },

  /**
   * 开始录音
   */
  onStartRecord() {
    const recorderManager = wx.getRecorderManager();
    
    recorderManager.onStart(() => {
      this.setData({ isRecording: true });
    });

    recorderManager.onStop((res) => {
      this.setData({
        isRecording: false,
        voiceUrl: res.tempFilePath,
        voiceDuration: Math.ceil(res.duration / 1000),
      });
    });

    recorderManager.onError((err) => {
      console.error('录音失败', err);
      this.setData({ isRecording: false });
      wx.showToast({ title: '录音失败', icon: 'error' });
    });

    recorderManager.start({
      duration: 60000, // 最长60秒
      format: 'mp3',
    });
  },

  /**
   * 停止录音
   */
  onStopRecord() {
    const recorderManager = wx.getRecorderManager();
    recorderManager.stop();
  },

  /**
   * 播放录音
   */
  onPlayVoice() {
    const { voiceUrl } = this.data;
    if (!voiceUrl) return;

    const innerAudioContext = wx.createInnerAudioContext();
    innerAudioContext.src = voiceUrl;
    innerAudioContext.play();
  },

  /**
   * 删除录音
   */
  onDeleteVoice() {
    this.setData({
      voiceUrl: null,
      voiceDuration: 0,
    });
  },

  /**
   * 选择快捷选项
   */
  onSelectOption(e) {
    const { option } = e.currentTarget.dataset;
    const { selectedOptions } = this.data;
    
    const index = selectedOptions.indexOf(option);
    if (index > -1) {
      selectedOptions.splice(index, 1);
    } else {
      selectedOptions.push(option);
    }
    
    this.setData({ selectedOptions: [...selectedOptions] });
  },

  /**
   * 提交需求
   * 硬约束 10: 在提交前请求订阅消息授权
   */
  async onSubmit() {
    const { teacherId, intent, inputType, textContent, voiceUrl, selectedOptions, submitting } = this.data;

    if (submitting) return;

    // 验证输入
    if (inputType === 'text' && !textContent.trim()) {
      wx.showToast({ title: '请输入您的需求', icon: 'none' });
      return;
    }
    if (inputType === 'voice' && !voiceUrl) {
      wx.showToast({ title: '请录制语音', icon: 'none' });
      return;
    }
    if (inputType === 'select' && selectedOptions.length === 0) {
      wx.showToast({ title: '请选择至少一个选项', icon: 'none' });
      return;
    }

    // 请求订阅消息授权
    this.requestSubscribeMessage();

    // 提交线索
    await this.submitLead();
  },

  /**
   * 请求订阅消息授权
   */
  requestSubscribeMessage() {
    wx.requestSubscribeMessage({
      tmplIds: [SUBSCRIBE_TEMPLATE_ID],
      success(res) {
        console.log('订阅消息授权结果', res);
      },
      fail(err) {
        console.log('订阅消息授权失败', err);
      },
    });
  },

  /**
   * 提交线索
   */
  async submitLead() {
    const { teacherId, intent, inputType, textContent, voiceUrl, selectedOptions } = this.data;

    this.setData({ submitting: true });

    try {
      // 构建输入数据
      let input;
      if (inputType === 'text') {
        input = { type: 'text', content: textContent };
      } else if (inputType === 'voice') {
        // TODO: 上传语音文件获取URL
        input = { type: 'voice', content: '语音消息', voiceUrl };
      } else {
        input = { type: 'select', content: selectedOptions.join('；'), selections: selectedOptions };
      }

      // 获取归因信息 (硬约束 7)
      const attribution = getCurrentAttribution(teacherId);

      // 创建线索
      const result = await createLead({
        teacherId,
        intent,
        input,
        attribution: attribution ? {
          brokerId: attribution.brokerId,
          shareId: attribution.shareId,
        } : undefined,
      });

      // 跳转到结果页面
      wx.redirectTo({
        url: `/pages/lead/result/index?leadId=${result.leadId}&leaderSummary=${encodeURIComponent(result.leaderSummary)}`,
      });

    } catch (error) {
      console.error('提交失败', error);
      wx.showToast({ title: error.message || '提交失败', icon: 'none' });
    } finally {
      this.setData({ submitting: false });
    }
  },
});

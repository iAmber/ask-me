<template>
  <div class="home">
    <!-- <div class="header">
      <img src="../assets/img/ic_actionbar_menu_close.png"/>
      <div class="content">
        <div>tap to reply</div>
        <div>tap to reply</div>
      </div>
      <img src="../assets/img/ic_actionbar_menu.png"/>
    </div> -->
    <div class="container">
      <div class="title">{{ $t('title') }}</div>
      <div class="desc">{{ $t('desc') }}</div>
      <div class="typing-erea">
        <div class="avatar">
          <img :src="userInfo.avatarUrl"/>
        </div>
        <div class="name">{{userInfo.nick}}</div>
        <div class="typing-desc">{{ $t('typingDesc') }}</div>
        <div class="slide"/>
        <textarea v-model="answer"
          class="typing-text" :placeholder="$t('tapText')" maxlength="1000"/>
      </div>
      <button class="btn send-btn" :class="{'disabled': isDisabled}"
              :disabled="isDisabled" @click="submitQuestion"
      >{{ $t('send') }}</button>
      <div class="opera-text">{{ $t('opera') }}</div>
      <div class="sticky-area">
        <span class="btn make-btn"  @click="toAppStore">{{ $t('make') }}</span>
      </div>
      <div class="slide-area">{{ $t('slide') }}</div>
      <div class="conversation-list">
        <div class="conversation-item" v-for="(item, index) in question_list" :key="index">
          <div class="question">
            <div class="text">{{ item.question.content.textContent.message }}</div>
          </div>
          <div class="answer">
            <div class="text">{{ item.answer.content.textContent.message }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
import Toast from 'vant/lib/toast';
import 'vant/lib/toast/style';
import axios from 'axios';
import { logEvent } from 'firebase/analytics';
import Conf from '../common/config';

export default {
  name: 'Home',
  components: {
  },
  data() {
    return {
      userInfo: {
        avatarUrl: '',
        nick: '',
        id: '',
      },
      answer: '',
      submiting: false,
      highlightUrl: 'https://play.google.com/store/apps/details?id=mobi.highlight.app',
      question_list: [],
    };
  },

  methods: {
    async submitQuestion() {
      const sentText = this.$t('sent');
      const errorText = this.$t('error');
      this.submiting = true;
      let resultStatus = 'fail';
      try {
        const { data, status } = await axios.post(`${Conf.BASE_URL}/highlight.gateway.sendit.SendItService/SubmitQuestion`, {
          question: {
            content: {
              text_content: {
                message: this.answer,
              },
            },
            question_box_id: this.questionId,
          },
        });
        if (status === 200 && data.question && data.question.questionId) {
          Toast.success(sentText);
          this.answer = '';
          resultStatus = 'success';
        } else {
          Toast.fail(errorText);
        }
      } catch (e) {
        console.log(e);
        Toast.fail(errorText);
      }
      logEvent(this.analytics, 'ask_me_send', {
        source: this.source,
        status: resultStatus,
        type: 'click',
      });
      this.submiting = false;
    },
    toAppStore() {
      logEvent(this.analytics, 'ask_me_make_own', {
        source: this.source,
        type: 'click',
      });
      setTimeout(() => {
        window.location.href = this.highlightUrl;
      }, 100);
    },
    async getAnsweredQuestionsOfQuestionBox(id) {
      const errorText = this.$t('error');
      try {
        const { data, status } = await axios.post(`${Conf.BASE_URL}/highlight.gateway.sendit.SendItService/GetAnsweredQuestionsOfQuestionBox`, {
          question_box_id: id,
        });
        console.log(data, status);
        const { answeredQuestions = [], questionBox = {} } = data;
        this.userInfo = {
          ...(questionBox.user || {}),
        };
        this.question_list = answeredQuestions;
      } catch (e) {
        console.log(e);
        Toast.fail(errorText);
      }
    },
  },
  computed: {
    isDisabled() {
      return !this.answer?.trim() || this.submiting;
    },
    questionId() {
      const { id } = this.$route.query;
      return id ? String(id) : '';
    },
    source() {
      const { source } = this.$route.query;
      return source || 'unknown';
    },
  },
  async mounted() {
    logEvent(this.analytics, 'ask_me_page', {
      source: this.source,
      type: 'click',
    });
    await this.getAnsweredQuestionsOfQuestionBox(this.questionId);
  },
};
</script>
<style>
html, body {
  margin: 0;
  padding: 0;
  background: rgba(0,0,0,0.70);
}
.home {
  height: 100%;
  background: #FFFFFF;
  box-shadow: 0 -4px 6px 0 rgba(0,0,0,0.10);
  border-radius: 15px 15px 0 0;

  background: url(../assets/img/wallpaper_askme_style01.png);
  background-position: left top;
  background-size: contain;
  background-repeat: no-repeat;
  background-color: #313286;
}
.header {
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 52px;
  padding: 0 12px;
  box-sizing: border-box;
  align-items: center;
  background-color: #fff;
  border-radius: 15px 15px 0 0;
}
.header img {
  width: 30px;
  height: 30px;
}
.header .content {
  flex: 1;
  text-align: center;
}
.container {
  width: 100%;
  min-height: 100vh;
  padding: 31px 27px;
  color: #FFFFFF;
  text-align: left;
  box-sizing: border-box;

}
.container .title {
  font-family: Roboto-Bold;
  font-size: 24px;
  color: #FFFFFF;
  font-weight: 700;
  height: 28px;
  line-height: 28px;
  margin-bottom: 4px;
}
.container .desc {
  font-family: Roboto-Bold;
  font-size: 13px;
  color: #FFFFFF;
  font-weight: 700;
  margin-bottom: 49px;
  height: 17px;
  line-height: 17px;
}
/* typing-erea */
.typing-erea {
  position: relative;
  background: #FFFFFF;
  box-shadow: 0 4px 10px 0 rgba(0,0,0,0.25);
  border-radius: 16px;
}
.typing-erea .avatar {
  position: absolute;
  width: 70px;
  height: 70px;
  background-color: #fff;
  border: 5px solid #fff;
  border-radius: 50%;
  top: -25px;
  left: 50%;
  transform: translateX(-50%);
}

.typing-erea .avatar img{
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 0;
}
.typing-erea .name{
  font-family: Roboto-Bold;
  font-size: 16px;
  color: #000000;
  text-align: center;
  font-weight: 700;
  padding-top: 58px;
  margin-bottom: 12px;
}
.typing-erea .typing-desc {
  font-family: Roboto-Medium;
  font-size: 12px;
  color: #000000;
  text-align: center;
  font-weight: 500;
  margin-bottom: 6px;
  height: 20px;
  line-height: 20px;
}
.typing-erea .slide {
  width: 100%;
  height: 1px;
  margin: 0 15px 0 11px;
  width: calc(100% - 26px);
  box-sizing: border-box;
  background-color: #EAEAEA;
}
.typing-erea .typing-text {
  background-color: #F0F0F0;
  padding: 16px;
  margin: 12px 18px 34px;
  border: 0;
  border-radius: 16px;
  box-sizing: border-box;
  width: calc(100% - 36px);
  height: 114px;
  font-family: Rubik-Regular;
  -webkit-tap-highlight-color: transparent;
  resize: none;
  color: #000000;
  outline: none;
}
.typing-erea .typing-text:focus {
  border: none;
  outline: none;
}

/* placeholder-style */
textarea.typing-text::-webkit-input-placeholder {
  text-align: center;
  line-height: 82px;
  /* letter-spacing: 0.25px; */
}
textarea.typing-text:-moz-placeholder {
  text-align: center;
  line-height: 82px;
}
textarea.typing-text::-moz-placeholder {
  text-align: center;
  line-height: 82px;
}
textarea.typing-text:-ms-input-placeholder {
  text-align: center;
  line-height: 82px;
}
/* btn */

.container .btn {
  display: block;
  border: none;
  font-family: Roboto-Bold;
  font-size: 16px;
  color: #FFFFFF;
  text-align: center;
  font-weight: 700;
  width: 200px;
  height: 48px;
  line-height: 48px;
  margin: 0 auto;
}

/* .container .btn:active {
  opacity: 0.85;
} */
.container .send-btn:active {
  background-color: rgba(36, 211, 160, 0.85);
}
.container .make-btn:active {
  background-color: rgba(94, 96, 227, 0.85);
}
.container .btn.disabled {
  background-color: #F0F0F0;
  /* opacity: 0.5; */
  cursor: not-allowed;
}

.container .send-btn {
  margin-top: 19px;
  background: #24D3A0;
  box-shadow: 0 6px 25px 0 rgba(0,0,0,0.21);
  border-radius: 24px;
}
.container .make-btn {
  text-decoration: none;
  background: #5E60E3;
  box-shadow: 0 6px 25px 0 rgba(0,0,0,0.21);
  border-radius: 24px;
  margin-bottom: 24px;
}
.container .opera-text {
  font-family: Roboto-Bold;
  font-size: 12px;
  color: #FFFFFF;
  letter-spacing: 0;
  text-align: center;
  font-weight: 700;
  margin: 3px auto 6px;
  height: 23px;
  line-height: 23px;
}

/* sticky-area */
.sticky-area {
  position: sticky;
  position: -webkit-sticky;
  top: 23px;
  width: 100%;
  z-index: 10;
}
.container .slide-area {
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: Roboto-Bold;
  font-size: 13px;
  color: #FFFFFF;
  text-align: center;
  font-weight: 700;
  margin-bottom: 21px;
}
.container .slide-area::before, .container .slide-area::after {
  display: block;
  content: '';
  width: 22px;
  height: 1px;
  background-color: #fff;
}
.container .slide-area::before {
  margin-right: 9px;
}
.container .slide-area::after {
  margin-left: 9px;
}
/* conversation-list */
.conversation-item {
  margin-bottom: 16px;
  padding: 18.57px 0;
  box-sizing: border-box;
  background: #FFFFFF;
  border-radius: 16px;
  box-shadow: 0 4px 10px 0 rgba(0,0,0,0.25);
}
.conversation-item .question, .conversation-item .answer {
  min-height: 64px;
  box-sizing: content-box;
  font-family: Rubik-Medium;
  font-size: 15px;
  text-align: center;
  font-weight: 400;
  background-position: center;
  background-size: 100%;
  background-repeat: no-repeat;
  display: flex;
  align-items: center;
  padding: 0 18px 12px ;
}

.conversation-item .text {
  justify-content: center;
  display: flex;
  align-items: center;
  overflow-wrap: anywhere;
  min-height: 64px;
  background: #f0f0f0;
  padding: 19.06px 15px;
  width: 100%;
  border-radius: 14px;
  position: relative;
}

.conversation-item .text::before{
  position: absolute;
  top: 20px;
  left: -10px;
  width: 0;
  height: 0;
  content: ' ';
  display: block;
  border-top: 8px solid transparent;
  border-right: 10px solid #f0f0f0;
  border-bottom: 8px solid transparent;
}

.conversation-item .answer .text::before{
  left: auto;
  right: -10px;
  border-left: 10px solid #5d63db;
  border-right: 0;
}

.conversation-item .answer .text {
  background: #5d63db;
  text-align: right;
}

.conversation-item .question {
  color: #000000;
  /*padding: 19.06px 15px 19.06px 23.55px;*/
}
.conversation-item .answer {
  color: #FFFFFF;
}
</style>

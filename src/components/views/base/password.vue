<template lang="pug">
#passwordDialog
  NvDialog(
    :visible.sync="visible"
    :title="i18n.getTrans('dialog', 'Change password')"
    :footerConfig="footerConfig"
    width="450px"
    :canClose="true"
    @open="open"
    @close="close"
    height="auto")
    NvForm( :labelWidth="100" )
      NvFormItem()
        .labels {{ i18n.getTrans('inputLabel', 'Old Password') }}
        input.passwordInput(v-model="oldPassword" :placeholder="i18n.getTrans('dialog', 'Please enter the old password')" type="password" autocomplete="off")
      NvFormItem()
        .labels {{ i18n.getTrans('inputLabel', 'New Password') }}
        input.passwordInput(v-model="password" @blur="passwordBlur" @input="passwordInput" :placeholder="i18n.getTrans('dialog', 'Please enter a new password')"  type="password" autocomplete="off")
      NvFormItem()
        .labels {{ i18n.getTrans('inputLabel', 'Confirm') }}
        input.passwordInput(v-model="confirmPassword" :placeholder="i18n.getTrans('dialog', 'Confirm the new login password')"  type="password" autocomplete="off")
      //NvFormItem(label="处理人" v-model="formData.resource" type="select" :options="resourceOptions")
      //NvFormItem(label="开始日期" v-model="formData.startDate" type="datetime" :placeholder="i18n.getTrans('dialog', 'Select date and time')")
      //NvFormItem(label="结束日期" v-model="formData.endDate" type="datetime" :placeholder="i18n.getTrans('dialog', 'Select date and time')")
      //NvFormItem(label="优先级" v-model="formData.priority" type="select" :options="priorityOptions")
      //NvFormItem(label="备注" :height="120" v-model="formData.description" type="inputArea" :placeholder="i18n.getTrans('notice', 'Please enter a description')")
    .message-area
      //- .message-label 密码复杂性规则：
      .message-right
        p.message {{ i18n.getTrans('dialog', 'The password should be 8-20 digits long and must contain at least 3 types of uppercase and lowercase letters, numbers and symbols') }}
        //- p.message 2.
    p.error(v-if="passwordRule") ！ {{ i18n.getTrans('dialog', 'The new password does not meet the password specification') }}
    p.error(v-if="password!==''&&confirmPassword!==''&&(password!==confirmPassword)") ！ {{ i18n.getTrans('dialog', 'Entering the new password twice is not the same') }}
    p.error(v-for="err in resultError") ！ {{err}}
</template>

<script>
import logOutChannel from '@/utils/BroadcastChannel.js'
import { Component, Vue } from 'vue-property-decorator'
import i18n from '@/i18n';
import NvDialog from './dialog'
import NvForm from './form'
import NvFormItem from './formItem'
import axios from '@/components/request/nvisualApi'
import utils from '@/utils'
@Component({
  components: {
    NvDialog,
    NvForm,
    NvFormItem
  }
})
export default class TaskDialog extends Vue {
  i18n = i18n
  footerConfig={
    buttons: [
      {
        label: i18n.getTrans('button', 'Cancel'),
        click: () => {
          this.close()
        },
        key: 'Escape',
        bgColor: '#ffffff',
        color: '#676767',
        borderColor: '#D7D9DE'
      },
      {
        label: i18n.getTrans('button', 'Confirm'),
        click: () => {
          this.submit()
        },
        key: 'Enter',
        bgColor: ''
      },
    ],
    align: 'center'
  }

  visible=false
  oldPassword=''
  passwordRule = false
  password=''
  confirmPassword=''
  resultError=[]
  close() {
    this.visible = false
    this.oldPassword = ''
    this.password = ''
    this.confirmPassword = ''
    this.resultError = []
  }

  submit() {
    if (this.oldPassword && this.password && this.confirmPassword) {
      if (this.password === this.oldPassword) {
        this.resultError = [i18n.getTrans('dialog', 'The old and new passwords are the same')]
        return
      }
      if (this.passwordRule) {
        if (!this.passwordRule) {
          this.resultError = [i18n.getTrans('dialog', 'The new password does not conform to the Settings specification')]
        }
        return
      }
      if (this.password !== this.confirmPassword) {
        return
      }
      axios.axios.put('/v1/users/modify_password', {
        old: this.oldPassword,
        new: this.password
      }).then(({ data }) => {
        const { code } = data
        if (code === 200) {
          this.$storage.local.removeItem('token')
          logOutChannel.logOutChannel.postMessage('false')
          setTimeout(() => {
            utils.openPage('/access.html')
          });
        } else {
          this.password = ''
          this.oldPassword = ''
          this.confirmPassword = ''
          this.$WP(i18n.getTrans('dialog', 'The old password is wrong, please try again!'))
        }
      })
    } else {
      this.resultError = [i18n.getTrans('dialog', 'Please check that the form is complete')]
    }
  }

  open() {
    if (this.$theme) {
      this.passwordRule = false;
      this.$theme.getModuleTheme('password')
    }
  }

  passwordBlur () {
    const password = /^(?![a-zA-Z]+$)(?![A-Z0-9]+$)(?![A-Z\W_]+$)(?![a-z0-9]+$)(?![a-z\W_]+$)(?![0-9\W_]+$)[a-zA-Z0-9\W_]{8,20}$/
    if (this.password) {
      if (password.test(this.password)) {
        this.passwordRule = false;
      } else {
        this.passwordRule = true;
      }
    } else {
      this.passwordRule = false;
    }
  }

  passwordInput () {
    this.passwordRule = false;
  }

  mounted() {
    this.open()
  }
}
</script>

<style scoped lang="stylus">
#passwordDialog{
  .nvFormItem{
    margin-bottom 12.5px;
  }
  >>>.itemBody{
    justify-content: center;
    .labels{
      font-size: 12px;
      font-weight: normal;
      line-height: 28px;
      letter-spacing: 0px;
      color: #3D4757;
      width: 105px;
      text-align right
    }
    .passwordInput{
      width: 197.81px;
      height: 28.06px;
      border-radius: 2px;
      background: #FFFFFF;
      box-sizing: border-box;
      border: 1px solid #E0E4EB;
      margin-left: 12px;
      margin-right: -11px;
      padding: 0px 9px;
      box-sizing: border-box;
      font-size: 12px;
    }
  }
}

.message-area{
  display: flex;
  justify-content: center;
  margin-bottom 10px;
  .message-label{
    font-size: 10px;
    font-weight: normal;
    line-height: 18px;
    letter-spacing: 0px;
    color: #939393;
    margin-right: 5px;
  }
  .message-right{
    width: 320px;
    .message{
      font-size: 12px;
      font-weight: bold;
      text-align: left;
      font-size: 10px;
      font-weight: normal;
      line-height: 18px;
      letter-spacing: 0px;
      color: #939393;
    }
  }
}

.error
  font-size 12px
  font-weight bold
  text-align left
  margin 2px 30px
</style>

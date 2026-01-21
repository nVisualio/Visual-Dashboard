<template lang="pug">
#languageDialog
  NvDialog(
    :visible.sync="visible"
    :title="i18n.getTrans('dialog', 'Language modification')"
    :footerConfig="footerConfig"
    width="400px"
    :canClose="true"
    height="auto")
    NvForm( :labelWidth="100" )
      .tr
        .label {{ i18n.getTrans('dialog', 'Language') }}
        NvFormItem(v-model="language" :options="options" type="select")
</template>

<script>
import { Component, Vue } from 'vue-property-decorator'
import logOutChannel from '@/utils/BroadcastChannel.js'
import NvDialog from './dialog'
import NvForm from './form'
import NvFormItem from './formItem'
import i18n from '@/i18n';
import languageLocales from '@/model/languageLocales/index.js';
@Component({
  components: {
    NvDialog,
    NvForm,
    NvFormItem
  }
})
export default class TaskDialog extends Vue {
  i18n = i18n
  visible=false
  language = this.$storage.local.getItem('language') ?? 'zh-cn'
  options=[
    {
      label: '中文',
      value: 'zh-cn'
    },
    {
      label: 'English',
      value: 'en'
    }
  ]

  footerConfig={
    buttons: [
      {
        label: i18n.getTrans('button', 'Cancel'),
        click: () => {
          this.close()
        },
        key: 'Escape',
        bgColor: '#ffffff',
        color: '#000000',
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

  close() {
    this.visible = false
  }

  async submit() {
    let simpleLanguage = null;
    if (this.language.indexOf('-') > -1) {
      simpleLanguage = this.language.substring(0, this.language.indexOf('-'));
    } else {
      simpleLanguage = this.language;
    }
    await languageLocales.updateGlobalSettingLanguage(simpleLanguage);
    this.$storage.local.setItem('language', this.language)
    logOutChannel.languageChannel.postMessage(this.language)
    location.reload()
  }
}
</script>

<style scoped lang="stylus">
#languageDialog{
  >>>.img{
    flex 1 0 0
    svg{
      height 40px!important
      width 40px!important
    }
  }
  >>>.tr{
    display: flex;
    align-items: center;
    justify-content: center;
    .label{
      font-size: 12px;
      font-weight: normal;
      line-height: 28px;
      letter-spacing: 0px;
      color: #3D4757;
      margin-right 15px
    }
    .nvFormItem{
      height: 31px !important;
      border-radius: 2px;
      background: #FFFFFF;
      box-sizing: border-box;
      // border: 1px solid #E0E4EB;
    }
  }
}

</style>

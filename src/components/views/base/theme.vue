<template lang="pug">
#themeDialog
  NvDialog(
    :visible.sync="visible"
    :title="i18n.getTrans('dialog', ' Theme modification')"
    :footerConfig="footerConfig"
    width="400px"
    :canClose="true"
    height="auto")
    NvForm( :labelWidth="100" )
      .tr
        .label {{i18n.getTrans('dialog', ' Theme style')}}
        NvFormItem(v-model="theme" :options="options" type="select")
</template>

<script>
import { Component, Vue } from 'vue-property-decorator'
import logOutChannel from '@/utils/BroadcastChannel.js'
import i18n from '@/i18n';
import NvDialog from './dialog'
import NvForm from './form'
import NvFormItem from './formItem'
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
  theme=globalConfig.theme
  options=[
    {
      label: i18n.getTrans('theme', 'Light'),
      value: 'light'
    },
    {
      label: i18n.getTrans('theme', 'Dark'),
      value: 'dark'
    },
    {
      label: i18n.getTrans('theme', 'LakeBlue'),
      value: 'datwyler',
    },
    {
      label: i18n.getTrans('theme', 'Green'),
      value: 'green'
    },
    {
      label: i18n.getTrans('theme', 'BlueGray'),
      value: 'blueGray'
    },
    {
      label: i18n.getTrans('theme', 'TelecomBlue'),
      value: 'telecomBlub'
    },
    {
      label: i18n.getTrans('theme', 'GrassGreen'),
      value: 'grassGreen'
    },
    {
      label: i18n.getTrans('theme', 'EarlySummerBlue'),
      value: 'earlySummerBlue'
    },
    {
      label: i18n.getTrans('theme', 'BlackGold'),
      value: 'blackGold'
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
    this.$storage.local.setItem('theme', this.theme)
    logOutChannel.themeChannel.postMessage(this.theme)
    location.reload()
  }
}
</script>

<style scoped lang="stylus">
#themeDialog{
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

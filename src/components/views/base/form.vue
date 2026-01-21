<template lang="pug">
  .nvForm(:style="getStyle()")
    slot(name="default")
</template>

<script>
import { Component, Prop, Provide, Vue, Model } from 'vue-property-decorator'

@Component()
export default class NvForm extends Vue {
  @Provide() _defaultItemHeight
  @Provide() _defaultLabelWidth
  @Prop() formConfig
  @Prop() labelWidth
  @Prop() height
  @Prop() minHeight
  @Prop() align
  @Model('') formData
  getStyle() {
    let style = ''
    this.height && (style += `height:${this.height};`)
    this.minHeight && (style += `min-height:${this.minHeight};`)
    if (this.align === 'center') {
      style += 'justify-content:center;'
    } else if (this.align === 'start') {
      style += 'justify-content:flex-start;'
    } else if (this.align === 'end') {
      style += 'justify-content:flex-end;'
    }
    return style
  }

  get _defaultItemHeight() {
    return (this.formConfig && this.formConfig.itemHeight) || 30
  }

  get _defaultLabelWidth() {
    return this.labelWidth || 120
  }
}
</script>

<style scoped lang="stylus">

</style>

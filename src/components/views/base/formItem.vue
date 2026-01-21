<template lang="pug">
.nvFormItem(:style="`height:${_itemHeight};`" :class="'nvFormItem-'+_theme.color||'white'")
  slot(name="item")
    .label(:style="`width:${_LabelWidth}px;lineHeight:${_itemHeight}`" v-if="_label!==undefined")
      slot(name="label")
        span {{_label}}
    form.itemBody(autocomplete="off" onsubmit="return false;")
      slot(name="default")
        el-input.inputAreaDefault(v-if="_type==='inputArea'"
          :value="data"
          @input="setData($event,'input')"
          type="textarea"
          :placeholder="placeholder")
        el-input.inputDefault(v-else-if="_type==='input'"
          :style="`width:${bodyWidth}`"
          :value="data"
          @input="setData($event,'input')"
          :placeholder="placeholder")
        el-input.inputDefault(v-else-if="_type==='password'"
          :style="`width:${bodyWidth}`"
          type="password"
          :show-password="showPWD"
          :value="data"
          @input="setData($event,'password')"
          :placeholder="placeholder")
        el-select.selectDefault(v-else-if="_type==='select'"
          :value="data"
          @change="setData($event,'select')"
          :placeholder="placeholder"
          :multiple="multiple")
          template(v-for="option in _options")
            el-option(v-if="option instanceof Object" :value="option.value" :label="option.label||option.value" :key="options.value")
            el-option(:value="option" :label="option" :key="option" v-else)
        el-date-picker.dataPickerDefault(v-else-if="_type==='datetime'||_type==='daterange'||_type==='date'"
          :value="data"
          :type="_type"
          @input="setData($event,'time')"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :placeholder="placeholder")
        el-input-number.inputNumberDefault(v-else-if="_type==='num'"
          :value="data"
          @input="setData($event,'input')"
          :placeholder="placeholder"
          :step="+step||1"
          :min="min"
          :max="max")
        .buttonDefault( v-else-if="_type==='button'")
          .buttonLabel(@click="!disabled&&$emit('clickButton')" :class="disabled&&'disabled'") {{buttonText}}
        .checkboxDefault(v-else-if="_type==='check'"  :style="`justify-content:${align||'center'}`")
          .checkboxBody(:class="data?'checked el-icon-check':'unchecked'" @click="setData(!data,'check')")
        .unit(v-if="unit") {{ unit }}
</template>

<script>
import { Component, Inject, Prop, Model, Vue } from 'vue-property-decorator'
@Component
export default class NvFormItem extends Vue {
  @Model('change') data

  @Inject() _defaultItemHeight
  @Inject() _defaultLabelWidth
  @Prop() height
  @Prop() labelWidth
  @Prop() type
  @Prop() label
  @Prop() bodyWidth
  @Prop() options
  @Prop() placeholder
  @Prop() max
  @Prop() min
  @Prop() step
  @Prop() multiple
  @Prop() buttonText
  @Prop() disabled
  @Prop() align
  @Prop() showPWD // 是否显示密码
  @Prop() unit // 是否显示密码
  get _itemHeight() {
    const itemHeight = this.height || this._defaultItemHeight || 40
    if (!isNaN(+itemHeight)) {
      return `${itemHeight}px`
    } else {
      return itemHeight
    }
  }

  get _LabelWidth() {
    return this.labelWidth || this._defaultLabelWidth || 120
  }

  get _type() {
    return this.type || null
  }

  get _label() {
    return this.label
  }

  get _options() {
    return this.options
  }

  get _theme() {
    const themeManager = this.theme || this.nvTheme
    if (typeof themeManager === 'string') {
      return {
        color: themeManager
      }
    } else if (typeof themeManager === 'object') {
      return themeManager
    } else {
      return {
        color: 'white'
      }
    }
  }

  setData(event, changeType) {
    if (changeType === 'select') {
      this.$emit('selected', event)
    }
    this.$emit('change', event)
  }
}
</script>

<style scoped lang="stylus">
>>>.el-icon-view::before
  position: relative;
  top -6px;
.unit
  margin-left 8px;
  font-size 12px;
</style>

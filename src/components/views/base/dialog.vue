<template lang="pug">
.nvDialogMask(
  ref="mask"
  :id="id"
  :style="getMaskStyle()"
  :class="{nvDialogMaskAllowPenetrate:(allowPenetrate!==undefined&&allowPenetrate!==false)||!visible}"
  @mouseup="_endDragBubble"
  @click="_maskClose"
  @click.stop=""
)
  transition(:enter-active-class="_getTransition('enter')" :leave-active-class="_getTransition('leave')")
    .dialog(
      key="dialog"
      v-if="visible"
      ref="dialog"
      :style="_getStyle()"
      :class="'dialog-'+_theme.color||'white'"
    )
      .header(@mousedown="(e)=> canRemove==='header'&&_startDragBubble(e)" @mouseup="_endDragBubble")
        .drag(v-if="(canRemove===true||canRemove==='drag')" @mousedown="_startDragBubble" @mouseup="_endDragBubble")
          .indicator
        .headerBody
          slot(name="header")
            .title {{title}}
          slot(name="headerBody")
          .space
            el-tooltip(v-if="tooltipVisible" effect="light" :content="tooltipVisible" placement="bottom")
              i.icon-about
          .button(v-for="button in _headerConfig.buttons" :class="button.icon" @click="_footerButtonClick(button)")
          .closeButton.icon-close(v-if="canClose === undefined || canClose" @click="_close")
      .body(:style="getBodyStyle()" v-show="_bodyVisible")
        slot(name="default")
      .footer(:style="_getFooterStyle()" ref="footer")
        slot(name="footer" :footerConfig="_footerConfig")
          .footerButton(v-for="button in _footerConfig.buttons"
            v-if="!button.hidden"
            :ref="button.key"
            :style="`background-color:${button.bgColor}; color:${button.color}; border-color: ${button.borderColor}`"
            @click="!button.loading&&_footerButtonClick(button)"
            :class="`${_getFooterClass()} ${button.loading&&'loading'}`"
            :key="button.label")
            template(v-if="button.loading" )
              svg(xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="margin:4px 6px;display:block;" width="15px" height="15px" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid")
                circle( cx="50" cy="50" fill="none" stroke="#FFFFFF" stroke-width="10" r="35" stroke-dasharray="164.93361431346415 56.97787143782138")
                  animateTransform(attributeName="transform" type="rotate" repeatCount="indefinite" dur="1s" values="0 50 50;360 50 50" keyTimes="0;1")
            span {{button.label}}
        .dragSize(v-if="dragSize" @mousedown.stop="dragSizeDiv($event)" @mouseup.stop="clearDragSizeEvent($event)")
</template>
<script>
import { Component, Prop, Provide, Vue } from 'vue-property-decorator'
import utils from '@/utils'

@Component
export default class NvDialog extends Vue {
  @Prop() title // 传入标题
  @Prop() id // id
  @Prop() canRemove // 是否可移动
  @Prop() canClose // 是否可关闭
  @Prop() width // 弹窗宽
  @Prop() minWidth // 弹窗宽
  @Prop() height // 弹窗高
  @Prop() bodyHeight // body高
  @Prop() bodyMaxHeight // body高
  @Prop() maxHeight // 弹窗最大高
  @Prop() visible // 弹窗是否可见
  @Prop() headerConfig // 顶部部按钮配置文件
  @Prop() footerConfig // 底部按钮配置文件
  @Prop() theme // 主题
  @Prop() closeByMask // 点击背景板关闭
  @Prop() fullScreen // 是否全屏显示
  @Prop() allowPenetrate // 允许点击穿透
  @Prop() defaultPosition // 默认位置
  @Prop() clickOutSideClose // 点击外界关闭
  @Prop() transition // 动画
  @Prop() maskPosition // 背景定位模式
  @Prop() bodyStyle // body样式
  @Prop() bodyVisible // body是否显示
  @Prop() pos // 窗口定位
  @Prop() tooltipVisible // 弹窗提示
  @Prop() dragSize // 右下角拖拽改变窗口大小
  @Prop() dialogDefaultPositions
  @Provide() get nvTheme() {
    return this._theme
  }

  getBodyStyle() {
    return `height:${this.bodyHeight};max-height:${this.bodyMaxHeight};overflow:${this.height === 'auto' ? 'none' : 'hidden'}`;
  }

  get _headerConfig() {
    return {
      align: 'right',
      size: 'normal',
      buttons: [],
      ...this.headerConfig,
    }
  }

  get _footerConfig() {
    const config = {
      align: 'right',
      size: 'normal',
      buttons: [],
      ...this.footerConfig,
    }
    // 不同主题按钮颜色改变
    const theme = globalConfig.theme
    if (theme === 'datwyler') {
      config.buttons.forEach(item => {
        if (item.key === 'Enter') {
          item.bgColor = '#469CB1'
        }
      })
    } else if (theme === 'dark') {
      config.buttons.forEach(item => {
        if (item.key === 'Enter') {
          item.bgColor = '#11AC80'
        }
        if (item.key === 'Escape') {
          item.bgColor = '#484848'
          item.color = '#CACACA'
          item.borderColor = '#929292'
        }
      })
    } else if (theme === 'green') {
      config.buttons.forEach(item => {
        if (item.key === 'Enter') {
          item.bgColor = '#11AC80'
        }
      })
    } else if (theme === 'blueGray') {
      config.buttons.forEach(item => {
        if (item.key === 'Enter') {
          item.bgColor = '#EEAE3E'
        }
      })
    } else if (theme === 'telecomBlub') {
      config.buttons.forEach(item => {
        if (item.key === 'Enter') {
          item.bgColor = '#4090FF'
        }
      })
    } else if (theme === 'grassGreen') {
      config.buttons.forEach(item => {
        if (item.key === 'Enter') {
          item.bgColor = '#01A125'
        }
      })
    } else if (theme === 'earlySummerBlue') {
      config.buttons.forEach(item => {
        if (item.key === 'Enter') {
          item.bgColor = '#409EFF'
        }
      })
    }
    return config
  }

  clearDragSizeEvent () {
    document.onmousemove = null
  }

  dragSizeDiv () {
    document.onmousemove = function (e) {
      const dialog = document.getElementsByClassName('dialog')[0];
      dialog.style.height = e.clientY - dialog.getBoundingClientRect()?.top + 5 + 'px'
      dialog.style.maxHeight = e.clientY - dialog.getBoundingClientRect()?.top + 5 + 'px'
      dialog.style.minHeight = 500 + 'px'
      dialog.style.width = e.clientX - dialog.getBoundingClientRect()?.left + 5 + 'px'
      dialog.style.minWidth = 500 + 'px'
    }
    document.body.addEventListener('mouseleave', this._leaveFn)
  }

  get _bodyVisible() {
    return this.bodyVisible === undefined ? true : this.bodyVisible
  }

  getMaskStyle() {
    let style = ''
    if (this.visible) {
      style += `backgroundColor:${(this.theme && this.theme.maskBgColor) ||
        ''};`
    }
    if ((this.maskPosition ?? 'fixed') !== 'fixed') {
      style += `position:${this.maskPosition};`
    }
    if (this.pos) {
      style += `top: ${this.pos.top}px;left: ${this.pos.left}px`
    }
    return style
  }

  transitionData = {
    fade: {
      enter: 'animate__animated animate__fadeIn animate__faster',
      leave: 'animate__animated animate__fadeOut animate__faster',
    },
    fadeRight: {
      enter: 'animate__animated animate__fadeInRight animate__faster',
      leave: 'animate__animated animate__fadeOutRight animate__faster',
    },
    fadeLeft: {
      enter: 'animate__animated animate__fadeInLeft animate__faster',
      leave: 'animate__animated animate__fadeOutLeft animate__faster',
    },
    zoom: {
      enter: 'animate__animated animate__zoomIn animate__faster',
      leave: 'animate__animated animate__zoomOut animate__faster',
    },
  }

  // 动画管理
  _getTransition(action) {
    return this.transitionData[this.transition ?? 'zoom']?.[action]
  }

  _maskClose() {
    this.closeByMask && this._close()
  }

  get _theme() {
    if (typeof this.theme === 'string') {
      return {
        color: this.theme,
      }
    } else if (typeof this.theme === 'object') {
      return this.theme
    } else {
      return {
        color: 'white',
      }
    }
  }

  _getStyle() {
    this.dialog = null;
    if (document.getElementById('linkPortsDialog')) {
      if (document.getElementById('linkPortsDialog').getElementsByClassName('dialog')[0]) {
        this.dialog = document.getElementById('linkPortsDialog').getElementsByClassName('dialog')[0].getBoundingClientRect();
        if (this.$store.state.linkDialogX || this.$store.state.linkDialogY) {
          this.dialogLeft = this.$store.state.linkDialogX;
          this.dialogTop = this.$store.state.linkDialogY;
        } else {
          this.dialogLeft = this.dialog.left;
          this.dialogTop = this.dialog.top;
          this.$store.commit('changelinkDialogX', this.dialogLeft)
          this.$store.commit('changelinkDialogY', this.dialogTop)
        }
        const maskRect = this.$refs.mask.getBoundingClientRect()
        const bubbleRect = document.getElementById('linkPortsDialog').getElementsByClassName('dialog')[0].getBoundingClientRect()
        const xDistance = (maskRect.width - bubbleRect.width) / 2 + maskRect.left
        const yDistance = (maskRect.height - bubbleRect.height) / 2 + maskRect.top
        const x = this.$store.state.linkPortsDialogX - this.dialogLeft;
        const y = this.$store.state.linkPortsDialogY - this.dialogTop;
        if (x >= document.body.offsetWidth - bubbleRect.width - xDistance) {
          this.dialogDefaultPosition.x = document.body.offsetWidth - bubbleRect.width - xDistance
        } else {
          this.dialogDefaultPosition.x = this.$store.state.linkPortsDialogX - this.dialogLeft;
        }
        if (y >= document.body.offsetHeight - bubbleRect.height - yDistance) {
          this.dialogDefaultPosition.y = document.body.offsetHeight - bubbleRect.height - yDistance
        } else {
          this.dialogDefaultPosition.y = this.$store.state.linkPortsDialogY - this.dialogTop;
        }
      }
    }
    let style = ''
    if (this.fullScreen) {
      style +=
        'width:100vw;height:100vh;transform:translate(0,0);max-height:100vh;'
    } else {
      style += `min-width:${this.minWidth || this.width || '80vw'};width:${this.width || '80vw'};height:${this.height || '80vh'};max-height:${this.maxHeight || '100vh'};`
      if (this.left !== null && this.top !== null) {
        style += `transform:translate(${this.left}px, ${this.top}px);`
      } else if (this.defaultPosition) {
        style += `transform:translate(${this.defaultPosition.x},${this.defaultPosition.y});`
      } else if (this.dialogDefaultPosition) {
        if (this.dialogDefaultPositions) {
          style += `position: absolute; top: ${this.dialogDefaultPositions.y}px; left: ${this.dialogDefaultPositions.x}px;`;
        } else {
          style += `transform:translate(${this.dialogDefaultPosition.x}px,${this.dialogDefaultPosition.y}px);`
        }
      }
    }
    style += this.bodyStyle
    return style
  }

  _getFooterStyle() {
    let style = ''
    if (this._footerConfig.align === 'center') {
      style += 'justify-content:center;'
    } else if (this._footerConfig.align === 'left') {
      style += 'justify-content:flex-start;'
    } else {
      style += 'justify-content:flex-end;'
    }
    return style
  }

  _getFooterClass() {
    let className = ''
    if (this._footerConfig.size === 'small') {
      className += 'footerButton-small'
    } else {
      className += 'footerButton-normal'
    }
    return className
  }

  _listenerFn(move) {
    const maskRect = this.$refs.mask.getBoundingClientRect()
    const bubbleRect = this.$refs.dialog.getBoundingClientRect()
    const left = move.x - this.position.left
    const top = move.y - this.position.top
    const xDistance = (maskRect.width - bubbleRect.width) / 2 + maskRect.left
    const yDistance = (maskRect.height - bubbleRect.height) / 2 + maskRect.top
    if (left <= -xDistance) {
      this.left = -xDistance
    } else if (
      left >=
      document.body.offsetWidth - bubbleRect.width - xDistance
    ) {
      this.left = document.body.offsetWidth - bubbleRect.width - xDistance
    } else {
      this.left = left
    }
    if (top <= -yDistance) {
      this.top = -yDistance
    } else if (
      top >=
      document.body.offsetHeight - bubbleRect.height - yDistance
    ) {
      this.top = document.body.offsetHeight - bubbleRect.height - yDistance
    } else {
      this.top = top
    }
  }

  left = null
  top = null
  position = {}
  dialogDefaultPosition = {
    x: null,
    y: null
  };

  _startDragBubble(down) {
    const maskRect = this.$refs.mask.getBoundingClientRect()
    const dialogRect = this.$refs.dialog.getBoundingClientRect()
    this.top =
      dialogRect.top +
      dialogRect.height / 2 -
      maskRect.height / 2 -
      maskRect.top
    this.left =
      dialogRect.left +
      dialogRect.width / 2 -
      maskRect.width / 2 -
      maskRect.left
    this.position = {
      left: down.x - this.left,
      top: down.y - this.top,
    }
    document.body.addEventListener('mousemove', this._listenerFn)
    document.body.addEventListener('mouseleave', this._leaveFn)
  }

  _leaveFn() {
    document.onmousemove = null
    this._endDragBubble()
    document.body.removeEventListener('mouseleave', this._leaveFn)
  }

  _endDragBubble() {
    document.onmousemove = null
    document.body.removeEventListener('mousemove', this._listenerFn)
  }

  _footerButtonClick(button) {
    const event = {
      close: this._close,
    }
    button.url && utils.openPage(button.url.text, null, button.url.type)
    button.event && event[button.event] && event[button.event]()
    button.click()
  }

  _close() {
    this.$emit('update:visible', false)
    document.body.removeEventListener('keyup', this.keyUpListener)
    this.left = null
    this.top = null
  }

  keyUpListener(key) {
    // if (key.target.nodeName === 'INPUT' || key.target.nodeName === 'TEXTAREA') {
    //   return
    // }
    const refList = this.$refs[key.key]
    refList?.[0]?.click()
  }

  bodyClickListener() {
    this._close()
  }

  openFn() {
    document.body.addEventListener('keyup', this.keyUpListener)
    this.$emit('open')
    setTimeout(() => {
      this.clickOutSideClose &&
        document.body.addEventListener('click', this.bodyClickListener)
    })
  }

  closeFn() {
    document.body.removeEventListener('keyup', this.keyUpListener)
    this.clickOutSideClose &&
      document.body.removeEventListener('click', this.bodyClickListener)
    this.$emit('close')
  }

  listen = {
    mounted: {
      visible: this.openFn,
    },
    destroy: {
      visible: this.closeFn,
    },
  }
}
</script>

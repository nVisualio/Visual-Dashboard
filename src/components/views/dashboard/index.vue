<template lang="pug">
#dashboard
  Main
</template>

<script>
import { Component, Vue } from 'vue-property-decorator'
import Main from './view.vue'

@Component({
  components: {
    Main,
  }
})
export default class Dashboard extends Vue {

}
</script>

<style scoped>
#dashboard {
  height: 100%;
  width: 100%;
}
</style>

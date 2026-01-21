<template lang="pug">
Main
</template>

<script>
import { Vue, Component } from 'vue-property-decorator'
import Main from '@@/components/views/dashboard/index.vue'

@Component({
  components: {
    Main
  }
})
export default class Dashboard extends Vue {

}
</script>

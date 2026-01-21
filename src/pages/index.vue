<template lang="pug">
#app(@contextmenu.prevent)
  router-view
</template>

<style>
html,body,#app {
  overflow: hidden;
  height: 100%
}
body {
  padding: 0;
  margin: 0
}
#app {
  font-family: Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>

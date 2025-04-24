declare module 'vue-masonry-css' {
  import { Plugin } from 'vue'
  
  export const VueMasonryPlugin: Plugin & {
    name: string
    props: {
      cols: {
        type: [Object, Number]
        default: 2
      }
      gutter: {
        type: [Object, String]
        default: '0'
      }
    }
  }
} 
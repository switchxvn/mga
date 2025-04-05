declare module 'vue-masonry-wall' {
  import { DefineComponent } from 'vue'
  
  const MasonryWall: DefineComponent<{
    items: any[]
    ssrColumns?: number
    columnWidth?: number
    gap?: number
    padding?: number
    rtl?: boolean
  }>
  
  export default MasonryWall
} 
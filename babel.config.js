// 项目发布阶段需要用到的一些特定插件
const prodPlugins = []
// 如果是生产阶段，就加上这个插件，去掉log
if (process.env.NODE_ENV === 'production') {
  prodPlugins.push('transform-remove-console')
}

module.exports = {
  "presets": [
    "@vue/cli-plugin-babel/preset"
  ],
  "plugins": [
    [
      "component",
      {
        "libraryName": "element-ui",
        "styleLibraryName": "theme-chalk"
      }
    ],
    // 放进插件配置中
    ...prodPlugins
  ]
}
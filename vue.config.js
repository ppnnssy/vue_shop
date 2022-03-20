// 向外导出配置对象,控制开发模式和生产模式下使用不同的打包入口
module.exports = {
  chainWebpack: (config) => {
    // 发布模式
    config.when(process.env.NODE_ENV === 'production', (config) => {
      // 先得到默认的打包入口app，然后清除，然后添加自己的打包入口
      config.entry('app').clear().add('./src/main-prod.js');

      config.set('externals', {
        vue: 'Vue',
        'vue-router': 'VueRouter',
        axios: 'axios',
        lodash: '_',
        echarts: 'echarts',
        'vue-quill-editor': 'VueQuillEditor',
      });

      config.plugin('html').tap((args) => {
        args[0].isProd = true;
        return args;
      });
    });
    // 开发模式
    config.when(process.env.NODE_ENV === 'development', (config) => {
      // 先得到默认的打包入口app，然后清除，然后添加自己的打包入口
      config.entry('app').clear().add('./src/main-dev.js');
    });

    config.plugin('html').tap((args) => {
      args[0].isProd = false;
      return args;
    });
  },
};

module.exports = {
  configureWebpack: {
    devServer: {
      watchOptions: {
        poll: true,
      },
    },
    output: {
      globalObject: "this",
    },
  },
  chainWebpack: config => {
    config.module
      .rule('svg')
      .use('file-loader')
        .loader('vue-svg-loader')
  },
};

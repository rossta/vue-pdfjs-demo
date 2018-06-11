const output = {
  globalObject: "this",
};

if (process.env.PUBLIC_PATH) {
  Object.assign(output, {publicPath: process.env.PUBLIC_PATH});
}

module.exports = {
  configureWebpack: {
    devServer: {
      watchOptions: {
        poll: true,
      },
    },
    output,
  },
  chainWebpack: config => {
    config.module
      .rule('svg')
      .use('file-loader')
        .loader('vue-svg-loader')
  },
};

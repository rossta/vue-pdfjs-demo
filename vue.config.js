const output = {
  globalObject: "this",
};

const publicPath = process.env.WEBPACK_PUBLIC_PATH;
if (publicPath) {
  Object.assign(output, {publicPath});
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

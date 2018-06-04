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
};

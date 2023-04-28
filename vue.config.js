const { defineConfig } = require('@vue/cli-service')
const path = require('path')
module.exports = {
  pluginOptions:{
    electronBuilder: {
      builderOptions:{
        extraResources: [
          {from: './src/backend', to:'./'}
        ]
      }
    }
  }
}

// const { defineConfig } = require('@vue/cli-service')
// const path = require('path')
module.exports = {
  pluginOptions:{
    electronBuilder: {
      preload: 'src/preload.js',
      builderOptions:{
    
        extraResources: [
          {from: './src/backend', to:'./'}
        ]
      },
      externals: ['knex','sqlite3'],
    }
  }
}

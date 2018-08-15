const router = require('koa-router')()
const wechatConfig =require('../config/wechat')
const reply = require('../wechat/reply.js')
const wechatMiddle = require('../wechat_lib/middleware')

router.get('/', async (ctx, next) => {
    require('../crawler/imdb.js').getIMDBImages()
    // require('../crawler/api.js').getApiCharActers()
    // require('../crawler/check')
})

router.all('/wechathear',wechatMiddle(wechatConfig,reply))


router.get('/string', async (ctx, next) => {
  ctx.body = 'koa2 string'
})

router.get('/json', async (ctx, next) => {
  ctx.body = {
    title: 'koa2 json'
  }
})

module.exports = router



const sha1 = require('sha1')
const getRawBody = require('raw-body')
const util =require('./util')


module.exports = function (opts,reply) {
    return async function wechatMiddle(ctx,next) {
        const token = opts.token
        const {signature, nonce, timestamp, echostr} = ctx.query
        const str = [token, timestamp, nonce].sort().join('')
        const sha = sha1(str)

        if (ctx.method === 'GET') {
            if (signature === sha) {
                ctx.body = echostr
                console.log(echostr);
            } else {
                ctx.body = '没有成功'
            }

        }else if(ctx.method === 'POST'){
            if (signature != sha) {
                ctx.body = {
                    'message': 'Failed'
                }
                return false
            }
            console.log(ctx.req)
            const data =await getRawBody(ctx.req,{
                length:ctx.length,
                limit:'1mb',
                encoding:ctx.charset
            })
            const content = await util.parseXML(data)
            const message = util.formatMessage(content.xml)


            ctx.weixin =message   //xml用户数据

            await reply.apply(ctx,[ctx,next])  //回复策略

            const replyBody =ctx.body
            const msg = ctx.weixin


            const xml = util.tpl(replyBody,msg)

            ctx.status = 200
            ctx.type = 'application/xml'
            ctx.body = xml

        }



    }
}
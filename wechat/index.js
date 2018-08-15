const mongoose =require('mongoose')
const config = require('../config/wechat')

const wechat = require('../api/wechat')
const Token  =require('../model/token')

Token.getAccessToken()
const wechatConfig ={
    'appId':config.appId,
    'appSecret':config.appSecret,
    'token':config.token,
    'getAccessToken':async ()=> await Token.getAccessToken(),
    'saveAccessToken':async (data)=> await Token.saveAccessToken(data)
}

function getWechat (){
    const wechatClient =new wechat(wechatConfig)
    return wechatClient
}

getWechat ()

module.exports = getWechat
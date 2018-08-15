const request = require('request-promise')

const base='https://api.weixin.qq.com'

const api ={
    accessToken:`${base}/cgi-bin/token?grant_type=client_credential`
}

class Wechat{
    constructor(opts){
        console.log(opts);
        this.opts=Object.assign({},opts)
        this.appId =opts.appId
        this.appSecret =opts.appSecret
        this.getAccessToken=opts.getAccessToken
        this.saveAccessToken =opts.saveAccessToken
        this.fetchAccessToken()
    }

    async fetchAccessToken (){
        let data=await  this.getAccessToken()//数据库查找token
        if(!this.isValidAccessToken(data)){     //没有则发送http请求获取
            data= await this.updateAccessToken()
        }

        await this.saveAccessToken(data) //数据库保存token

        return data     //返回token

    }

    async Request (options) {
        options = Object.assign({},options,{json:true})
        try {
            const response = await request(options)
            console.log(response)
            return response
        }catch (error) {
            console.error(error)
        }
       
    }


    async updateAccessToken(){
        const url =api.accessToken +'&appid=' +this.appId +'&secret=' +this.appSecret
        console.log(url)
        const data = await this.Request({url:url})
        const now = (new Date().getTime())
        const expiresIn = now +(data.expires_in -20) * 1000
        data.expires_in =expiresIn

        return data
    }

    isValidAccessToken(data){
        if(!data || !data.access_token || !data.expires_in){
            return false
        }
        const expiseIn =data.expires_in
        const now =(new Date().getTime())

        if(now <expiseIn){
            return true
        }else{
            return false
        }

    }

}

module.exports =Wechat

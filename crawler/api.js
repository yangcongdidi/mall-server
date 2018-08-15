let cheerio =require('cheerio')
let _ = require('lodash')
let rp  = require('request-promise')
let {writeFileSync} = require('fs')
// let Agent = require('socks5-http-client/lib/Agent')

let characters =[]

const sleep = time => new Promise(resolve => setTimeout(resolve,time))

var page=1
async  function CharActers() {
    let  url = `https://www.anapioficeandfire.com/api/characters?page=${page}&pageSize=50`

    console.log('正在爬第' + page +'页数据')
    let body = await rp(url)
    console.log(body)
    await setInterval(function(){
        if(body =='' || body ==null || body ==undefined){
            console.log(body)
            console.log(page)
            CharActers(page)
        }
    },5000)

     body =JSON.parse(body)





    console.log('爬到' + body.length +'页数据')

    characters =_.union(characters,body)

    console.log('现有' + characters.length +'页数据')
    if(body.length <50) {
        console.log('爬完了')

        return
    }else{

        writeFileSync('./characters.json',JSON.stringify(characters,null,2),'utf-8')
        await sleep(1000)
        page++
        CharActers(page)
    }
}




exports.getApiCharActers =CharActers


let cheerio =require('cheerio')
let {resolve} = require('path')
let rp  = require('request-promise')
let {writeFileSync} = require('fs')
// let Agent = require('socks5-http-client/lib/Agent')
const sleep = time => new Promise(resolve => setTimeout(resolve,time))

exports.getIMDBCharacters =async () =>
{
    let options = {
        uri: 'https://www.imdb.com/title/tt0944947/fullcredits?ref_=tt_cl_sm#cast',

        transform: body => cheerio.load(body)
    }
    let photos=[]
    const $ =await  rp(options)

    $('table.cast_list tr.odd, tr.even').each(function () {
        let playedBy = $(this).find('td.itemprop span.itemprop')
        playedBy = playedBy.text()

        let nmId = $(this).find('td.itemprop a')
        nmId = nmId.attr('href')

        let character = $(this).find('td.character a')

        let name = character.text()
        let chId = character.attr('href')

        const data = {
            playedBy,
            nmId,
            name,
            chId
        }

        photos.push(data)
    })

    console.log('共拿到' +photos.length +'条数据')


    photos=photos.filter((item)=>{
        return item.playedBy && item.name && item.nmId && item.chId
    })


    photos=photos.map((item)=>{
        const reg1 = /\/name\/(.*?)\/\?ref/
        const reg2 = /[0-9]*\s?episodes(.*)/
        const match1 = item.nmId.match(reg1)
        item.nmId = match1[1]
        item.chId = match1[1]
        let name= item.name.replace(reg2,'')
        item.name=name.replace(/(\s*$)/g, "");
        return item
    })


    console.log('清洗后，共拿到' +photos.length +'条数据')
    writeFileSync('./imdb.json',JSON.stringify(photos,null,2),'utf-8')
}

exports.getIMDBProfile = async() =>{
    const charactes =require(resolve(__dirname,'../wikiCharacters.json'))

    for(let i=0;i < charactes.length; i++){
        if(!charactes[i].profile){
            const url=`https://www.imdb.com/title/tt0944947/characters/${charactes[i].nmId}?ref_=ttfc_fc_cl_t3`

           console.log('正在爬取'+charactes[i].name+'头像')

            await setInterval(async function(){
                if(src =='' || src ==null || src ==undefined){
                    await fetchIMDBProfile(url)
                }
            },5000)

            const src = await fetchIMDBProfile(url)
            console.log('已经爬到'+src)

            charactes[i].src = src
            await sleep(500)
        }
    }
    console.log('爬完了')
    writeFileSync('./imdbCharacters.json',JSON.stringify(charactes,null,2),'utf-8')
}

const fetchIMDBProfile = async(url) =>{
    let options = {
        uri: url,

        transform: body => cheerio.load(body)
    }

    const $ = await rp(options)

    let img =$('a.titlecharacters-image-grid__thumbnail-link img')
    let src =img.attr('src')


        src = src.split('_V1').shift()
        src +='_V1.jpg'

    console.log(src)
    return src
}


exports.getIMDBImages = async() =>{
    const charactes =require(resolve(__dirname,'../imdbCharacters.json'))

    for(let i=0;i < charactes.length; i++){
        if(!charactes[i].images){
            const url=`https://www.imdb.com/title/tt0944947/characters/${charactes[i].nmId}?ref_=ttfc_fc_cl_t3`

            console.log('正在爬取'+charactes[i].name+'剧照')

            await setInterval(async function(){
                if(images =='' || images ==null || images ==undefined){
                    await fetchIMDBProfile(url)
                }
            },5000)

            const images = await fetchIMDBImages(url)
            console.log('已经爬到'+images.length)

            charactes[i].images = images
            await sleep(500)
        }
    }
    console.log('爬完了')
    writeFileSync('./vaildCharacters.json',JSON.stringify(charactes,null,2),'utf-8')
}

const fetchIMDBImages = async(url) =>{
    let options = {
        uri: url,

        transform: body => cheerio.load(body)
    }

    const $ = await rp(options)
    let images=[]
    $('a.titlecharacters-image-grid__thumbnail-link img').each(function () {
        let src =$(this).attr('src')
        src = src.split('_V1').shift()
        src +='_V1.jpg'
        images.push(src)
        console.log(src)
    })



    return images
}
let cheerio =require('cheerio')
let {resolve} = require('path')
let rp  = require('request-promise')
let _ = require('loadsh')
let R    = require('ramda')
let {writeFileSync} = require('fs')

// let Agent = require('socks5-http-client/lib/Agent')
const sleep = time => new Promise(resolve => setTimeout(resolve,time))

const normalizedContent = content => _.reduce(content, (acc, item) => {
    if (item.text) acc.push(item.text)

    if (item.elements && item.elements.length) {
        let _acc = normalizedContent(item.elements)
        acc = R.concat(acc, _acc)
    }
    return acc
}, [])


const normalizedSections = R.compose(
    R.nth(1),
    R.splitAt(1),
    R.map(
        i => ({
            level: i.level,
            title: i.title,
            content: normalizedContent(i.content)
        })
    )
)



const getWikiId = async data =>{
    let query =  data.name || data.cname
    const url = `http://zh.asoiaf.wikia.com/api/v1/Search/List?query=${encodeURI(query)}`

    try {
        var res = await rp(url)
    } catch (e) {
        console.log('error:', e)
    }

    res = JSON.parse(res)
    res = res.items[0]

    console.log(R.merge(data, res))
    return R.merge(data, res)
}


const getWikiDetail = async data =>{
    const { id } = data
    let url = `http://zh.asoiaf.wikia.com/api/v1/Articles/AsSimpleJson?id=${id}`
    sleep(500)
    try {
        var res = await rp(url)
    } catch (e) {
        console.log('error:', e)
    }
    res = JSON.parse(res)


    const getCnameAndIntro = R.compose(
        i => ({
            cname: i.title,
            intro: R.map(R.prop(['text']))(i.content)
        }),
        R.pick(['title', 'content']),
        R.nth(0),
        R.filter(R.propEq('level', 1)),
        R.prop('sections')
    )

    const getLevel = R.compose(
        R.project(['title', 'content', 'level']),
        R.reject(R.propEq('title', '扩展阅读')),
        R.reject(R.propEq('title', '引用与注释')),
        R.filter(i => i.content.length),
        R.prop('sections')
    )

    let cnameAndIntro = getCnameAndIntro(res)
    let sections = getLevel(res)
    let _res = R.merge(data, getCnameAndIntro(res))

    sections = normalizedSections(sections)

    _res.sections = sections
    _res.wikiId = id

    return R.pick(['name', 'cname', 'playedBy', 'profile', 'images', 'nmId', 'chId', 'sections', 'intro', 'wikiId', 'words'], _res)
}

exports.getWiKiCharacters =async ()=>{
    let data =require(resolve(__dirname,'../vaildCharacters.json'))

    data=[
        data[106],
        data[107],
    ]
    data = R.map(getWikiId,data)
    data = await Promise.all(data)
    console.log('获取 wiki Id')
    data = R.map(getWikiDetail,data)
    console.log('获取 wiki 详细资料')
    data = await Promise.all(data)
    writeFileSync('./finalCharacters11' +
        '.json',JSON.stringify(data,null,2),'utf-8')
    console.log('爬完了')
}

exports.getHouses = async ()=>{
    let Houses = require('../config/house')
    let data =R.map(getWikiId,Houses)
    data = await  Promise.all(data)

    data =R.map(getWikiDetail,data)
    data = await  Promise.all(data)
    writeFileSync('./wikiHouses.json',JSON.stringify(data,null,2),'utf-8')
    console.log('爬完了')
}

exports.getSwornMembers = async () => {
    let houses =require(resolve(__dirname,'../wikiHouses.json'))
    let characters =require(resolve(__dirname,'../finalCharacters.json'))

    const findSwornMembers = R.map(R.compose(
        i => _.reduce(i, (acc, item) => {
            acc = acc.concat(item)

            return acc
        }, []),
        R.map(i => {
            let item = R.find(R.propEq('cname', i[0]))(characters)
            return {character: item.nmId, text: i[1]}
        }),
        R.filter(item => R.find(R.propEq('cname', item[0]))(characters)),
        R.map(i => {
            let item = i.split('，')
            let name = item.shift()

            return [name.replace(/(【|】|爵士|一世女王|三世国王|公爵|国王|王后|夫人|公主|王子)/g, ''), item.join('，')]
        }),
        R.nth(1),
        R.splitAt(1),
        R.prop('content'),
        R.nth(0),
        R.filter(i => R.test(/伊耿历三世纪末的/, i.title)),
        R.prop('sections')
    ))

    let swornMembers = findSwornMembers(houses)

    houses = _.map(houses, (item, index) => {
        item.swornMembers = swornMembers[index]
        return item
    })

    writeFileSync('./completeHouses.json', JSON.stringify(houses, null, 4), 'utf8')
}
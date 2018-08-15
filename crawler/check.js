let {resolve} = require('path')
let {find}  = require('loadsh')
let R       = require('ramda')
let characters = require(resolve(__dirname,'../characters.json'))
let imdbData = require(resolve(__dirname,'../imdb.json'))
let fs =require('fs')
console.log(characters)
const findNameInApi =(item) =>{
    return find(characters,{
        name:item.name
    })
}

const findPlayedByInApi =(item) =>{
    return find(characters,i=>{
        return i.playedBy.includes(item.playedBy)
    })
}

const validData =R.filter(
    i => findPlayedByInApi(i) && findNameInApi(i)
)

const IMDB =validData(imdbData)

console.log(IMDB.length)

fs.writeFileSync('./wikiCharacters',JSON.stringify(IMDB,null,2),'utf-8')
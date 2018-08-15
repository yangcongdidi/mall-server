
const config   =require('../config/database')
const mongoose =require('mongoose')

const  database =async ()=>{
    mongoose.set('debug',true)

    mongoose.connect('mongodb://localhost:27017/ice')

    mongoose.connection.on('disconnected',err=>{
        mongoose.connect('mongodb://localhost:27017/ice')
    })

    mongoose.connection.on('connected', () => {
        console.log("MongoDB success")
    })

    mongoose.connection.on('err',err=>{
        console.log(err)
    })

    mongoose.connection.on('open',async=>{
        console.log('aaaaaaaaaaa')
    })
}
database()
module.exports=database
const mongoose = require('mongoose');

const dbConnect = async() => {
    try{
      console.log('connection to db is initiated')
      await mongoose.connect(process.env.MONGODB_URL,{
        dbName : 'dating-app'
      })
    }
    catch(err){
        console.log(err)
    }
}

mongoose.connection.on('connected',() => {
    console.log('connected to db successfully')
})

mongoose.connection.on('error',(err) => {
    console.log(err)
})

mongoose.connection.on('disconnected',() => {
    console.log('connection to db is terminated')
})

process.on('SIGINT',async() => {
    await mongoose.connection.close()
    process.exit(0)
})

module.exports = dbConnect;
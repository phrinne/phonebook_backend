const mongoose = require('mongoose')
const numberOfArgs = process.argv.length

if (numberOfArgs < 3) {
    console.log('Pw missing from arguments: node mongo.js <password>')
    process.exit(1)
}

const password = process.argv[2]
const url = `mongodb+srv://databasemasterblaster:${password}@cluster0.5rq8c.mongodb.net/phonebook?retryWrites=true&w=majority`
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })

const personSchema = new mongoose.Schema({
    name: String,
    number: String,
})

const Person = mongoose.model('Person', personSchema)

if (numberOfArgs === 3) {
    console.log('phonebook:')
    Person.find({}).then(result => {
        result.forEach(p => { console.log(`${p.name} ${p.number}`) })
        mongoose.connection.close()
    })
} else if (numberOfArgs === 5) {
    const person = new Person({
        name: process.argv[3],
        number: process.argv[4],
    })

    person.save().then(() => {
        console.log(`added ${person.name} number ${person.number} to phonebook`)
        mongoose.connection.close()
    })
} else {
    console.log('Weird number of parameters, mon', numberOfArgs)
    process.exit(1)
}
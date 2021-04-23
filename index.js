require('dotenv').config()
const express = require('express')
var morgan = require('morgan')
const Person = require('./models/person')

const app = express()
app.use(express.json())
app.use(express.static('build'))

//Morgan
//POST using body token to show content of person
morgan.token('body', (request) => JSON.stringify(request.body))
app.use(morgan(
    ':method :url :status :res[content-length] - :response-time ms :body',
    {
        skip: function (req) {
            const { method } = req
            return method !== 'POST'
        }
    }
))
//Everything but POST using 'tiny' format
app.use(morgan(
    'tiny',
    {
        skip: function (req) {
            const { method } = req
            return method === 'POST'
        }
    }
))

app.get('/', (request, response) => {
    response.send('Nothing to see here, only (g)root.')
})

app.get('/info', (request, response) => {
    Person.find({}).then(result => {
        const phonebookSize = result.length
        const timeStamp = new Date()
        response.send(`Phonebook has info for ${phonebookSize} people.<br/><br/>${timeStamp}`)
    })
})

app.get('/api/persons', (request, response) => {
    Person.find({}).then(result => response.json(result))
})

app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id)
        .then(person => {
            if (person) {
                response.json(person)
            } else {
                //person was already removed from server
                response.status(404).end()
            }
        })
        .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
    const body = request.body
    const person = new Person({
        name: body.name,
        number: body.number,
    })

    person
        .save()
        .then(savedPerson => response.json(savedPerson))
        .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndRemove(request.params.id)
        .then(() => response.status(204).end())
        .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
    const person = { number: request.body.number}

    Person.findByIdAndUpdate(request.params.id, person, { new: true, runValidators: true })
        .then(updatedPerson => {
            if(updatedPerson) {
                response.json(updatedPerson)
            } else {
                response.status(404).end()
            }
        })
        .catch(error => {
            next(error)
        })
})

const errorHandler = (error, request, response, next) => {
    console.log(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    }

    next(error)
}
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
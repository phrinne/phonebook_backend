const express = require('express')
var morgan = require('morgan')

const app = express()
app.use(express.json())
app.use(express.static('build'))

morgan.token('body', (request, response) => JSON.stringify(request.body))

//POST using body token to show content of person
app.use(morgan(
    ':method :url :status :res[content-length] - :response-time ms :body',
    {
        skip: function (req, res) { 
            const { method, url } = req
            return method !== 'POST' 
        }
    }
))
//Everything but POST using 'tiny' format
app.use(morgan(
    'tiny',
    {
        skip: function (req, res) { 
            const { method, url } = req
            return method === 'POST' 
        }
    }
))

let persons = [
    {
        "id": 1,
        "name": "Arto Hellas",
        "number": "040-123456"
    },
    {
        "id": 2,
        "name": "Ada Lovelace",
        "number": "39-44-5323523"
    },
    {
        "id": 3,
        "name": "Dan Abramov",
        "number": "12-43-234345"
    },
    {
        "id": 4,
        "name": "Mary Poppendieck",
        "number": "39-23-6423122"
    }
]

app.get('/', (request, response) => {
    response.send('Nothing to see here, only (g)root.')
})

app.get('/info', (request, response) => {
    const phonebookSize = persons.length;
    const timeStamp = new Date();

    response.send(`Phonebook has info for ${phonebookSize} people.<br/><br/>${timeStamp}`)
})

app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(p => p.id === id)
    if (person) {
        response.json(person)
    } else {
        response.status(404).end()
    }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(p => p.id !== id)

    response.status(204).end()
})

const nameExists = (name) => {
    const names = persons.map(p => p.name)
    return names.find(n => n === name)
}
const generateNewId = () => {
    return Math.floor(Math.random() * 10000) + persons.length
}

app.post('/api/persons', (request, response) => {
    const person = request.body
    if (!person.name) {
        return response.status(400).json({
            error: 'Name missing'
        })
    }
    if (!person.number) {
        return response.status(400).json({
            error: 'Number missing'
        })
    }
    if (nameExists(person.name)) {
        return response.status(400).json({
            error: 'name must be unique'
        })
    }

    person.id = generateNewId()
    persons = persons.concat(person)
    response.json(person)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
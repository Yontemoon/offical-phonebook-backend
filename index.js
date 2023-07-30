const express = require('express');
const app = express();
app.use(express.json());
var morgan = require('morgan')
const cors = require('cors')

const useMorgan = morgan(function (tokens, req, res) {
    return [
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, 'content.length'), '-',
        tokens['response-time'](req, res), 'ms'
    ].join('');
})

app.use(useMorgan)
app.use(cors())
app.use(express.static('build'))
let persons = [
    { 
      id: 1,
      name: "Arto Hellas", 
      number: "040-123456"
    },
    { 
      id: 2,
      name: "Ada Lovelace", 
      number: "39-44-5323523"
    },
    { 
      id: 3,
      name: "Dan Abramov", 
      number: "12-43-234345"
    },
    {  
      id: 4,
      name: "Mary Poppendieck", 
      number: "39-23-6423122"
    }
]

// const app = http.createServer((request, response) => {
//     response.writeHead(200, { 'Content-Type': 'text/plain' })
//     response.end('Hello world')
// })

app.get('/', (request, response) => {
    response.send(`<h1>Hello!</h1>`)
})

app.get('/api/persons', (request, response) => {
    response.json(persons);
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})


app.get('/info', (request, response) => {
    response.send(`<p>Phonebook has info for ${persons.length} people</p> <br/>
                    <p>${new Date()}</p>` ) 
})

app.get(`/api/persons/:id`, (request, response) => {
    const id = Number(request.params.id);
    const person = persons.filter(person => person.id === id)
    if (person) {
        response.json(person);
    } else {
        response.status(404).end();
    }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id);
    persons = persons.filter(person => person.id !== id)
    response.status(204).end();
})

const generateId = () => {
    const createId = Math.max(...persons.map(person => person.id))
    return createId + 1;
}

const checkDuplicate = (name) => {
    const checkFilter = persons.filter(person => person.name === name);
    return checkFilter.length >= 1 ? true : false;
}

app.post('/api/persons/', (request, response) => {
    const body = request.body

    if (!body.name || !body.number) {
        return response.status(400).json({
            error: 'No content'
        })
    } 


    if (checkDuplicate(body.name) === true) {
        return response.status(400).json( {
            error: "name must be unique"
        })
    }
    const person = {
        id: generateId(),
        name: body.name,
        number: body.number,
    }


    persons = persons.concat(person)
    // console.log("IT GOES HERE EVERYTIME")
    response.json(persons)
})

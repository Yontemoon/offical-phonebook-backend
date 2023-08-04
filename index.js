const express = require('express');
const app = express();
app.use(express.json());
var morgan = require('morgan')
const cors = require('cors')
require('dotenv').config()
const Person = require('./models/person');


const useMorgan = morgan(function (tokens, req, res) {
    return [
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, 'content.length'), '-',
        tokens['response-time'](req, res), 'ms'
    ].join('');
})

app.use(express.json())
app.use(useMorgan)
app.use(cors())
app.use(express.static('build'))


// const app = http.createServer((request, response) => {
//     response.writeHead(200, { 'Content-Type': 'text/plain' })
//     response.end('Hello world')
// })

app.get('/', (request, response) => {
    response.send(`<h1>Hello!</h1>`)
})

app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons);
    })
})



app.get('/info', (request, response) => {
    Person.count()
        .then((count) => {
            response.send(`<p>Phonebook has info for ${count} people</p> <br/>
                        <p>${new Date()}</p>`)
        })
    // response.send(`<p>Phonebook has info for ${count} people</p> <br/>
    //                 <p>${new Date()}</p>` ) 
})

app.get(`/api/persons/:id`, (request, response, next) => {
    // const id = Number(request.params.id);
    // const person = persons.filter(person => person.id === id)
    // if (person) {
    //     response.json(person);
    // } else {
    //     response.status(404).end();
    // }
    Person.findById(request.params.id)
        .then(person => {
            if(person) {
                response.json(person)
            } else {
                response.status(404).end()
            }
        })
        .catch(error => next(error))
        
        
})

app.delete('/api/persons/:id', (request, response, next) => {
    // const id = Number(request.params.id);
    // persons = persons.filter(person => person.id !== id)
    // response.status(204).end();
    Person.findByIdAndRemove(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
})

// const generateId = () => {
//     const createId = Math.max(...persons.map(person => person.id))
//     return createId + 1;
// }

const checkDuplicate = (specName) => {
    // const checkFilter = persons.filter(person => person.name === name);
    // return checkFilter.length >= 1 ? true : false;
    const checkFilter = Person.find({name : specName});
    return checkFilter.length >= 1 ? true : false;
}

app.post('/api/persons/', (request, response, next) => {
    const body = request.body
    
    // if (!body.name || !body.number || body.name === undefined || body.number === undefined) {
    //     return response.status(400).json({
    //         error: 'No content'
    //     })
    // } 
    // if (checkDuplicate(body.name) === true) {
    //     return response.status(400).json( {
    //         error: "name must be unique"
    //     })
    
    const person = new Person({
        name: body.name,
        number: body.number,
    })
    // persons = persons.concat(person)
    // response.json(persons)
    person.save()
        .then(savedPerson => {
            response.json(savedPerson)
        })
        .catch(error => next(error))
})


// CONFUSED BY NAME/NUMBER AND RUNVALDATOR PARTS
app.put('/api/persons/:id', (request, response, next) => {
    const {name, number} = request.body;
    
    const replacePerson = {
        name: body.name,
        number: body.number,
    }
    //confusing on "new"true
    Person.findByIdAndUpdate(request.params.id, {name, number}, { new:true, runValidators:true, context: 'query' })
        .then(updatedPerson => {
            response.json(updatedPerson)
        })
        .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
    response.status(400).send({error: "unknown endpoint"})
}
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.error(error.message)
    if(error.name === "CastError") {
        return response.status(400).send({error: "malformatted id"})
    } else if (error.name === "ValidationError") {
        return response.status(400).json({error: error.message})
    }
    next(error)
}
app.use(errorHandler)

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})

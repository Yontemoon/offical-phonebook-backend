const express = require('express');
const app = express();
app.use(express.json());
var morgan = require('morgan')
const cors = require('cors')
// const mongoose = require('mongoose');
require('dotenv').config()
const Person = require('./models/person')

// const password = "mmDHBOErrtNGDQD8"
// const url = `mongodb+srv://monteyoon1998:${password}@notes-database.iv3awuc.mongodb.net/phonebookApp?retryWrites=true&w=majority`;

// mongoose.set('strictQuery', false);

// const url = process.env.MONGODB_URI;
// console.log('Connected to', url)

// mongoose.connect(url)
//     .then(result => {
//         console.log("connected to MongoDB")
//     })
//     .catch(error => {
//         console.log('error connecting to MongoDB', error.message)
//     })


// const personSchema = new mongoose.Schema({
//     name: String,
//     number: Number,
// })

// personSchema.set("toJSON", {
//     transform: (document, returnedObject) => {
//         returnedObject.id = returnedObject._id.toString();
//         delete returnedObject._id;
//         delete returnedObject.__v;
//     }
// })

// const Person = mongoose.model('Person', personSchema)

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
    Person.find({}).then(persons => {
        response.json(persons);
    })
})



app.get('/info', (request, response) => {
    response.send(`<p>Phonebook has info for ${persons.length} people</p> <br/>
                    <p>${new Date()}</p>` ) 
})

app.get(`/api/persons/:id`, (request, response) => {
    // const id = Number(request.params.id);
    // const person = persons.filter(person => person.id === id)
    // if (person) {
    //     response.json(person);
    // } else {
    //     response.status(404).end();
    // }
    Person.findById(request.params.id)
        .then(person => {
            response.json(person)
        })
        .catch(error => {
            response.json({ERROR: "DOES NOT EXIST"})
    })
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

    if (!body.name || !body.number || body.name === "" || body.number === "") {
        return response.status(400).json({
            error: 'No content'
        })
    } 


    if (checkDuplicate(body.name) === true) {
        return response.status(400).json( {
            error: "name must be unique"
        })
    }
    const person = new Person({
        // id: generateId(),
        name: body.name,
        number: body.number,
    })


    // persons = persons.concat(person)
    // response.json(persons)

    person.save().then(savedPerson => {
        response.json(savedPerson)
    })
})

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})

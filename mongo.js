const mongoose = require('mongoose');



const password = process.argv[2];
const nameArgv = process.argv[3];
const numberArgv = process.argv[4];

const url = `mongodb+srv://monteyoon1998:${password}@notes-database.iv3awuc.mongodb.net/phonebookApp?retryWrites=true&w=majority`;

mongoose.set('strictQuery', false);
mongoose.connect(url);

const personSchema = new mongoose.Schema({
    name: String,
    number: Number,
})

const Person = mongoose.model("Person", personSchema) //CONSTRUCTOR FUNCTION

const person = new Person({
    name: nameArgv,
    number: numberArgv,
})

if (process.argv.length === 3) {
    console.log("PHONEBOOK:")
    Person.find({}).then(result => {
        result.forEach(person => {
            console.log(`${person.name} ${person.number}`)
        })
    mongoose.connection.close();
    })
}

if(process.argv.length === 5) {
    person.save().then(result => {
        console.log(`Added ${nameArgv} with the number ${numberArgv} to the phonebook`);
        console.log("Person saved!");
        mongoose.connection.close()
    })
}



const mongoose = require("mongoose");

if (process.argv.length < 3)
{
	console.log("Please provide password as an argument: node mongo.js <password>");
	process.exit(1);
}

const password = process.argv[2];

const url = `mongodb+srv://fullstack:${password}@cluster0.b9i9pzj.mongodb.net/phonebookApp?retryWrites=true&w=majority`;

const personSchema = new mongoose.Schema({
	name : String,
	number : String 
});

const Person = mongoose.model("Person", personSchema);

const addPerson = process.argv.length == 5; 

mongoose
	.connect(url)
	.then(result => {
		if (addPerson)
		{
			const name = process.argv[3];
			const number = process.argv[4];

			const newPerson = new Person({name, number});
			return newPerson.save();
		}
		
		return Person.find({});
	})
	.then(result => {
		if (addPerson)
			console.log(`Added ${result.name} number ${result.number} to phonebook`);
		else
		{
			if (result.length == 0)
				console.log("Empty phonebook");
			else
			{
				console.log("phonebook:");
				result.forEach(person => console.log(person.name, person.number));
			}
		}

		mongoose.connection.close();
	})
	.catch(err => console.log(err));
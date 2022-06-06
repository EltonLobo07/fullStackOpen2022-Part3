require("dotenv").config();

const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const Person = require("./models/person");

const app = express();

const PORT = process.env.PORT || 3001;

/*
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
];
*/

app.use(cors());
app.use(express.static("build"));
app.use(express.json());

morgan.token("req-body", function (req) 
{ 
	if (req.method === "POST")
		return JSON.stringify(req["body"]);

	return ""; 
});

app.use(morgan(":method :url :status :req[content-length] - :response-time ms :req-body"));

//3.1
app.get("/api/persons", function(req, res, next)
{
	Person
		.find({})
		.then(result => res.json(result))
		.catch(err => next(err));
});

//3.2
app.get("/info", function(req, res, next)
{
	Person
		.find({})
		.then(result => res.send(`Phonebook has info for ${ result.length } people <br><br> ${new Date()}`))
		.catch(err => next(err));
});

//3.3
app.get("/api/persons/:id", function(req, res, next)
{
	Person
		.findById(req.params.id)
		.then(person => {
			if (person)
				return res.json(person);

			res.status(404).end();
		})
		.catch(err => next(err));
});

//3.4
app.delete("/api/persons/:id", function(req, res, next)
{
	Person
		.findByIdAndRemove(req.params.id)
		.then(() => res.status(204).end())
		.catch(err => next(err));
});

//3.5
/*
const mx = 100; //Application breaks once number of people in the phonebook = 100

function generateId(persons)
{
	let newId = Math.floor(Math.random() * mx) + 1;

	while (persons.map(person => person.id).includes(newId))
		newId = Math.floor(Math.random() * mx) + 1;

	return newId;
}
*/

app.post("/api/persons", function(req, res, next)
{
	const body = req.body;

	if (body.name && body.number)
	{ 
		Person
			.find({})
			.then(persons => {
				const lCName = body.name.toLowerCase();

				if (persons.find(person => person.name.toLowerCase() === lCName))
					return res.status(400).json({ error : "name must be unique" });

				const person = new Person({ name: body.name, number: body.number });

				return person.save().then(result => res.json(result));
			})
			.catch(err => next(err));
	}
	else
		res.status(400).json({ error : "missing name or number" });
});

app.put("/api/persons/:id", function(req, res, next)
{
	const { name, number } = req.body;

	Person
		.findByIdAndUpdate(req.params.id, { name, number }, { new : true, runValidators: true, context : "query" })
		.then(updatedEntry => {
			if (updatedEntry)
				return res.json(updatedEntry);

			return res.status(404).end();
		})
		.catch(err => next(err));
});

const unknownEndpoint = (req, res) => res.status(404).json({ error : "unknown endpoint" });

app.use(unknownEndpoint);

const errorHandlerMiddleware = (err, req, res, next) => //eslint-disable-line no-unused-vars
{
	if (err.name === "CastError")
		return res.status(400).json({ error : "Malformatted id" });

	if (err.name === "ValidationError")
		return res.status(400).json({ error : err.message });

	return res.status(500).end();
};

app.use(errorHandlerMiddleware);

app.listen(PORT, () => console.log("Server running on PORT " + PORT));
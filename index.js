const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const app = express();

const PORT = process.env.PORT || 3001;

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

app.use(cors());

morgan.token("req-body", function (req, res) 
{ 
	if (req.method === "POST")
		return JSON.stringify(req["body"]);

	return ""; 
});

app.use(morgan(":method :url :status :req[content-length] - :response-time ms :req-body"));

//3.1
app.get("/api/persons", function(req, res)
{
	res.json(persons);
});

//3.2
app.get("/info", function(req, res)
{
	res.send(`Phonebook has info for ${ persons.length } people <br><br> ${new Date()}`);
});

//3.3
app.get("/api/persons/:id", function(req, res)
{
	const id = req.params.id;

	const person = persons.find(person => person.id == id);

	if (person)
		res.json(person);
	else
		res.status(404).end();
});

//3.4
app.delete("/api/persons/:id", function(req, res)
{
	const id = req.params.id;

	persons = persons.filter(person => person.id != id);

	res.status(204).end();
});

//3.5
app.use(express.json());
const mx = 100; //Application breaks once number of people in the phonebook = 100

function generateId()
{
	let newId = Math.floor(Math.random() * mx) + 1;

	while (persons.map(person => person.id).includes(newId))
		newId = Math.floor(Math.random() * mx) + 1;

	return newId;
}

app.post("/api/persons/", function(req, res)
{
	const body = req.body;

	if (body.name && body.number)
	{
		if (persons.find(person => person.name === body.name))
		{
			res.status(400).json({ error : "name must be unique" }); 
			//Can't figure out which status code I should assign for duplicate name requests, so assigned status code: 400
			return;
		}

		const person = {id: generateId(), name: body.name, number: body.number};

		persons = persons.concat(person);

		res.json(person);			
	}
	else
		res.status(400).json({ error : "missing name or number" });
});

app.listen(PORT, () => { console.log("Server running on PORT " + PORT) });
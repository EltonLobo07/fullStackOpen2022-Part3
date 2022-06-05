const mongoose = require("mongoose");

console.log("Connecting to the database");

mongoose
	.connect(process.env.MONGODB_URI)
	.then(result => console.log("Connected to the database"))
	.catch(err => console.log("Error connecting to the database:",err.message));

const personSchema = new mongoose.Schema({
	name : {
		type : String,
		required : true,
		minLength : 3
	},
	number : {
		type : String,
		required : true,
		minLength : 8,
		validate : {
			validator : function(v)
			{
				//Tried to use regular expression but I can't create the correct JS regex for this case
				const arr=v.split("-");

				if (arr.length > 2 || (arr.length == 2 && (arr[0].length < 2 || arr[0].length > 3)))
					return false;
				
				for (const s of arr)
					for (const ch of s)
						if (!(ch>="0" && ch<="9"))
							return false;

				return true;
			},
			message : "If formed of two parts that are separated by -, the first part has two or three numbers and the second part also consists of numbers"
		},
	}
});

personSchema.set("toJSON",{
	transform: (document, returnedObj) => {
		returnedObj.id = returnedObj._id.toString();
		delete returnedObj._id;
		delete returnedObj.__v;
	}
});

module.exports = mongoose.model("Person", personSchema);
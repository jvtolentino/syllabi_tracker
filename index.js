const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongojs = require('mongojs');
const MongoClient = require('mongodb').MongoClient;
const assert = require("assert");
const ObjectId = require('mongodb').ObjectId;


const app = express();

global.__base = path.join(__dirname, 'public');


// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Connection for MongoDB Driver
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

// Connection URL (local)
const url = 'mongodb://localhost:27017';

// Database Name
const dbName = 'lms';


// Generic function used to insert a document to DB
const InsertDocument = function(col, doc) {
	// Connect to server
	MongoClient.connect(url, (err, client) => {
		if(err) {
			console.log(err);
		} else {
			const dbo = client.db(dbName);
			const collection = dbo.collection(col);

			collection.insertOne(doc, (err, result) => {
				if(err) throw err;
			});	
		}
		client.close();
	});
}


// Generic function to find ALL documents
const findDocuments = function(db, col, callback) {
	// Get the documents collection
	const collection = db.collection(col);
	// Find some documents
	collection.find({}).toArray(function(err, docs) {
		assert.equal(err, null);
    	callback(docs);
	});
}

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++



// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Connection for MongoJS Driver
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

// Cloud connection string
//var uri = "mongodb://s2njef:1AW9omDfu2EwLxfY@cluster0-shard-00-00-t09kt.mongodb.net:27017,cluster0-shard-00-01-t09kt.mongodb.net:27017,cluster0-shard-00-02-t09kt.mongodb.net:27017/lms?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin";

// Local connection string
const db = mongojs('lms', ['syllabi', 'topics']);

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++



// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// BodyParser Middleware
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++



// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// View Engine using EJS
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++



// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Routes to Static Path and Homepage
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

// Set static path
app.use(express.static(path.join(__dirname, 'public')));


// Homepage
app.get('/syllabi_tracker', (req, res) => {
	res.render('syllabi_tracker');
});

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++



// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Routes to Courses Management
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

app.get("/courses/mgmt", (req, res) => {
	// Use connect method to connect to the server
	MongoClient.connect(url, function(err, client) {
  		assert.equal(null, err);
  		const dbo = client.db(dbName);
    	const collection = dbo.collection("courses");
    	collection.find({}).toArray(function (err, docs) {
    		res.render("courses/courses_mgmt", {
    			courses : docs
    		});
    	});
    	client.close();
	});
});


app.get('/courses/mgmt/new', (req, res) => {
	res.render('courses/new_course');
});


app.post('/courses/mgmt/create', (req, res) => {
	var newCourse = {
		code: req.body.code,
		description: req.body.description,
		units: req.body.units
	}

	InsertDocument('courses', newCourse);
	res.redirect('/courses/mgmt');
});


app.delete('/courses/mgmt/delete/:id', (req, res) => {
	MongoClient.connect(url, (err, client) => {
		const dbo = client.db(dbName);
		const collection = dbo.collection('courses');
		collection.deleteOne({_id : ObjectId(req.params.id)}, (err, result) => {
			if(err) throw err;
		});
		client.close();
	});
	res.redirect("/courses/mgmt");
});


app.get('/courses/mgmt/syllabus/:id', (req, res) => {
	
	MongoClient.connect(url, (err, client) => {
		const dbo = client.db(dbName);
		const collection1 = dbo.collection("courses");
		const collection2 = dbo.collection("topics");
		collection1.findOne({ _id : ObjectId(req.params.id)}, function(err, docs1) {
			collection2.find({ course_id : ObjectId(req.params.id)}).toArray(function(err, docs2) {
				res.render("courses/course_syllabus", {
					course : docs1,
					topics : docs2
				});
			});
		});
	});
});


app.get('/courses/mgmt/topics/new/:id', (req, res) => {
	res.render('courses/topics/new_topic', {
		course_id: req.params.id
	});
});


app.post('/courses/mgmt/topics/create', (req, res) => {
	var newTopic = {
		course_id: ObjectId(req.body.course_id),
		order_number: req.body.order_number,
		topic: req.body.topic,
		no_of_hours: req.body.no_of_hours,
		learning_outcomes: req.body.learning_outcomes,
		learning_activities: req.body.learning_activities,
		resources: req.body.resources,
		assessment: req.body.assessment
	}

	MongoClient.connect(url, (err, client) => {
		const dbo = client.db(dbName);
		const collection = dbo.collection("topics");
		collection.insertOne(newTopic, (err, result) => {
			if(err) throw err;
		});

		client.close();
	});

	res.redirect("/courses/mgmt/syllabus/"+req.body.course_id);
});

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++



// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Routes to Classess Management
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

app.get('/classes/mgmt', (req, res) => {
	// Use connect method to connect to the server
	MongoClient.connect(url, function(err, client) {
  		assert.equal(null, err);
  		const dbo = client.db(dbName);
 
    	findDocuments(db, "classes", function(docs) {
    		res.render("classes/classes_mgmt", {
    			classes : docs
    		});
			client.close();
    	});
	});
});


app.get("/classes/mgmt/new", (req, res) => {
	res.render('classes/new_class');
});


app.post('/classes/mgmt/create', (req, res) => {
	var newClass = {
		section : req.body.class_section,
		room : req.body.class_room,
		schedule : req.body.class_schedule
	}

	InsertDocument('classes', newClass);
	res.redirect('/classes/mgmt');
});

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++



// Set server to listen to port 3000
app.listen(3000, () => {
	console.log('Server started on Port 3000...');
});






/*
app.delete('/syllabi_tracker/mgmt/course/syllabus/topic/delete/:id', (req, res) => {
	db.topics.remove({_id: ObjectId(req.params.id)}, (err, result) => {
		if(err){
			console.log(err);
		}
		//res.redirect('/syllabi_tracker/mgmt/course/syllabus');
	});
});
*/



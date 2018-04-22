const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongojs = require('mongojs');
const MongoClient = require('mongodb').MongoClient;
const assert = require("assert");


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


const app = express();

// Cloud connection string
/*
var uri = "mongodb://s2njef:1AW9omDfu2EwLxfY@cluster0-shard-00-00-t09kt.mongodb.net:27017,cluster0-shard-00-01-t09kt.mongodb.net:27017,cluster0-shard-00-02-t09kt.mongodb.net:27017/lms?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin";
const db = mongojs(uri, ['syllabi', 'topics']);
*/

// Local connection string
const db = mongojs('lms', ['syllabi', 'topics']);

const ObjectId = mongojs.ObjectId;

// Body Parser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// View Engine using EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//Set static path
app.use(express.static(path.join(__dirname, 'public')));

app.get('/syllabi_tracker', (req, res) => {
	res.render('syllabi_tracker');
});


app.get('/syllabi_tracker/mgmt', (req, res) => {
	db.syllabi.find().sort({code: 1}).toArray((err, docs) => {
		res.render('syllabi_mgmt', {
			syllabi: docs
		});
	});	
});


app.get('/syllabi_tracker/mgmt/new_course', (req, res) => {
	res.render('new_course');
});


app.get('/syllabi_tracker/mgmt/course/syllabus/:id', (req, res) => {
	db.syllabi.findOne({_id: ObjectId(req.params.id)}, (err, docs_course) => {
		db.topics.find({course_id: ObjectId(req.params.id)}, (err, docs_topics) => {
			res.render('course_syllabus', {
				course: docs_course,
				topics: docs_topics
			});
		});
	});
});


app.get('/syllabi_tracker/mgmt/course/new_topic/:id', (req, res) => {
	res.render('new_topic', {
		course_id: req.params.id
	});
});


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



app.post('/syllabi_tracker/mgmt/course/create', (req, res) => {
	var newCourse = {
		code: req.body.course_code,
		description: req.body.course_description,
		units: req.body.course_units
	}

	db.syllabi.insert(newCourse, (err, result) => {
		if(err){
			console.log(err);
		} else {
			res.redirect('/syllabi_tracker/mgmt');
		}
	});
});


app.post('/syllabi_tracker/mgmt/course/topic/create', (req, res) => {
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

	db.topics.insert(newTopic, (err, result) => {
		if(err){
			console.log(err);
		} else {
			res.redirect('/syllabi_tracker/mgmt/course/syllabus/'+req.body.course_id);
		}
	})
});


app.delete('/syllabi_tracker/mgmt/course/delete/:id', (req, res) => {
	db.syllabi.remove({_id: ObjectId(req.params.id)}, (err, result) => {
		if(err){
			console.log(err);
		}
		//res.redirect('/syllabi_tracker/mgmt');
	});
});


app.delete('/syllabi_tracker/mgmt/course/syllabus/topic/delete/:id', (req, res) => {
	db.topics.remove({_id: ObjectId(req.params.id)}, (err, result) => {
		if(err){
			console.log(err);
		}
		//res.redirect('/syllabi_tracker/mgmt/course/syllabus');
	});
});


// Set server to listen to port 3000
app.listen(3000, () => {
	console.log('Server started on Port 3000...');
});
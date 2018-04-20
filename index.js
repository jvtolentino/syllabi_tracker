const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongojs = require('mongojs');

const app = express();

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
	db.syllabi.findOne({_id: ObjectId(req.params.id)}, (err, docs1) => {
		db.topics.find({course_id: ObjectId(req.params.id)}, (err, docs2) => {
			res.render('course_syllabus', {
				course: docs1,
				topics: docs2
			});
		});
	});
});


app.get('/syllabi_tracker/mgmt/course/new_topic/:id', (req, res) => {
	res.render('new_topic', {
		course_id: req.params.id
	});
});


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
		res.redirect('/syllabi_tracker/mgmt');
	});
});

// Set server to listen to port 3000
app.listen(3000, () => {
	console.log('Server started on Port 3000...');
});
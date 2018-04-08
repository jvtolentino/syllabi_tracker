const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongojs = require('mongojs');

const app = express();

const db = mongojs('lms', ['syllabi']);

// Body Parser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// View Engine using EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//Set static path
//app.use(express.static(path.join(__dirname, 'public')));

app.get('/syllabi', (req, res) => {
	res.render('syllabi');
});

app.post('/syllabi/new', (req, res) => {
	var newCourse = {
		code: req.body.course_code,
		description: req.body.course_description,
		units: req.body.course_units
	}

	console.log(newCourse);
});

// Set server to listen to port 3000
app.listen(3000, () => {
	console.log('Server started on Port 3000...');
})
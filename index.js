const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const session = require('express-session');
const favicon = require('serve-favicon');
const cors = require('cors');

const indexRouter = require('./routes/indexRouter');
const authRouter = require('./routes/authRouter');
const plantillasRouter = require('./routes/plantillasRouter');
const grupsRouter = require('./routes/grupsRouter');
const convocatoriasRouter = require('./routes/convocatoriasRouter');
const actasRouter = require('./routes/actasRouter');
const acordsRouter = require('./routes/acordsRouter');

const app = express();

dotenv.config();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 8000;
const mongoose = require('mongoose');
const mongoDB = process.env.MONGODB_URI;

mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const faviconPath = './public/images/favicon/favicon.png';
app.use(favicon(faviconPath));

app.use(session({
     secret: process.env.SECRET,
     resave: false,
     name: 'M12',
     saveUninitialized: true,
     cookie: { maxAge: 1000 * 60 * 60 },
}))

app.set('views', path.join(__dirname, 'views'));

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname + '/public')));

app.listen(port, () => {
     console.log(`SERVIDOR ESCUCHANDO EN EL PUERTO ${port}`);
});

app.use(function (req, res, next) {

     if (req.session.data) {
          res.locals.userId = req.session.data.userId;
          res.locals.nom = req.session.data.nom;
          res.locals.cognom = req.session.data.cognom;
          res.locals.role = req.session.data.role;

     }
     next();

});

app.get('/', function (req, res) {
     res.render('home')
});

app.use('/home', indexRouter);
app.use('/plantillas', plantillasRouter);
app.use('/grups', grupsRouter);
app.use('/convocatorias', convocatoriasRouter);
app.use('/actas', actasRouter);
app.use('/acords', acordsRouter);
app.use('/auth', authRouter);

function errorResponder(err, req, res, next) {

     res.render('errors/error', { error: err })
}

app.use(errorResponder)

module.exports = app;
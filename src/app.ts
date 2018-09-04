const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
import * as dotenv from 'dotenv';
import {websocketService} from './app-injectors';
const indexRouter = require('./routes/index');

const app = express();

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.config();
const result = dotenv.config({ path: './.env' });

if ((result as any).error) {
    throw (result as any).error
}

console.log((result as any).parsed)

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.set('port', process.env.PORT || 3000);

app.listen(app.get('port'), () => {
    console.log('App is running on port: ' + app.get('port'));
    console.log('  Press CTRL-C to stop\n');
});


app.set('p2p_port', process.env.P2P_PORT || 6000);
const initialPeers = process.env.peers ? process.env.peers.split(';') : [];
websocketService.initP2PConnection(app.get('p2p_port'), initialPeers);


module.exports = app;

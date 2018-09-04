import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as errorHandler from 'errorhandler';
import * as dotenv from 'dotenv';
import {websocketService} from './app-injectors';
const morgan = require('morgan');
import {indexRoutes} from './routes/index';

const app = express();

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.config();
const result = dotenv.config({ path: './.env' });

if ((result as any).error) {
    throw (result as any).error;
}

console.log((result as any).parsed);

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

indexRoutes(app);

if (process.env.ENVIRONMENT !== 'prod') {
    app.use(<any> errorHandler());
}

app.set('port', process.env.PORT || 3000);

app.listen(app.get('port'), () => {
    console.log('App is running on port: ' + app.get('port'));
    console.log('  Press CTRL-C to stop\n');
});


app.set('p2p_port', process.env.P2P_PORT || 6000);
const initialPeers = process.env.peers ? process.env.peers.split(';') : [];
websocketService.initP2PConnection(app.get('p2p_port'), initialPeers);


module.exports = app;

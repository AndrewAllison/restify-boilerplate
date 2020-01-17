const environment = process.env.NODE_ENV;
const envPath = `./environments/${process.env.NODE_ENV === 'development' ? '' : environment.toLowerCase()}.env`;
const logger = require('./basic-logger');

require('dotenv').config({
	path: envPath
});

const port = process.env.PORT || 8080;
const traceEnabled = process.env.TRACE_ENABLED || false;

const config = {
	environment,
	port,
	traceEnabled
};

if (traceEnabled)
	logger.trace(`CONFIG:${envPath}`, process);

module.exports = config;

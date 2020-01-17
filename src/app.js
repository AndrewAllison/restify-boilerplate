const restify = require('restify');
const corsMiddleware = require('restify-cors-middleware');
const CreateRouter = require('restify-router');

const router = new CreateRouter();
const logger = require('./basic-logger');
const home = require('./routes');
const config = require('./config');

const { environment, port } = config;

const cors = corsMiddleware({
  origins: ['*'],
  allowHeaders: ['Authorization'],
  exposeHeaders: ['Authorization'],
});

const server = restify.createServer({
  name: 'lookupApi',
  version: '1.0.0',
});

server.use(restify.plugins.throttle({
  burst: 100, // Max 10 concurrent requests (if tokens)
  rate: 2, // Steady state: 2 request / 1 seconds
  ip: true, // throttle per IP
}));
server.pre(cors.preflight);
server.use(cors.actual);
server.use(restify.plugins.bodyParser());
server.use(restify.plugins.acceptParser(server.acceptable));
server.use(restify.plugins.queryParser());
server.use(restify.plugins.gzipResponse());

router.add('/api', home);
router.applyRoutes(server);

server.on('after', restify.plugins.metrics({ server }, (err, metrics) => {
  logger.trace(`${metrics.method} ${metrics.path} ${metrics.statusCode} ${metrics.latency} ms`);
}));

server.listen(port, () => {
  logger.info('%s listening at %s: %s', server.name, server.url, environment);
});

server.on('uncaughtException', (req, res, route, err) => {
  logger.error(err);
});

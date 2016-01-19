/* jslint node: true, boss: true, curly: true, eqeqeq: true, eqnull: true, expr: true,
   immed: true, noarg: true, quotmark: single, undef: true, unused: true, sub: true
*/
'use strict';

var express      = require('express'),
    morgan       = require('morgan'),
    serveStatic  = require('serve-static'),
    errorhandler = require('errorhandler'),
    path         = require('path'),
    app          = express(),
    appServer    = require('http').createServer(app);

app.use(morgan('combined'));
app.use('/',       serveStatic(path.join(__dirname, '../../public')));
app.use('/static', serveStatic(path.join(__dirname, '../../public')));
if (process.env.NODE_ENV === 'development') {
    app.use(errorhandler());
}

var port = process.env.PORT || 8000;
appServer.listen(port, function () {
    console.log('Listening on port ' + port);
});

process.on('uncaughtException', function (exc) {
    console.error(exc);
});

/* jslint node: true, boss: true, curly: true, eqeqeq: true, eqnull: true, expr: true,
   immed: true, noarg: true, quotmark: single, undef: true, unused: true, sub: true
*/
'use strict';

var ot           = require('ot'),
    morgan       = require('morgan'),
    serveStatic  = require('serve-static'),
    errorhandler = require('errorhandler'),
    path         = require('path'),
    express      = require('express'),
    _            = require('lodash'),
    app          = express(),
    server       = require('http').createServer(app),
    io           = require('socket.io')(server);

app.use(morgan('combined'));
app.use('/',       serveStatic(path.join(__dirname, '../../public')));
app.use('/static', serveStatic(path.join(__dirname, '../../public')));
if (process.env.NODE_ENV === 'development') {
    app.use(errorhandler());
}

var docIds = ['demo01', 'demo02'];
_.each(docIds, function (docId) {
    var socketIOServer = new ot.EditorSocketIOServer(
        '# This is a Markdown heading', [], docId,
        function (socket, cb) {
            cb(!!socket.mayEdit);
        }
    );

    io.of(docId).on('connection', function (socket) {
        socketIOServer.addClient(socket);
        socket.on('login', function (obj) {
            if (typeof obj.name !== 'string') {
                console.error('obj.name is not a string');
                return;
            }
            socket.mayEdit = true;
            socketIOServer.setName(socket, obj.name);
            socket.emit('logged_in', {});
        });
    });
});

var port = process.env.PORT || 3000;
server.listen(port, function () {
    console.log('Listening on port ' + port);
});

process.on('uncaughtException', function (exc) {
    console.error(exc);
});

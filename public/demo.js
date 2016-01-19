/* jslint browser: true, boss: true, curly: true, eqeqeq: true, eqnull: true, expr: true,
   immed: true, noarg: true, quotmark: single, undef: true, unused: true, sub: true
 */

(function () {
    'use strict';

    var EditorClient      = ot.EditorClient,
        SocketIOAdapter   = ot.SocketIOAdapter,
        CodeMirrorAdapter = ot.CodeMirrorAdapter;

    var docIds = ['demo01', 'demo02'];
    docIds.forEach(function (docId) {
        var socket   = io.connect('http://weiwei-mac:3000/' + docId),
            username = chance.hashtag(),
            cm,
            cmClient;
        socket
            .on('doc', function (obj) {
                cm = new CodeMirror(document.getElementById('editor-wrapper-' + docId), {
                    lineWrapping: true,
                    mode: 'markdown',
                    readOnly: 'nocursor',
                    cursorBlinkRate: 0,
                    value: obj.str
                });

                cmClient = new EditorClient(
                    obj.revision,
                    obj.clients,
                    new SocketIOAdapter(socket),
                    new CodeMirrorAdapter(cm)
                );

                document.getElementById('userlist-wrapper-' + docId).appendChild(cmClient.clientListEl);
            })
            .on('logged_in', function () {
                var li = document.createElement('li');
                li.appendChild(document.createTextNode(username + ' (that\'s you!)'));
                cmClient.clientListEl.appendChild(li);
                cmClient.serverAdapter.ownUserName = username;

                cm.setOption('readOnly', false);
            })
            .emit('login', { name: username });

        // throttle/simulate latency socket.emit(), pass falsy value to disable
        (function (interval) {
            var emit = socket.emit,
                queue = [];

            if (interval) {
                socket.emit = function () {
                    queue.push(arguments);
                    return socket;
                };
                setInterval(function () {
                    if (queue.length) {
                        emit.apply(socket, queue.shift());
                    }
                }, interval);
            }
        })(50);
    });

})();
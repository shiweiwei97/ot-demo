/* jslint browser: true, boss: true, curly: true, eqeqeq: true, eqnull: true, expr: true,
   immed: true, noarg: true, quotmark: single, undef: true, unused: true, sub: true
 */

(function () {
    'use strict';

    function throttleSocket (socket, interval) {
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
    }

    function initEditor (docId) {
        var socket   = io.connect(SOCKET_URL + docId),
            username = chance.hashtag(),
            cm,
            cmClient;
        socket
            .on('doc', function (obj) {
                cm = new CodeMirror(document.getElementById(docId), {
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
        throttleSocket(socket, 50);
    }

    var EditorClient      = ot.EditorClient,
        SocketIOAdapter   = ot.SocketIOAdapter,
        CodeMirrorAdapter = ot.CodeMirrorAdapter,
        SOCKET_URL        = 'http://localhost:3000/',
        editors,
        i,
        len,
        socketReg;

    socketReg = io.connect(SOCKET_URL + 'reg');
    socketReg.on('reg_ok', function (obj) {
        console.log('received reg_ok: ' + obj.docId);
        initEditor(obj.docId);
    });

    editors = document.querySelectorAll('.editor-wrapper');
    len = editors.length;
    for (i = 0; i < len; i++) {
        // hook up all editors, each as an individual doc
        socketReg.emit('docId', { docId: editors[i].id });
    }
})();
/* jslint browser: true */

(function () {
    'use strict';

    var EditorClient      = ot.EditorClient,
        SocketIOAdapter   = ot.SocketIOAdapter,
        AjaxAdapter       = ot.AjaxAdapter,
        CodeMirrorAdapter = ot.CodeMirrorAdapter,
        disabledRegex     = /(^|\s+)disabled($|\s+)/,
        username          = chance.hashtag(),
        cm,
        cmClient,
        socket;

    socket = io.connect('/');
    socket
        .on('doc', function (obj) {
            cm = new CodeMirror(document.getElementById('editor-wrapper'), {
                lineNumbers: true,
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

            document.getElementById('userlist-wrapper').appendChild(cmClient.clientListEl);
        })
        .on('logged_in', function () {
            var li = document.createElement('li');
            li.appendChild(document.createTextNode(username + " (that's you!)"));
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
})();
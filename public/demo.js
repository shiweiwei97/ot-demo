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

    function init (str, revision, clients, serverAdapter) {
        cm.setValue(str);
        cmClient = new EditorClient(
            revision, clients,
            serverAdapter, new CodeMirrorAdapter(cm)
        );

        var userListWrapper = document.getElementById('userlist-wrapper');
        userListWrapper.appendChild(cmClient.clientListEl);

        cm.on('change', function () {
            if (!cmClient) { return; }
            console.log(cmClient.undoManager.canUndo(), cmClient.undoManager.canRedo());
        });
    }

    cm = CodeMirror(document.getElementById('editor-wrapper'), {
        lineNumbers: true,
        lineWrapping: true,
        mode: 'markdown',
        readOnly: 'nocursor',
        cursorBlinkRate: 0
    });

    socket = io.connect('/');
    socket
        .on('doc', function (obj) {
            init(obj.str, obj.revision, obj.clients, new SocketIOAdapter(socket));
        })
        .on('logged_in', function () {
            var li = document.createElement('li');
            li.appendChild(document.createTextNode(username + " (that's you!)"));
            cmClient.clientListEl.appendChild(li);
            cmClient.serverAdapter.ownUserName = username;

            cm.setOption('readOnly', false);
        })
        .emit('login', { name: username });

    // throttle socket.emit()
    (function () {
        var emit = socket.emit,
            queue = [];

        socket.emit = function () {
            queue.push(arguments);
            return socket;
        };

        setInterval(function () {
            if (queue.length) {
                emit.apply(socket, queue.shift());
            }
        }, 50);
    })();
})();
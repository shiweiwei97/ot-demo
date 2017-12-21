var spawn = require('child_process').spawn;
var process = spawn('python', ['./sync.py']);

process.stdout.on('data', function(data) {
    console.log('' + data);
});

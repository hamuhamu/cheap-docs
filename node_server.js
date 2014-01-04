var config = require('./config');
var io = require('websocket.io');
var users = new Object();
var edits = new Object();
var cells = new Object();

var ws_server = io.listen(config.port, function() {
  console.log('listen ... ');
})
.on('connection', function(socket) {
    
    socket.send(JSON.stringify({
                                mode: 'init',
                                users: users,
                                edits: edits,
                                cells: cells } ));
    
    socket.on('message', function(message) {
        var json = JSON.parse(message);
        if (json.mode == 'login') {
            users[json.id] = json.name;
        } else if (json.mode == 'logout') {
            delete users[json.id];
            delete edits[json.index];
        } else if (json.mode == 'edit') {
            edits[json.index] = json.id;
        } else if (json.mode == 'editing') {
            cells[json.index] = json.text;
        } else if (json.mode == 'edited') {
            delete edits[json.index];
        }
        ws_server.clients.forEach(function(client) {
            if (client != null) {
                client.send(message);
            }
        });
    });
});
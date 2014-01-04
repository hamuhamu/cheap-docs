var ws_client = new WebSocket('ws://127.0.0.1:8080');
var id;
var users;

ws_client.onopen = function() {
    id = new Date().getTime('Y');
    $('#id').html('あなたの ID ' + id);
    ws_client.send(
        JSON.stringify({ mode: 'login',id: id, name: 'ゲスト'})
    );
};

ws_client.onmessage = function(e) {
    var show_login_users = function() {
        var login_users = '';
        for (key in users) {
            login_users += key + ' : ' + users[key] + 'さん　';
        }
        $('#users').html('ログイン中のユーザ　 ' + login_users);
    }
    var json = JSON.parse(e.data);
    if (json.mode == 'init') {
        users = json.users;
        show_login_users();
        for (index in json.edits) {
            $('.cell').eq(index).attr('disabled', true);
        }
        for (index in json.cells) {
            $('.cell').eq(index).val(json.cells[index]);
        }
    } else if(json.mode == 'login') {
        users[json.id] = json.name;
        show_login_users();
    } else if(json.mode == 'logout') {
        delete users[json.id];
        show_login_users();
        $('.cell').eq(json.index).attr('disabled', false);
    } else if (json.mode == 'edit' && json.id != id) {
        $('.cell').eq(json.index).attr('disabled', true);
    } else if (json.mode == 'editing' && json.id != id) {
        $('.cell').eq(json.index).val(json.text);
    } else if (json.mode == 'edited' && json.id != id) {
        $('.cell').eq(json.index).attr('disabled', false);
    }
};

ws_client.onerror = function(e) {
    $('#error').html('WebSocket Error');
};

window.onbeforeunload = function () {
    ws_client.send(
        JSON.stringify({ mode: 'logout',id: id, index: $('.cell').index($(':focus'))})
    );
};

$('.cell').focus(function() {
    ws_client.send(
        JSON.stringify({ mode: 'edit', index: $('.cell').index(this), id: id})
    );
});
$('.cell').keyup(function() {
    ws_client.send(
        JSON.stringify({ mode: 'editing', index: $('.cell').index(this), id: id, text:$(this).val()})
    );
});
$('.cell').blur(function() {
    ws_client.send(
        JSON.stringify({ mode: 'edited', index: $('.cell').index(this), id: id})
    );
});
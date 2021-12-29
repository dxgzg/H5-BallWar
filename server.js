const WebSocket = require('ws');




const server = new WebSocket.Server({ ip: "127.0.0.1", port: 8080 });

sendAll = function(data, fd) {
    server.clients.forEach(function each(client) {
        console.log(client);
        if (client.readyState === WebSocket.OPEN && client !== fd) {

            client.send(JSON.stringify(data));
        } else {
            client.send(JSON.stringify(data)); // 自己创造自己
        }
    });
}

server.on('connection', function connection(fd, req) {
    const ip = req.socket.remoteAddress;
    const port = req.socket.remotePort;
    const clientName = ip + ":" + port;

    fd.on('message', function recv(message) {
        console.log('message recv msg:', message.toString())
        fd.send('received: ' + message + '(From Server)');
    });


    fd.on('close', function close() {
        console.log("连接关闭");
        console.log(req.socket.remoteAddress);
    });

    const data = {
        "playerName": clientName,
        "methods": "addNewPlayer"
    };
    sendAll(data, fd);


    console.log("在线人数:", server.clients.size);
});

console.log("服务器启动成功");
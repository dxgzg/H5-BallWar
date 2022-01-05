const WebSocket = require('ws')


const className = "className";
const methods = "methods";
const translateX = "translateX";
const translateY = "translateY";

let methdosSet = new Set();
methdosSet.add("moveRight");
methdosSet.add("moveLeft");
methdosSet.add("moveTop");
methdosSet.add("moveDown");

const server = new WebSocket.Server({ ip: "127.0.0.1", port: 8080 });


// data必须是对象
sendAll = function(data, fd) {
    server.clients.forEach(function each(client) {
        // console.log(client);


        if (client.readyState === WebSocket.OPEN && client !== fd) {
            client.send(JSON.stringify(data));
            if (data[methods] === "addNewPlayer") { // 需要给新添加的以前的对象
                let data2 = data;
                data2[className] = client.clientName;
                data2[translateX] = client.translateX;
                data2[translateY] = client.translateY;
                console.log(data2)
                fd.send(JSON.stringify(data2));
            }
        }
    });
}

addNewPlayer = function(fd) {
    const data = {};
    data[methods] = "addNewPlayer";
    data[className] = fd.clientName;
    data[translateX] = fd.translateX;
    data[translateY] = fd.translateY
    sendAll(data, fd);
}

delPlayer = function(fd) {
    const data = {};
    data[methods] = "delPlayer";
    data[className] = fd.clientName;
    sendAll(data, fd);
}

server.on('connection', function connection(fd, req) {
    // 初始化一下新来的连接
    const ip = req.socket.remoteAddress;
    const port = req.socket.remotePort;
    const clientName = ip + ":" + port;
    fd.clientName = clientName; // 给每个客户端绑定一个值
    fd.translateX = 0;
    fd.translateY = 0;


    fd.on('message', function recv(message) {
        let data = JSON.parse(message.toString());
        console.log('message recv msg:', data)
        if (methdosSet.has(data[methods])) {
            console.log(1111)
            fd.translateX += data[translateX];
            fd.translateY += data[translateY];
        }

        data[className] = fd.clientName;
        sendAll(data, fd);
    });

    fd.on('close', function close() {
        delPlayer(fd);
        console.log("连接关闭");
        console.log(req.socket.remoteAddress);
    });

    addNewPlayer(fd);

    console.log("在线人数:", server.clients.size);
});

console.log("服务器启动成功");
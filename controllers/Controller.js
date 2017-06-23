const 
    url = require('url'),
    config = require('../config');

class Controller {
    constructor(requestObj, responseObj){
        this.request = requestObj;
        this.response = responseObj;
        this.headersSended = false;
        this.host = config.host;
        this.port = config.port;
    }

    _getHeaders(body, mimeType){
        return {
            'Content-Length': Buffer.byteLength(body),
            'Content-Type': mimeType
        }
    }

    //Посылаем ошибку
    sendError(code, message = ''){
        message = message != '' ? message : `Error ${code}`;
        if (!this.headersSended){
            this.response.writeHead(code, this._getHeaders(message, 'text/plain'));
            this.response.end(message);
            this.headersSended = true;
        }
        console.log(message);
    }

    //Толкаем контент в ответ
    putContent(body, mimeType = 'text/html'){
        if (!this.headersSended){
            this.response.writeHead(200, this._getHeaders(body, mimeType));
            this.response.end(body);
            this.headersSended = true;
        }
    }

    parserURL(){
        return url.parse(url.parse(this.request.url.toLowerCase()).pathname.slice(1));
    }

    //Публичный метод для обработки url
    action(){
        this.headersSended = false;
    }
}

module.exports = Controller;
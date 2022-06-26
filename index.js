var http = require('http');
var https = require('https');
var url = require('url');
var  StringDecoder = require('string_decoder').StringDecoder;
var config = require('./config');
var fs = require('fs');

var httpServer = http.createServer(function(req,res){
    unifiedServer(req,res);
});
/*
var httpsServerOptions = {
    'key' : fs.readFileSync('./https/key.pem'),
    'cert': fs.readFileSync('.https/cert.pem')
};

var httpsServer = https.createServer(httpsServerOptions,function(req,res){
    unifiedServer(req,res);
});
*/

httpServer.listen(config.httpPort,function(){
    console.log("El servidor ya esta escuchando el puerto: " + config.httpPort + " con la configuracion: " + config.envName );
});

/*
httpsServer.listen(config.httpsPort,function(){
    console.log("El servidor ya esta escuchando el puerto: " + config.httpsPort + " con la configuracion: " + config.envName );
});
*/

var unifiedServer = function (req,res){

    var parsedUrl = url.parse(req.url,true)
    
    var path = parsedUrl.pathname;
    var trimmedPath = path.replace(/^\/+|\/+$/g,'');
    
    var method = req.method.toLowerCase();
    var queryStringObject = parsedUrl.query;

    var headers = req.headers;

    //obtener el payload
    var decoder = new StringDecoder('utf-8');
    var buffer = '';
    req.on('data',function(data){
        buffer += decoder.write(data);
    });

    req.on('end',function(){

        buffer += decoder.end();

        // seleccionar el handler
        var chosenHandler = typeof(router[trimmedPath])  !== 'undefined' ? router[trimmedPath] : handlers.notFound;

        var data = {
            'trimmedPath' : trimmedPath,
            'queryStringObject' : queryStringObject,
            'method' : method,
            'headers' : headers,
            'payload' : buffer
        };

        chosenHandler(data,function(statusCode,payload){
            statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

            payload = typeof(payload) == 'object' ? payload : {};

            var payloadString = JSON.stringify(payload);
            res.setHeader('Content-Type','application/json');
            res.writeHead(statusCode);
            res.end(payloadString);

            console.log('Se responde este payload: ',statusCode,payloadString);


        });

       // res.end('Hola mundo amigo\n');
        //console.log('Request received on path: '+ trimmedPath + ' with method: ' + method + ' with query: ', queryStringObject);
        //console.log('These are the headers: ', headers);
        

    });

}

var handlers = {};

//Handler de ping 
handlers.ping = function(data,callback){
    callback(200);

};

//Handler de ejemplo 
handlers.sample = function(data,callback){
    callback(406,{'name' : 'sample handler'});

};

//Handler de ejemplo 
handlers.notFound = function(data,callback){
    callback(404);
};

var router = {
    'sample' : handlers.sample,
    'ping' : handlers.ping

}

var ping = {
    'ping' : handlers.ping

}
var http = require("http");
var url = require("url");
var path = require("path");
var fs = require("fs");
var config = require("./config/webconfig");

http.createServer(function (request, response) {

    var pathName = path.normalize(url.parse(request.url).pathname);
    var fullPath = path.normalize(__dirname + "/" + pathName);
    var extName=path.extname(pathName).toLowerCase(); // .js
    var extName2=extName.replace(".","");
    var fileName=path.basename(pathName,extName);
    var fileName2=path.basename(pathName);
    var folders=path.dirname(pathName);
    var folderArr=folders.split("\\").filter(str=>str!="");
    var firstFolder=folderArr.length==0?"":folderArr[0];


    if(!fileName){
        var isfix=false;
        for(var i=0;i<config.defaultFile.length;i++){
            if(fs.existsSync(fullPath+config.defaultFile[i])){
                fullPath=fullPath+config.defaultFile[i];
                isfix=true;
                break;
            }
        }
        if(!isfix){
            fullPath=fullPath+config.defaultFile[0];
        }
    }

    console.log(fullPath);
    if(config.private_folder.indexOf(firstFolder)!=-1
        ||fileName2=="app.js") {
        //禁止访问目录
        response.writeHead(403, {'Content-Type': 'text/html'})
        response.end("<h1>403 forbidden<h1>");
    }
    else {
        fs.exists(fullPath, function (exists) {
            if (exists) {
                fs.readFile(fullPath, "binary", function (err, file) {
                    if (err) {
                        response.writeHead(500, {
                            'Content-Type': 'text/plain'
                        });
                        response.end(err.toString());
                    }
                    else {
                        var _contentType="text/html";
                        if(extName2&&config.contentType[extName2])
                        {
                            _contentType=config.contentType[extName2];
                        }
                        response.writeHead(200, {
                            'Content-Type': _contentType
                        });
                        response.write(file, "binary");
                        response.end();
                    }
                });
            }
            else {
                response.writeHead(400, {'Content-Type': 'text/html'})
                response.end("<h1>404 not found<br />File " + pathName + "  not found.<h1>");
            }
        });
    }

}).listen(config.listen_port);
console.log("listing port %d .", config.listen_port);

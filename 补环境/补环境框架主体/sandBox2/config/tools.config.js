const fs= require("fs");


function getFile(name){
    try{
        return fs.readFileSync(`./tools//${name}.js`) + "\r\n";
    }catch(e) {
        console.log(`./tools//${name}.js不存在`);
        return "";
    }
}

function getCode(){
   let code="";
   code+=getFile("toolsFunc");
   code+=getFile("envFunc");
   return code;
}
module.exports={
    getCode,getFile
}
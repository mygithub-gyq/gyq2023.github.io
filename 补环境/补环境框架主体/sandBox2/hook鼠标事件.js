document._addEventListener=document.addEventListener;
let eventList=[];
document.addEventListener=function (type,callback) {
    let _callback=callback;
    callback=function (event) {
        let obj={
            "clientX":event.clientX,
            "clientY":event.clientY,
            "timeStamp":event.timeStamp,
            "type":event.type
        }
        eventList.push(obj);
        if(event.type==="mouseup"){
            debugger;
        }
        return _callback(event);
    }
    return document._addEventListener(type,callback);
}
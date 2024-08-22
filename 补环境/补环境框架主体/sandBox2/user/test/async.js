// 异步执行的代码

// let setTimeoutEvent=ldvm.memory.asyncEvent.setTimeout;
// for(let i=0;i<setTimeoutEvent.length;i++){
//     let event=setTimeoutEvent[i];
//     if(event===undefined){
//         continue;
//     }
//     if(event.type===1){
//         event.callback();
//     }else{
//         eval(event.callback);
//     }
// }

// let promise=ldvm.memory.asyncEvent.promise;
// for(let i=0;i<promise.length;i++){
//     let callback=promise[i];
//     callback();
// }

// let loadEventList=ldvm.memory.asyncEvent.listener["load"];
// for(let i=0;i<loadEvent.length;i++){
//     let loadEvent=loadEventList[i];
//     let self=loadEvent.self;
//     let listener=loadEvent.listener;
//     listener.call(self);
// }

// 鼠标事件
// debugger;
// let loadEvent=ldvm.memory.asyncEvent.listener["load"];
// for(let i=0;i<loadEvent.length;i++){
//     let loadEvent=loadEvent[i];
//     let self=loadEvent.self;
//     let listener=loadEvent.listener;
//     listener.call(self);
// }
//
// let setTimeoutFunc=ldvm.memory.asyncEvent.setTimeout;
// for(let i=0;i<setTimeoutFunc.length;i++){
//     let event=setTimeoutFunc[i];
//     let callBack=event.callback;
//     callBack();
// }
//
// debugger;
// let mouseEvent=[];
// for(let i=0;i<mouseEvent.length;i++){
//     let event=mouseEvent[i];
//     let type=event.type;
//     let mouseEventObj={
//         "isTrusted":true
//     };
//     mouseEventObj=ldvm.toolsFunc.createProxyObj(mouseEventObj,MouseEvent,"mouseEvent");
//     ldvm.toolsFunc.setProtoArr.call(mouseEventObj,"clientX",event.clientX);
//     ldvm.toolsFunc.setProtoArr.call(mouseEventObj,"clientY",event.clientY);
//     ldvm.toolsFunc.setProtoArr.call(mouseEventObj,"timeStamp",event.timeStamp);
//     ldvm.toolsFunc.setProtoArr.call(mouseEventObj,"type",event.type);
//     let listenerList=ldvm.memory.asyncEvent.listener[type];
//     for(let j=0;j<listenerList.length;j++){
//         let callBack=listenerList[j].listener;
//         let self=listenerList[j].self;
//         callBack.call(self,mouseEventObj);
//     }
// }
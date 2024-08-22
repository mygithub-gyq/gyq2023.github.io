// hook全局window下的函数与原型

// 普通函数,atob,btoa

// 原型函数: Document,Element

ld={};//全局对象

// 函数native化
!function (){
    const $toString =Function.prototype.toString;
    const symbol =Symbol();
    const myToString=function (){
        return typeof this==='function' && this[symbol] || $toString.call(this);
    }
    function set_native(func,key,value){
        Object.defineProperty(func,key,{
            enumerable:false,
            configurable:true,
            writable:true,
            value:value
        });
    }
    delete Function.prototype.toString;
    set_native(Function.prototype,"toString",myToString);
    set_native(Function.prototype.toString,symbol,"function toString() { [native code] }");//封装原型链上的toString,如果没有的话,就会返回myToString
    ld.setNative = function (func, funcname){
        set_native(func,symbol,`function ${funcname || func.name || ''}() { [native code] }`);
    }
}();

// 函数重命名
ld.reNameFunc=function reNameFunc(func,name){
    Object.defineProperty(func,"name",{
        writable:false,
        configurable:true,
        enumerable:false,
        value:name
    })
};

// hook插件
ld.hook=function hook(func,funcInfo,isDebug,onEnter,onLeave,isExec){
    // func: 原函数,需要hook的函数
    // funcInfo: 是一个对象,objName,funcName属性
    // isDebug: 布尔类型,是否进行调试,关键点定位,回溯调用栈
    // onEnter: 函数,原函数执行前执行的函数,改原函数入参,或者输出入参
    // onLeave: 函数,原函数执行完之后执行的函数,改原函数的返回值,或者输出原函数的返回值
    // isExec: 布尔类型,是否执行原函数,比如无限debugger
    if(typeof func!=='function'){
        return func;
    }
    if(funcInfo===undefined){
        funcInfo={};
        funcInfo.objName="global";
        funcInfo.funcName = func.name || '';
    }
    if(isDebug===undefined){
        isDebug=false;
    }
    if(!onEnter){
        onEnter=function (obj){
            console.log(`{hook|${funcInfo.objName}[${funcInfo.funcName}]正在调用,参数是${JSON.stringify(obj.args)}}`);
        }
    }
    if(!onLeave){
        onLeave=function (obj){
            console.log(`{hook|${funcInfo.objName}[${funcInfo.funcName}]正在调用,返回值是[${obj.result}]}`);
        }
    }
    if(isExec===undefined){
        isExec=true;
    }
    // 替换的函数
    hookFunc=function (){
        if(isDebug){
            debugger;
        }
        let obj={};
        obj.args=[];
        for(let i=0;i<arguments.length;i++){
            obj.args[i]=arguments[i];
        }
        // 原函数执行前
        onEnter.call(this,obj);
        // 原函数正在执行
        let result;
        if(isExec){
            result=func.apply(this,obj.args);
        }
        obj.result=result;
        // 原函数执行后
        onLeave.call(this,obj);
        // 返回结果
        return obj.result;
    }
    // hook 后的函数进行native化

    ld.setNative(hookFunc,funcInfo.funcName);
    ld.reNameFunc(hookFunc,funcInfo.funcName);
    return hookFunc;
};

// hook对象的属性,本质是替换属性描述符
ld.hookObj=function hookObj(obj,objName,propName,isDebug){
    // obj: 需要hook的对象
    // objName: hook对象的名字
    // propName: 需要hook的对象属性名
    // isDebug: 是否进行debugger

    let oldDescriptor=Object.getOwnPropertyDescriptor(obj,propName);
    let newDescriptor={};
    if(!oldDescriptor.configurable){
        return;
    }
    // 必须有的属性描述
    newDescriptor.configurable=true;
    newDescriptor.enumerable=oldDescriptor.enumerable;

    if(oldDescriptor.hasOwnProperty("writable")){
        newDescriptor.writable=oldDescriptor.writable;
    }

    if(oldDescriptor.hasOwnProperty("value")){
        let value=oldDescriptor.value;
        if(typeof value!=="function"){
            return;
        }

        let funcInfo={
            "objName":objName,
            "funcName":propName
        }
        newDescriptor.value=ld.hook(value,funcInfo,isDebug);
    }

    if(oldDescriptor.hasOwnProperty("get")){
        let get=oldDescriptor.get;
        let funcInfo={
            "objName":objName,
            "funcName":`get ${propName}`
        }
        newDescriptor.get=ld.hook(get,funcInfo,isDebug);
    }

    if(oldDescriptor.hasOwnProperty("set")){
        let set=oldDescriptor.set;
        let funcInfo={
            "objName":objName,
            "funcName":`set ${propName}`
        }
        newDescriptor.set=ld.hook(set,funcInfo,isDebug);
    }

    Object.defineProperty(obj,propName,newDescriptor);
};

// hook原型对象的所有属性
ld.hookProto=function hookProto(proto,isDebug){
    // proto: 函数原型
    // isDebug: 是否debugger
    let protoObj=proto.prototype;
    let name=proto.name;
    for(const prop in Object.getOwnPropertyDescriptors(protoObj)){
        ld.hookObj(protoObj,`${name}.prototype`,prop,isDebug)
    }
    console.log(`hook${name}.prototype`);
};

// hook全局对象
ld.hookGlobal=function hookGlobal(isDebug){
    for(const key in Object.getOwnPropertyDescriptors(window)){
        if(typeof window[key]==="function"){
            if(typeof window[key].prototype==="object"){
                // 函数原型
                ld.hookProto(window[key],isDebug);
            }else if(window[key].prototype==="undefined"){
                // 普通函数
                let funcInfo={
                    "objName":"global",
                    "funcName":key
                }
                ld.hook(window[key],funcInfo,isDebug);
            }
        }
    }
};

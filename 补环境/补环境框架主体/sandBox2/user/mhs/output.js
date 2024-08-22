// 全局对象配置
debugger;

ldvm={
    "toolsFunc":{},// 功能函数相关,插件
    "envFunc":{},// 具体环境实现相关
    "config":{},// 配置相关
    "memory":{},// 内存
}
ldvm.config.proxy= false;// 是否开启代理

ldvm.config.print= true;// 是否输出日志

ldvm.memory.symbolProxy=Symbol("proxy");// 独一无二的属性

ldvm.memory.filterProxyProp = [ldvm.memory.symbolProxy,ldvm.memory.symbolData,Symbol.toPrimitive,Symbol.toStringTag,"eval"];// 需要过滤的属性

ldvm.memory.tag=[];// 内存,存储tag标签

ldvm.memory.symbolData = Symbol("data");// 用来保存当前对象上的原型属性

ldvm.memory.globalVar={};// 存储全局变量

ldvm.memory.globalVar.cookieJson={};//json格式的cookie

// ldvm.memory.globalVar.fontList=["SimHei","SimSun","NSimSun","FangSong","KaiTi"];// 浏览器能够识别的字体
//
// ldvm.memory.asyncEvent={};//异步事件
//
// ldvm.memory.globalVar.timeoutID=0;

// ldvm.memory.globalVar.all=new ldObj();



// 插件功能相关,比如代理器,hook插件,等等
!function (){
    // 创建MimeType
    ldvm.toolsFunc.createMimeType=function createMimeType(mimeTypeJson,plugin){
        let mimeType={};
        ldvm.toolsFunc.createProxyObj(mimeType,MimeType,"mimeType");
        ldvm.toolsFunc.setProtoArr.call(mimeType,"description",mimeTypeJson.description);
        ldvm.toolsFunc.setProtoArr.call(mimeType,"suffixes",mimeTypeJson.suffixes);
        ldvm.toolsFunc.setProtoArr.call(mimeType,"type",mimeTypeJson.type);
        ldvm.toolsFunc.setProtoArr.call(mimeType,"enabledPlugin",plugin);
        ldvm.toolsFunc.addMimeType(mimeType);
        return mimeType;
    }
    // // 创建pluginArray
    ldvm.toolsFunc.createPluginArray=function createPluginArray(){
        let pluginArray={};
        pluginArray=ldvm.toolsFunc.createProxyObj(pluginArray,PluginArray,"pluginArray");
        ldvm.toolsFunc.setProtoArr.call(pluginArray,"length",0);
        return pluginArray;
    }
        // 添加插件
    ldvm.toolsFunc.addPlugin = function addPlugin(plugin) {
        let pluginArray = ldvm.memory.globalVar.pluginArray;
        if (pluginArray === undefined) {
            pluginArray = ldvm.toolsFunc.createPluginArray();
        }
        let index = pluginArray.length;
        pluginArray[index] = plugin;
        Object.defineProperty(pluginArray, plugin.name, {
            value: plugin,
            writable: false,
            enumerable: false,
            configurable: true
        });
        ldvm.toolsFunc.setProtoArr.call(pluginArray, "length", index + 1);
        ldvm.memory.globalVar.pluginArray = pluginArray;
        return pluginArray;
    };
    ldvm.toolsFunc.createMimeTypeArray=function createMimeTypeArray(){
        let mimeTypeArray={};
        mimeTypeArray=ldvm.toolsFunc.createProxyObj(mimeTypeArray,MimeTypeArray,"mimeTypeArray");
        ldvm.toolsFunc.setProtoArr.call(mimeTypeArray,"length",0);
        return mimeTypeArray;
    }
    ldvm.toolsFunc.addMimeType = function addMimeType(mimeType) {
        let mimeTypeArray = ldvm.memory.globalVar.mimeTypeArray;
        if (mimeTypeArray === undefined) {
            mimeTypeArray = ldvm.toolsFunc.createMimeTypeArray();
        }
        let index = mimeTypeArray.length;
        let flag = true;
        for (let i = 0; i < index; i++) {
            if (mimeTypeArray[i].type === mimeType.type) {
                flag = false;
            }
        }
        if (flag) {
            mimeTypeArray[index] = mimeType;
            Object.defineProperty(mimeTypeArray, mimeType.type, {
                value: mimeType,
                writable: false,
                enumerable: false,
                configurable: true
            });
            ldvm.toolsFunc.setProtoArr.call(mimeTypeArray, "length", index + 1);
        }
        ldvm.memory.globalVar.mimeTypeArray = mimeTypeArray;
        return mimeTypeArray;
    };
    // // 创建plugin
    ldvm.toolsFunc.createPlugin=function createPlugin(data){
        let mimeTypes=data.mimeTypes;
        let plugin={};
        plugin=ldvm.toolsFunc.createProxyObj(plugin,Plugin,"plugin");
        ldvm.toolsFunc.setProtoArr.call(plugin,"description",data.description);
        ldvm.toolsFunc.setProtoArr.call(plugin,"filename",data.filename);
        ldvm.toolsFunc.setProtoArr.call(plugin,"name",data.name);
        ldvm.toolsFunc.setProtoArr.call(plugin,"length",mimeTypes.length);
        for(let i=0;i<mimeTypes.length;i++){
            let mimeType=ldvm.toolsFunc.createMimeType(mimeTypes[i],plugin);
            plugin[i]=mimeType;
            Object.defineProperty(plugin,mimeTypes[i].type,{
                value:mimeType,
                writable:false,
                enumerable:false,
                configurable:true
            });
        }
        ldvm.toolsFunc.addPlugin(plugin);
        return plugin;
    }
    // url解析成JSON格式
    ldvm.toolsFunc.parseUrl=function parseUrl(url) {
        let urlObj;
        // 尝试创建URL对象，如果URL无效则返回空对象
        try {
            urlObj = new URL(url);
        } catch (e) {
            return {
                hash: "",
                search: "",
                pathname: "",
                port: "",
                hostname: "",
                host: "",
                protocol: "",
                href: "",
                origin: ""
            };
        }

        let json = {
            hash: urlObj.hash || "",
            search: urlObj.search || "",
            pathname: urlObj.pathname || "",
            port: urlObj.port || "",
            hostname: urlObj.hostname || "",
            host: urlObj.host || "",
            protocol: urlObj.protocol || "",
            href: urlObj.href || "",
            origin: urlObj.origin || ""
        };

        return json;
    }
    // 字符串标签解析
    ldvm.toolsFunc.getTagJson=function getTagJson(tagStr){
        let match = tagStr.match(/<(.+?)>/);
        if (!match) return null;
        let arrList = match[1].split(/\s+/);
        let tagJson = {};
        tagJson["type"] = arrList[0];
        tagJson["prop"] = {};

        for(let i = 1; i < arrList.length; i++){
            let item = arrList[i].split("=");
            let key = item[0];
            let value = item[1] ? item[1].replace(/['"]/g, '') : null;
            tagJson["prop"][key] = value;
        }
        return tagJson;
    };
    ldvm.toolsFunc.getCollection=function getCollection(type){
        let collection=[];
        for(let i=0;i<ldvm.memory.tag.length;i++){
            let tag=ldvm.memory.tag[i];
            if(ldvm.toolsFunc.getType(tag)===type){
                collection.push(tag);
            }
        }
        return collection;
    }
    // 获取原型对象上的自身属性值
    ldvm.toolsFunc.getProtoArr=function getProtoArr(key){
        return this[ldvm.memory.symbolData] && this[ldvm.memory.symbolData][key];
    }
    // 设置原型对象上的自身属性值
    ldvm.toolsFunc.setProtoArr=function setProtoArr(key,value){
        if(!(ldvm.memory.symbolData in this)){
            Object.defineProperty(this,ldvm.memory.symbolData,{
                enumerable:false,
                configurable:false,
                writable:true,
                value:{}
            });
        }
        this[ldvm.memory.symbolData][key]=value;
    }
    // 获取一个自增的ID
    ldvm.toolsFunc.getID=function getID(){
        if(ldvm.memory.ID===undefined){
            ldvm.memory.ID=0;
        }
        ldvm.memory.ID+=1;
        return ldvm.memory.ID;
    }
    // 代理原型对象
    ldvm.toolsFunc.createProxyObj=function createProxyObj(obj,proto,name){
        Object.setPrototypeOf(obj,proto.prototype);
        return ldvm.toolsFunc.proxy(obj,`${name}_ID(${ldvm.toolsFunc.getID()})`);
    }
    // 获取类型
    ldvm.toolsFunc.getType=function getType(obj){
        return Object.prototype.toString.call(obj);
    }
    // 过滤代理属性
    ldvm.toolsFunc.filterProxyProp=function filterProxyProp(prop){
        for(let i=0;i<ldvm.memory.filterProxyProp.length;i++){
            if(ldvm.memory.filterProxyProp[i]===prop){
                return true;
            }
        }
        return false;
    }
    // 代理器
    ldvm.toolsFunc.proxy = function proxy(obj,objName){
    // obj:原始对象
    // objName:原始对象的名字
    if(!ldvm.config.proxy){
        return obj;
    }
    if(ldvm.memory.symbolProxy in obj){// 判断对象obj是否是已代理的对象
        return obj[ldvm.memory.symbolProxy];
    }
    let handler={
        get:function (target,prop,receiver){
        // target: 原始对象,这里是user
        // prop: 属性
        // receiver: 代理后的对象
            let result;
            try{// 防止报错
                result=Reflect.get(target,prop,receiver);
                if(ldvm.toolsFunc.filterProxyProp(prop)){
                    return result;
                }
                let type=ldvm.toolsFunc.getType(result);
                if(result instanceof Object){
                    console.log(`{get|obj:[${objName}] --> prop:[${prop.toString()}],type:[${type}]}`);
                    // 如果是对象,还要进行递归代理
                    result=ldvm.toolsFunc.proxy(result,`${objName}.${prop.toString()}`);
                }else if(typeof result==="symbol") {
                    console.log(`{get|obj:[${objName}] --> prop:[${prop.toString()}],ret:[${result.toString()}]}`);
                }else{
                    console.log(`{get|obj:[${objName}] --> prop:[${prop.toString()}],ret:[${result}]}`);
                }
            }catch (e){
                console.log(`{get|obj:[${objName}] --> prop:[${prop.toString()}],error:[${e.message}]}`);
            }
            return result;
        },
        set:function (target,prop,value,receiver){
            let result;
            try{
                result=Reflect.set(target,prop,value,receiver);
                let type=ldvm.toolsFunc.getType(value);
                if(value instanceof Object){
                    console.log(`{set|obj:[${objName}] --> prop:[${prop.toString()}],type:[${type}]}`);
                }else if(typeof value==="symbol") {
                    console.log(`{set|obj:[${objName}] --> prop:[${prop.toString()}],value:[${value.toString()}]}`);
                }else{
                    console.log(`{set|obj:[${objName}] --> prop:[${prop.toString()}],value:[${value}]}`);
                }
            }catch (e){
                console.log(`{set|obj:[${objName}] --> prop:[${prop.toString()}],error:[${e.message}]}`);
            }
            return result;
        },
        getOwnPropertyDescriptor:function (target,prop){
            let result;// undefined,描述符对象
            try{
                result=Reflect.getOwnPropertyDescriptor(target,prop);
                let type=ldvm.toolsFunc.getType(result);
                if("constructor"!==prop){
                console.log(`{getOwnPropertyDescriptor|obj:[${objName}] --> prop:[${prop.toString()}],type:[${type}]}`);}
                // if(typeof result!=="undefined"){
                //     result=ld.proxy(result,`${objName}.${prop.toString()}.PropertyDescriptor`);
                // }
            }catch (e){
                console.log(`{getOwnPropertyDescriptor|obj:[${objName}] --> prop:[${prop.toString()}],error:[${e.message}]}`);
            }
            return result;
        },
        defineProperty:function (target,prop,descriptor){
            let result;
            try{
                result=Reflect.defineProperty(target,prop,descriptor);
                console.log(`{defineProperty|obj:[${objName}] --> prop:[${prop.toString()}]}`);
            }catch (e){
                console.log(`{defineProperty|obj:[${objName}] --> prop:[${prop.toString()}],error:[${e.message}]}`);
            }
            return result;
        },
        apply:function (target,thisArg,argumentsList){
            // target: 函数对象
            // thisArg: 调用函数的this指针
            // argumentList: 数组,函数的入参组成的一个列表
            let result;
            try{
                result=Reflect.apply(target,thisArg,argumentsList);
                let type=ldvm.toolsFunc.getType(result);
                if(result instanceof Object){
                    console.log(`{apply|function:[${objName}],args:[${argumentsList}], type:[${type}]}`);
                }else if(typeof result==="symbol"){
                    console.log(`{apply|function:[${objName}], args:[${argumentsList}],result:[${result.toString()}]}`);
                }else{
                    console.log(`{apply|function:[${objName}], args:[${argumentsList}],result:[${result}]}`);
                }
            }catch (e){
                console.log(`{apply|function:[${objName}],args:[${argumentsList}],error:[${e.message}]}`);
            }
            return result;
        },
        construct:function (target,argArray,newTarget){
            // target: 函数对象
            // argArray: 参数列表
            // newTarget: 代理对象
            let result;
            try{
                result=Reflect.construct(target,argArray,newTarget);
                let type=ldvm.toolsFunc.getType(result);
                console.log(`{construct|function:[${objName}], type:[${type}]}`);
            }catch (e){
                console.log(`{construct|function:[${objName}],error:[${e.message}]}`);
            }
            return result;
        },
        deleteProperty:function (target,propKey){
            let result=Reflect.deleteProperty(target,propKey);
            console.log(`{deleteProperty|obj:[${objName}] --> prop:[${propKey.toString()}],result:[${result}]}`);
            return result;
        },
        has:function (target,propKey){
            let result=Reflect.has(target,propKey);
            if(propKey!==ldvm.memory.symbolProxy){
            console.log(`{has|obj:[${objName}] --> prop:[${propKey.toString()}],result:[${result}]}`);}
            return result;
        },
        ownKeys:function (target){
            let result=Reflect.ownKeys(target);
            console.log(`{ownKeys|obj:[${objName}]}`);
            return result;
        },
        getPrototypeOf:function (target){
            let result=Reflect.getPrototypeOf(target);
            console.log(`{getPrototypeOf|obj:[${objName}]}`);
            return result;
        },
        setPrototypeOf:function (target,proto){
            let result=Reflect.setPrototypeOf(target,proto);
            console.log(`{setPrototypeOf|obj:[${objName}]}`);
            return result;
        },
        preventExtensions:function (target){
            let result=Reflect.preventExtensions(target,proto);
            console.log(`{preventExtensions|obj:[${objName}]}`);
            return result;
        },
        isExtensible:function (target){
            let result=Reflect.isExtensible(target,proto);
            console.log(`{isExtensible|obj:[${objName}]}`);
            return result;
        }
    };
    let proxObj=new Proxy(obj,handler);
    Object.defineProperty(obj,ldvm.memory.symbolProxy,{
        configurable:false,
        enumerable:false,
        writable:false,
        value:proxObj
    })
    return proxObj;
}
    // hook插件
    ldvm.toolsFunc.hook=function (func,funcInfo,isDebug,onEnter,onLeave,isExec){
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
            let hookFunc=function (){
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

    ldvm.toolsFunc.setNative(hookFunc,funcInfo.funcName);
    ldvm.toolsFunc.reNameFunc(hookFunc,funcInfo.funcName);
    return hookFunc;
}
    // hook对象的属性,本质是替换属性描述符
    ldvm.toolsFunc.hookObj=function hookObj(obj,objName,propName,isDebug){
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
    ldvm.toolsFunc.hookProto=function hookProto(proto,isDebug){
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
    // ldvm.toolsFunc.hookGlobal=function hookGlobal(isDebug){
    //     for(const key in Object.getOwnPropertyDescriptors(window)){
    //         if(typeof window[key]==="function"){
    //             if(typeof window[key].prototype==="object"){
    //                 // 函数原型
    //                 ld.hookProto(window[key],isDebug);
    //             }else if(window[key].prototype==="undefined"){
    //                 // 普通函数
    //                 let funcInfo={
    //                     "objName":"global",
    //                     "funcName":key
    //                 }
    //                 ld.hook(window[key],funcInfo,isDebug);
    //             }
    //         }
    //     }
    // };
    // env函数分发器
    ldvm.toolsFunc.dispatch = function dispatch(self,obj,objName,funcName,argList,defaultValue){
        let name = `${objName}_${funcName}`;
        if(Object.getOwnPropertyDescriptor(obj,"constructor")!==undefined){
            if(Object.getOwnPropertyDescriptor(self,"constructor")!==undefined){
                // self 不是实例对象
                return ldvm.toolsFunc.throwError('TypeError','Illegal invocation');
            }
        }
        try{
            return ldvm.envFunc[name].apply(self,argList);
        }catch (e){
            if(defaultValue ===undefined){
                console.log(`[${name}]正在执行,错误信息: ${e.message}`);
            }
            return defaultValue;
        }
    }
    // 定义对象属性defineProperty
    ldvm.toolsFunc.defineProperty = function defineProperty(obj,prop,oldDescriptor){
        let newDescriptor = {};
        newDescriptor.configurable=ldvm.config.proxy || oldDescriptor.configurable;
        newDescriptor.enumerable=oldDescriptor.enumerable;
        if(oldDescriptor.hasOwnProperty("writable")){
            newDescriptor.writable=ldvm.config.proxy || oldDescriptor.writable;
        }
        if(oldDescriptor.hasOwnProperty("value")){
            let value=oldDescriptor.value;
            if(typeof value==="function"){
                ldvm.toolsFunc.safeFunc(value,prop);
            }
            newDescriptor.value=value;
        }
        if(oldDescriptor.hasOwnProperty("get")){
            let get=oldDescriptor.get;
            if(typeof get==="function"){
                ldvm.toolsFunc.safeFunc(get,`get ${prop}`);
            }
            newDescriptor.get=get;
        }
        if(oldDescriptor.hasOwnProperty("set")){
            let set=oldDescriptor.set;
            if(typeof set==="function"){
                ldvm.toolsFunc.safeFunc(set,`set ${prop}`);
            }
            newDescriptor.set=set;
        }
        Object.defineProperty(obj,prop,newDescriptor);
    }
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
        ldvm.toolsFunc.setNative = function (func, funcname){
            set_native(func,symbol,`function ${funcname || func.name || ''}() { [native code] }`);
        }
    }()
    // 对象重命名
    ldvm.toolsFunc.reNameObj = function reNameObj(obj,name){
        Object.defineProperty(obj.prototype,Symbol.toStringTag,{
            configurable:true,
            enumerable:false,
            value:name,
            writable:false
        });
    }
    // 函数重命名
    ldvm.toolsFunc.reNameFunc=function reNameFunc(func,name){
        Object.defineProperty(func,"name",{
            writable:false,
            configurable:true,
            enumerable:false,
            value:name
        })
}
    // 函数保护方法
    ldvm.toolsFunc.safeFunc = function safeFunc(func,name){
        ldvm.toolsFunc.setNative(func,name);
        ldvm.toolsFunc.reNameFunc(func,name);
    }
    // 保护原型
    ldvm.toolsFunc.safeProto = function safeProto(obj,name){
        ldvm.toolsFunc.setNative(obj,name);
        ldvm.toolsFunc.reNameObj(obj,name);
    }
    // 抛错函数
    ldvm.toolsFunc.throwError = function throwError(name,message){
        let e= new Error();
        e.name=name;
        e.message=message;
        e.stack=`${name}: ${message}\n    at snippet://`
        throw e;
    }
    // base64编码解码
    ldvm.toolsFunc.base64 = {};
    ldvm.toolsFunc.base64.base64EncodeChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    ldvm.toolsFunc.base64.base64DecodeChars = new Array(-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1, -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1);
    ldvm.toolsFunc.base64.base64encode = function (str) {
            var out, i, len;
            var c1, c2, c3;

            len = str.length;
            i = 0;
            out = "";
            while (i < len) {
                c1 = str.charCodeAt(i++) & 0xff;
                if (i == len) {
                    out += ldvm.toolsFunc.base64.base64EncodeChars.charAt(c1 >> 2);
                    out += ldvm.toolsFunc.base64.base64EncodeChars.charAt((c1 & 0x3) << 4);
                    out += "==";
                    break;
                }
                c2 = str.charCodeAt(i++);
                if (i == len) {
                    out += ldvm.toolsFunc.base64.base64EncodeChars.charAt(c1 >> 2);
                    out += ldvm.toolsFunc.base64.base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xf0) >> 4));
                    out += ldvm.toolsFunc.base64.base64EncodeChars.charAt((c2 & 0xf) << 2);
                    out += "=";
                    break;
                }
                c3 = str.charCodeAt(i++);
                out += ldvm.toolsFunc.base64.base64EncodeChars.charAt(c1 >> 2);
                out += ldvm.toolsFunc.base64.base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xf0) >> 4));
                out += ldvm.toolsFunc.base64.base64EncodeChars.charAt(((c2 & 0xf) << 2) | ((c3 & 0xc0) >> 6));
                out += ldvm.toolsFunc.base64.base64EncodeChars.charAt(c3 & 0x3f);
            }
            return out;
        }
    ldvm.toolsFunc.base64.base64decode = function (str) {
            var c1, c2, c3, c4;
            var i, len, out;

            len = str.length;
            i = 0;
            out = "";
            while (i < len) {
                do {
                    c1 = ldvm.toolsFunc.base64.base64DecodeChars[str.charCodeAt(i++) & 0xff];
                } while (i < len && c1 == -1);
                if (c1 == -1) break;

                do {
                    c2 = ldvm.toolsFunc.base64.base64DecodeChars[str.charCodeAt(i++) & 0xff];
                } while (i < len && c2 == -1);
                if (c2 == -1) break;

                out += String.fromCharCode((c1 << 2) | ((c2 & 0x30) >> 4));

                do {
                    c3 = str.charCodeAt(i++) & 0xff;
                    if (c3 == 61) return out;
                    c3 = ldvm.toolsFunc.base64.base64DecodeChars[c3];
                } while (i < len && c3 == -1);
                if (c3 == -1) break;

                out += String.fromCharCode(((c2 & 0xf) << 4) | ((c3 & 0x3c) >> 2));

                do {
                    c4 = str.charCodeAt(i++) & 0xff;
                    if (c4 == 61) return out;
                    c4 = ldvm.toolsFunc.base64.base64DecodeChars[c4];
                } while (i < len && c4 == -1);
                if (c4 == -1) break;

                out += String.fromCharCode(((c3 & 0x03) << 6) | c4);
            }
            return out;
        }
}();
// 浏览器接口具体的实现

// ldvm.envFunc.EventTarget_addEventListener = function EventTarget_addEventListener(){
//
//     console.log(this===window);
//     console.log(arguments);
//     debugger;
//     return 666;
// }
!function (){
    ldvm.envFunc.Navigator_languages_get=function Navigator_languages_get(){
        return ['zh-CN', 'zh'];
    }
    ldvm.envFunc.Document_head_get=function Document_head_get(){
        return '';
    }
    ldvm.envFunc.Navigator_javaEnabled=function Navigator_javaEnabled(){
        return true;
    }
    // ldvm.envFunc.Document_head_get=function Document_head_get(){
    //     return ldvm.toolsFunc.getProtoArr.call(this,"head");
    // }
    // ldvm.envFunc.Document_getElementsByTagName_head=function Document_getElementsByTagName_head(){
    //     return '';
    // }
    ldvm.envFunc.Document_all_get=function Document_all_get(){
        let all=ldvm.memory.globalVar.all;
        Object.setPrototypeOf(all,HTMLAllCollection.prototype);
        return all;
    }
    ldvm.envFunc.Event_timeStamp_get=function Event_timeStamp_get(){
        return ldvm.toolsFunc.getProtoArr.call(this,"timeStamp");
    }
    ldvm.envFunc.MouseEvent_clientY_get=function MouseEvent_clientY_get(){
        return ldvm.toolsFunc.getProtoArr.call(this,"clientY");
    }
    ldvm.envFunc.MouseEvent_clientX_get=function MouseEvent_clientX_get(){
        return ldvm.toolsFunc.getProtoArr.call(this,"clientX");
    }
    // ldvm.envFunc.EventTarget_addEventListener=function EventTarget_addEventListener(){
    //     let type=arguments[0];
    //     let listener=arguments[1];
    //     let options=arguments[2];
    //
    //     let event={
    //         "self":this,
    //         "type":type,
    //         "listener":listener,
    //         "options":options
    //     }
    //     if(ldvm.memory.asyncEvent.listener===undefined){
    //         ldvm.memory.asyncEvent.listener={};
    //     }
    //     if(ldvm.memory.asyncEvent.listener[type]===undefined){
    //         ldvm.memory.asyncEvent.listener[type]=[];
    //     }
    //     ldvm.memory.asyncEvent.listener[type].push(event);
    // }
    ldvm.envFunc.BatteryManager_level_get=function BatteryManager_level_get(){
        return 1;
    }
    ldvm.envFunc.BatteryManager_chargingTime_get=function BatteryManager_chargingTime_get(){
        return 0;
    }
    ldvm.envFunc.BatteryManager_charging_get=function BatteryManager_charging_get(){
        return true;
    }
    ldvm.envFunc.Navigator_getBattery=function Navigator_getBattery(){
        let batteryManager={};
        batteryManager=ldvm.toolsFunc.createProxyObj(batteryManager,BatteryManager,"batteryManager");
        let obj={
            "then":function (callBack){
                let _callBack=callBack;
                callBack=function (){
                    return _callBack(batteryManager);
                }
            if(ldvm.memory.asyncEvent.promise===undefined){
                ldvm.memory.asyncEvent.promise=[];
            }
            ldvm.memory.asyncEvent.promise.push(callBack);
            }
        }
        return obj;
    }
    ldvm.envFunc.window_clearTimeout=function window_clearTimeout(){
        let timeouID=arguments[0];
        for(let i=0;i<ldvm.memory.asyncEvent.setTimeout.length;i++){
            let event=ldvm.memory.asyncEvent.setTimeout[i];
            if(event.timeoutID===timeouID){
                delete ldvm.memory.asyncEvent.setTimeout[i];
            }
        }
    }
    ldvm.envFunc.window_setTimeout=function window_setTimeout(){
        let func=arguments[0];
        let delay=arguments[1] || 0;
        let length=arguments.length;
        let args=[];
        for(let i=2;i<length;i++){
            args.push(arguments[i]);
        }
        let type=1;
        if(typeof func!=="function"){
            type=0;
        }
        ldvm.memory.globalVar.timeoutID+=1;
        let event={
            "callback":func,
            "delay":delay,
            "args":args,
            "type":type,
            "timeoutID":ldvm.memory.globalVar.timeoutID
        }
        if(ldvm.memory.asyncEvent.setTimeout===undefined){
            ldvm.memory.asyncEvent.setTimeout=[];
        }
        ldvm.memory.asyncEvent.setTimeout.push(event);
        return ldvm.memory.globalVar.timeoutID;
    }
    ldvm.envFunc.XMLHttpRequest_open=function XMLHttpRequest_open(){
        // 浏览器接口函数,xmlopen改写了
        let method=arguments[0];
        let url=arguments[1];
        return url;
    }
    ldvm.envFunc.HTMLElement_offsetHeight_get=function HTMLElement_offsetHeight_get(){
        let fontFamily=this.style.fontFamily;
        if(ldvm.memory.globalVar.fontList.indexOf(fontFamily)!==-1){//能够识别的字体
            return 666;
        }else{
            return 999;
        }
    }
    ldvm.envFunc.HTMLElement_offsetWidth_get=function HTMLElement_offsetWidth_get(){
        let fontFamily=this.style.fontFamily;
        if(ldvm.memory.globalVar.fontList.indexOf(fontFamily)!==-1){//能够识别的字体
            return 1666;
        }else{
            return 1999;
        }
    }
    ldvm.envFunc.Element_children_get=function Element_children_get(){
        return ldvm.toolsFunc.getProtoArr.call(this,"children");
    }
    ldvm.envFunc.Node_appendChild=function Node_appendChild(){
        let tag=arguments[0];
        let collection=[];
        collection.push(tag);
        collection=ldvm.toolsFunc.createProxyObj(collection,HTMLCollection,"collection");
        ldvm.toolsFunc.setProtoArr.call(this,"children",collection);
        return tag;
    }
    ldvm.envFunc.Document_body_get=function Document_body_get(){
        let collection=ldvm.toolsFunc.getCollection('[object HTMLBodyElement]');
        return collection[0];
    }
    ldvm.envFunc.Element_innerHTML_set=function Element_innerHTML_set(){
        let htmlStr=arguments[0];
        // 通用解析法,自己写一个,很难

        let style={
            "font-family":"mmll",
            "font-size":"160px",
            "fontFamily":"mmll"
        };
        style=ldvm.toolsFunc.createProxyObj(style,CSSStyleDeclaration,"style");
        let tagJson={
            "type":"span",
            "prop":{
                "lang":"zh",
                "style":style,
                "textContent":"fontTest"
            }
        }
        let span=document.createElement(tagJson["type"]);
        for(const key in tagJson["prop"]){
            ldvm.toolsFunc.setProtoArr.call(span,key,tagJson["type"][key]);
        }
        let collection=[];
        collection.push(span);
        collection=ldvm.toolsFunc.createProxyObj(collection,HTMLCollection,"collection");
        ldvm.toolsFunc.setProtoArr.call(this,"children",collection);
    }
    ldvm.envFunc.WebGLRenderingContext_canvas_get=function WebGLRenderingContext_canvas_get(){
        return ldvm.toolsFunc.getProtoArr.call(this,"canvas");
    }
    ldvm.envFunc.WebGLRenderingContext_createProgram=function WebGLRenderingContext_createProgram(){
        let program={};
        program=ldvm.toolsFunc.createProxyObj(program,WebGLProgram,"program");
        return program;
    }
    ldvm.envFunc.WebGLRenderingContext_createBuffer=function WebGLRenderingContext_createBuffer(){
        let buffer={};
        buffer=ldvm.toolsFunc.createProxyObj(buffer,WebGLBuffer,"buffer");
        return buffer;
    }
    ldvm.envFunc.HTMLCanvasElement_toDataURL=function HTMLCanvasElement_toDataURL(){
        // 返回base64形式的图片
        let type=ldvm.toolsFunc.getProtoArr.call(this,"type");
        if(type==="2d"){
            return ldvm.memory.globalVar.canvas_2d;
        }else if(type==="webgl"){
            return ldvm.memory.globalVar.canvas_webgl;
        }
    }
    ldvm.envFunc.HTMLCanvasElement_getContext=function HTMLCanvasElement_getContext(){
        let type=arguments[0];
        let context={};
        switch (type) {
            case "2d":
                context=ldvm.toolsFunc.createProxyObj(context,CanvasRenderingContext2D,"context_2d");
                ldvm.toolsFunc.setProtoArr.call(context,"canvas",this);
                ldvm.toolsFunc.setProtoArr.call(this,"type",type);
                break;
            case "webgl":
                context=ldvm.toolsFunc.createProxyObj(context,WebGLRenderingContext,"context_webgl");
                ldvm.toolsFunc.setProtoArr.call(context,"canvas",this);
                ldvm.toolsFunc.setProtoArr.call(this,"type",type);
                break;
            default:
                console.log(`HTMLCanvasElement_getContext_${type}未实现`);
                break;
        }
        return context;
    }
    ldvm.envFunc.HTMLElement_style_get=function HTMLElement_style_get(){
        let style=ldvm.toolsFunc.getProtoArr.call(this,"style");
        if(style===undefined){
            style=ldvm.toolsFunc.createProxyObj({},CSSStyleDeclaration,"style");
        }
        return style;
    }
    ldvm.envFunc.HTMLCanvasElement_height_set=function HTMLCanvasElement_height_set(){

    }
    ldvm.envFunc.HTMLCanvasElement_width_set=function HTMLCanvasElement_width_set(){

    }
    ldvm.envFunc.MimeTypeArray_item=function MimeTypeArray_item(){
        let index=arguments[0];
        return this[index];
    }
    ldvm.envFunc.MimeTypeArray_namedItem=function MimeTypeArray_namedItem(){
        let name=arguments[0];
        return this[name];
    }
    ldvm.envFunc.Plugin_item=function Plugin_item(){
        let index=arguments[0];
        return this[index];
    }
    ldvm.envFunc.Plugin_namedItem=function Plugin_namedItem(){
        let name=arguments[0];
        return this[name];
    }
    ldvm.envFunc.PluginArray_namedItem=function PluginArray_namedItem(){
        let name=arguments[0];
        return this[name];
    }
    ldvm.envFunc.PluginArray_item=function PluginArray_item(){
        let index=arguments[0];
        return this[index];
    }
    ldvm.envFunc.Navigator_mimeTypes_get=function Navigator_mimeTypes_get(){
        return ldvm.memory.globalVar.mimeTypeArray;
    }
    ldvm.envFunc.Plugin_name_get=function Plugin_name_get(){
        return ldvm.toolsFunc.getProtoArr.call(this,"name");
    }
    ldvm.envFunc.PluginArray_length_get=function PluginArray_length_get(){
        return ldvm.toolsFunc.getProtoArr.call(this,"length");
    }
    ldvm.envFunc.MimeType_type_get=function MimeType_type_get(){
        return ldvm.toolsFunc.getProtoArr.call(this,"type");
    }
    ldvm.envFunc.MimeTypeArray_length_get=function MimeTypeArray_length_get(){
        return ldvm.toolsFunc.getProtoArr.call(this,"length");
    }
    ldvm.envFunc.Navigator_plugins_get=function Navigator_plugins_get(){
        return ldvm.memory.globalVar.pluginArray;
    }
    ldvm.envFunc.HTMLAnchorElement_hash_get=function HTMLAnchorElement_hash_get(){
        return ldvm.toolsFunc.getProtoArr.call(this,"hash")
    }
    ldvm.envFunc.HTMLAnchorElement_origin_get=function HTMLAnchorElement_origin_get(){
        return ldvm.toolsFunc.getProtoArr.call(this,"origin")
    }
    ldvm.envFunc.HTMLAnchorElement_search_get=function HTMLAnchorElement_search_get(){
        return ldvm.toolsFunc.getProtoArr.call(this,"search")
    }
    ldvm.envFunc.HTMLAnchorElement_hostname_get=function HTMLAnchorElement_hostname_get(){
        return ldvm.toolsFunc.getProtoArr.call(this,"hostname")
    }
    ldvm.envFunc.HTMLAnchorElement_protocol_get=function HTMLAnchorElement_protocol_get(){
        return ldvm.toolsFunc.getProtoArr.call(this,"protocol")
    }
    ldvm.envFunc.HTMLAnchorElement_href_get=function HTMLAnchorElement_href_get(){
        return ldvm.toolsFunc.getProtoArr.call(this,"href")

    }
    ldvm.envFunc.HTMLAnchorElement_href_set=function HTMLAnchorElement_href_set(){
        let url=arguments[0];
        if(url.indexOf("http")===-1){
            url=location.protocol+"//"+location.hostname+url;
        }
        let jsonUrl=ldvm.toolsFunc.parseUrl(url);

        ldvm.toolsFunc.setProtoArr.call(this,"origin",jsonUrl["origin"]);
        ldvm.toolsFunc.setProtoArr.call(this,"protocol",jsonUrl["protocol"]);
        ldvm.toolsFunc.setProtoArr.call(this,"host",jsonUrl["host"]);
        ldvm.toolsFunc.setProtoArr.call(this,"hostname",jsonUrl["hostname"]);
        ldvm.toolsFunc.setProtoArr.call(this,"port",jsonUrl["port"]);
        ldvm.toolsFunc.setProtoArr.call(this,"pathname",jsonUrl["pathname"]);
        ldvm.toolsFunc.setProtoArr.call(this,"search",jsonUrl["search"]);
        ldvm.toolsFunc.setProtoArr.call(this,"hash",jsonUrl["hash"]);
        ldvm.toolsFunc.setProtoArr.call(this,"href",jsonUrl["href"]);
    }
    ldvm.envFunc.location_hostname_set=function location_hostname_set(){
        let value=arguments[0];
        return ldvm.toolsFunc.setProtoArr.call(this,"hostname",value);
    }
    ldvm.envFunc.location_hostname_get=function location_hostname_get(){
        return ldvm.toolsFunc.getProtoArr.call(this,"hostname");
    }
    ldvm.envFunc.location_protocol_set=function location_protocol_set(){
        let value=arguments[0];
        return ldvm.toolsFunc.setProtoArr.call(this,"protocol",value);
    }
    ldvm.envFunc.location_protocol_get=function location_protocol_get(){
        return ldvm.toolsFunc.getProtoArr.call(this,"protocol");
    }
    ldvm.envFunc.HTMLInputElement_name_set=function HTMLInputElement_name_set(){
        let value=arguments[0];
        return ldvm.toolsFunc.setProtoArr.call(this,"name",value);
    }
    ldvm.envFunc.HTMLInputElement_name_get=function HTMLInputElement_name_get(){
        return ldvm.toolsFunc.getProtoArr.call(this,"name");
    }
    ldvm.envFunc.HTMLInputElement_value_set=function HTMLInputElement_value_set(){
        let value=arguments[0];
        return ldvm.toolsFunc.setProtoArr.call(this,"value",value);
    }
    ldvm.envFunc.HTMLInputElement_value_get=function HTMLInputElement_value_get(){
        return ldvm.toolsFunc.getProtoArr.call(this,"value");
    }
    ldvm.envFunc.Element_id_set=function Element_id_set(){
        let value=arguments[0];
        return ldvm.toolsFunc.setProtoArr.call(this,"id",value);
    }
    ldvm.envFunc.Element_id_get=function Element_id_get(){
        return ldvm.toolsFunc.getProtoArr.call(this,"id");
    }
    ldvm.envFunc.Node_removeChild=function Node_removeChild(){

    }
    ldvm.envFunc.HTMLInputElement_type_set=function HTMLInputElement_type_set(){
        let value=arguments[0];
        return ldvm.toolsFunc.setProtoArr.call(this,"type",value);
    }
    ldvm.envFunc.HTMLInputElement_type_get=function HTMLInputElement_type_get(){
        return ldvm.toolsFunc.getProtoArr.call(this,"type");
    }
    ldvm.envFunc.Document_write=function Document_write(){
        let tagStr=arguments[0];
        // 解析标签字符串
        let tagJson=ldvm.toolsFunc.getTagJson(tagStr);
        let tag=document.createElement(tagJson.type);
        for(const key in tagJson.prop){
            tag[key]=tagJson.prop[key];
            if(tag[key]===undefined){
                ldvm.toolsFunc.setProtoArr.call(tag,key,tagJson.prop[key]);
            }
        }
    }
    ldvm.envFunc.Node_parentNode_get=function Node_parentNode_get(){
        return ldvm.toolsFunc.getProtoArr.call(this,"parentNode");
    }
    ldvm.envFunc.HTMLMetaElement_content_get=function HTMLMetaElement_content_get(){
        return ldvm.toolsFunc.getProtoArr.call(this,"content");
    }
    ldvm.envFunc.HTMLMetaElement_content_set=function HTMLMetaElement_content_set(){
        let value=arguments[0];
        return ldvm.toolsFunc.setProtoArr.call(this,"content",value);
    }
    ldvm.envFunc.HTMLDivElement_align_get=function HTMLDivElement_align_get(){
        return ldvm.toolsFunc.getProtoArr.call(this,"align");
    }
    ldvm.envFunc.HTMLDivElement_align_set=function HTMLDivElement_align_set(){
        let value=arguments[0];
        return ldvm.toolsFunc.setProtoArr.call(this,"align",value);
    }
    ldvm.envFunc.Storage_setItem = function Storage_setItem(){
        let keyName=arguments[0];
        let keyValue=arguments[1];
        this[keyName]=keyValue;
    }
    ldvm.envFunc.Storage_getItem = function Storage_getItem(){
        let key=arguments[0];
        if(key in this){
            return this[key]
        }
        return null;
    }
    ldvm.envFunc.Storage_removeItem = function Storage_removeItem(){
        let key=arguments[0];
        delete this[key];
    }
    ldvm.envFunc.Storage_key = function Storage_key(){
        let index=arguments[0];
        let i=0;
        for(const key in this){
            if(i===index){
                return key;
            }
            i++;
        }
        return null;
    }
    ldvm.envFunc.Storage_clear = function Storage_clear(){
        for(const key in this){
            delete this[key];
        }
    }
    ldvm.envFunc.Storage_length_get = function Storage_length_get(){
        let i=0;
        for(const key in Object.getOwnPropertyDescriptors(this)){
            i++;
        }
        return i;
    }
    ldvm.envFunc.Document_createElement=function Document_createElement(){
        let tagName=arguments[0].toLowerCase();
        let options=arguments[1];
        let tag={};
        switch (tagName){
            case "div":
                tag=ldvm.toolsFunc.createProxyObj(tag,HTMLDivElement,`Document_createElement_${tagName}`);
                ldvm.memory.tag.push(tag);
                break
            case "meta":
                tag=ldvm.toolsFunc.createProxyObj(tag,HTMLMetaElement,`Document_createElement_${tagName}`);
                ldvm.memory.tag.push(tag);
                break
            case "head":
                tag=ldvm.toolsFunc.createProxyObj(tag,HTMLHeadElement,`Document_createElement_${tagName}`);
                ldvm.memory.tag.push(tag);
                break
            case "input":
                tag=ldvm.toolsFunc.createProxyObj(tag,HTMLInputElement,`Document_createElement_${tagName}`);
                ldvm.memory.tag.push(tag);
                break
            case "a":
                tag=ldvm.toolsFunc.createProxyObj(tag,HTMLAnchorElement,`Document_createElement_${tagName}`);
                ldvm.memory.tag.push(tag);
                break
            case "canvas":
                tag=ldvm.toolsFunc.createProxyObj(tag,HTMLCanvasElement,`Document_createElement_${tagName}`);
                ldvm.memory.tag.push(tag);
                break
            case "body":
                tag=ldvm.toolsFunc.createProxyObj(tag,HTMLBodyElement,`Document_createElement_${tagName}`);
                ldvm.memory.tag.push(tag);
                break
            case "span":
                tag=ldvm.toolsFunc.createProxyObj(tag,HTMLSpanElement,`Document_createElement_${tagName}`);
                ldvm.memory.tag.push(tag);
                break
            // ....接着写别的标签
            default:
                console.log(`Document_createElement_${tagName}未实现`);
                break;
        }
        return tag;
    }
    ldvm.envFunc.Document_getElementById=function Document_getElementById(){
        let id =arguments[0];
        let tags=ldvm.memory.tag;
        for(let i=0;i<tags.length;i++){
            if(tags[i].id===id){
                return tags[i];
            }
        }
        return null;
    }
    ldvm.envFunc.Document_getElementsByTagName=function Document_getElementsByTagName(){
        let tagName=arguments[0].toLowerCase();
        let collection=[];
        switch (tagName){
            case "meta":
                collection=ldvm.toolsFunc.getCollection('[object HTMLMetaElement]');
                collection=ldvm.toolsFunc.createProxyObj(collection,HTMLCollection,`Document_getElementsByTagName_${tagName}`)
                break;
            case "head":
                return '';
            default:
                console.log(`Document_getElementsByTagName_${tagName}未实现`);
                break;
        }
        return collection;
    }
    ldvm.envFunc.Document_cookie_get=function Document_cookie_get(){
        let cookieJson=ldvm.memory.globalVar.cookieJson;
        let tempCookie="";
        for(const key in cookieJson){
            if(key===""){
                tempCookie+=`${cookieJson[key]}; `;
            }else{
                tempCookie+=`${key}=${cookieJson[key]}; `;
            }
        }
        return tempCookie;
    }
    ldvm.envFunc.Document_cookie_set=function Document_cookie_set(){
        let cookieValue=arguments[0];
        let index=cookieValue.indexOf(";");
        if(index!==-1){
            cookieValue=cookieValue.substring(0,index)
        }
        if(cookieValue.indexOf("=")===-1){
            ldvm.memory.globalVar.cookieJson[""]=cookieValue.trim();
        }else{
            let item=cookieValue.split("=");
            let key=item[0];
            let val=item[1];
            ldvm.memory.globalVar.cookieJson[key]=val;
        }
    }
    ldvm.envFunc.document_location_get=function document_location_get(){
        return location;
    }
    ldvm.envFunc.window_top_get=function window_top_get(){
        return window;
    }
    ldvm.envFunc.window_self_get=function window_self_get(){
        return window;
    }

}();
// env相关代码// EventTarget对象

EventTarget=function EventTarget(){

}
ldvm.toolsFunc.safeProto(EventTarget,"EventTarget");
ldvm.toolsFunc.defineProperty(EventTarget.prototype,"addEventListener",{
    value:function (){
        return ldvm.toolsFunc.dispatch(this,EventTarget.prototype,"EventTarget","addEventListener",arguments);
    }
});


// WindowProperties对象

WindowProperties=function WindowProperties(){

}
// 保护原型
ldvm.toolsFunc.safeProto(WindowProperties,"WindowProperties");
// 删除构造方法
delete WindowProperties.prototype.constructor;
Object.setPrototypeOf(WindowProperties.prototype,EventTarget.prototype);

// Window对象

Window=function Window(){
    return ldvm.toolsFunc.throwError("TypeError","Illegal constructor");
}
// 保护Window原型
ldvm.toolsFunc.safeProto(Window,"Window");
// 设置Window.prototype的原型对象
Object.setPrototypeOf(Window.prototype,WindowProperties.prototype);
// Window:原型的属性
ldvm.toolsFunc.defineProperty(Window,"PERSISTENT",{
    value: 1,
    writable: false,
    enumerable: true,
    configurable: false
})
ldvm.toolsFunc.defineProperty(Window,"TEMPORARY",{
    value: 0,
    writable: false,
    enumerable: true,
    configurable: false
})
// Window.prototype:原型对象的属性
ldvm.toolsFunc.defineProperty(Window.prototype,"PERSISTENT",{
    value: 1,
    writable: false,
    enumerable: true,
    configurable: false
})
ldvm.toolsFunc.defineProperty(Window.prototype,"TEMPORARY",{
    value: 0,
    writable: false,
    enumerable: true,
    configurable: false
})
// Node对象
Node = function Node(){return ldvm.toolsFunc.throwError("TypeError","Illegal constructor");}
ldvm.toolsFunc.safeProto(Node,"Node");
Object.setPrototypeOf(Node.prototype,EventTarget.prototype);
ldvm.toolsFunc.defineProperty(Node,"ELEMENT_NODE",{configurable:false,enumerable:true, writable:false, value:1});
ldvm.toolsFunc.defineProperty(Node,"ATTRIBUTE_NODE",{configurable:false,enumerable:true, writable:false, value:2});
ldvm.toolsFunc.defineProperty(Node,"TEXT_NODE",{configurable:false,enumerable:true, writable:false, value:3});
ldvm.toolsFunc.defineProperty(Node,"CDATA_SECTION_NODE",{configurable:false,enumerable:true, writable:false, value:4});
ldvm.toolsFunc.defineProperty(Node,"ENTITY_REFERENCE_NODE",{configurable:false,enumerable:true, writable:false, value:5});
ldvm.toolsFunc.defineProperty(Node,"ENTITY_NODE",{configurable:false,enumerable:true, writable:false, value:6});
ldvm.toolsFunc.defineProperty(Node,"PROCESSING_INSTRUCTION_NODE",{configurable:false,enumerable:true, writable:false, value:7});
ldvm.toolsFunc.defineProperty(Node,"COMMENT_NODE",{configurable:false,enumerable:true, writable:false, value:8});
ldvm.toolsFunc.defineProperty(Node,"DOCUMENT_NODE",{configurable:false,enumerable:true, writable:false, value:9});
ldvm.toolsFunc.defineProperty(Node,"DOCUMENT_TYPE_NODE",{configurable:false,enumerable:true, writable:false, value:10});
ldvm.toolsFunc.defineProperty(Node,"DOCUMENT_FRAGMENT_NODE",{configurable:false,enumerable:true, writable:false, value:11});
ldvm.toolsFunc.defineProperty(Node,"NOTATION_NODE",{configurable:false,enumerable:true, writable:false, value:12});
ldvm.toolsFunc.defineProperty(Node,"DOCUMENT_POSITION_DISCONNECTED",{configurable:false,enumerable:true, writable:false, value:1});
ldvm.toolsFunc.defineProperty(Node,"DOCUMENT_POSITION_PRECEDING",{configurable:false,enumerable:true, writable:false, value:2});
ldvm.toolsFunc.defineProperty(Node,"DOCUMENT_POSITION_FOLLOWING",{configurable:false,enumerable:true, writable:false, value:4});
ldvm.toolsFunc.defineProperty(Node,"DOCUMENT_POSITION_CONTAINS",{configurable:false,enumerable:true, writable:false, value:8});
ldvm.toolsFunc.defineProperty(Node,"DOCUMENT_POSITION_CONTAINED_BY",{configurable:false,enumerable:true, writable:false, value:16});
ldvm.toolsFunc.defineProperty(Node,"DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC",{configurable:false,enumerable:true, writable:false, value:32});
ldvm.toolsFunc.defineProperty(Node.prototype,"nodeType",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Node.prototype,"Node","nodeType_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Node.prototype,"nodeName",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Node.prototype,"Node","nodeName_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Node.prototype,"baseURI",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Node.prototype,"Node","baseURI_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Node.prototype,"isConnected",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Node.prototype,"Node","isConnected_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Node.prototype,"ownerDocument",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Node.prototype,"Node","ownerDocument_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Node.prototype,"parentNode",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Node.prototype,"Node","parentNode_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Node.prototype,"parentElement",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Node.prototype,"Node","parentElement_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Node.prototype,"childNodes",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Node.prototype,"Node","childNodes_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Node.prototype,"firstChild",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Node.prototype,"Node","firstChild_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Node.prototype,"lastChild",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Node.prototype,"Node","lastChild_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Node.prototype,"previousSibling",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Node.prototype,"Node","previousSibling_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Node.prototype,"nextSibling",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Node.prototype,"Node","nextSibling_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Node.prototype,"nodeValue",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Node.prototype,"Node","nodeValue_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Node.prototype,"Node","nodeValue_set",arguments)}});
ldvm.toolsFunc.defineProperty(Node.prototype,"textContent",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Node.prototype,"Node","textContent_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Node.prototype,"Node","textContent_set",arguments)}});
ldvm.toolsFunc.defineProperty(Node.prototype,"ELEMENT_NODE",{configurable:false,enumerable:true, writable:false, value:1});
ldvm.toolsFunc.defineProperty(Node.prototype,"ATTRIBUTE_NODE",{configurable:false,enumerable:true, writable:false, value:2});
ldvm.toolsFunc.defineProperty(Node.prototype,"TEXT_NODE",{configurable:false,enumerable:true, writable:false, value:3});
ldvm.toolsFunc.defineProperty(Node.prototype,"CDATA_SECTION_NODE",{configurable:false,enumerable:true, writable:false, value:4});
ldvm.toolsFunc.defineProperty(Node.prototype,"ENTITY_REFERENCE_NODE",{configurable:false,enumerable:true, writable:false, value:5});
ldvm.toolsFunc.defineProperty(Node.prototype,"ENTITY_NODE",{configurable:false,enumerable:true, writable:false, value:6});
ldvm.toolsFunc.defineProperty(Node.prototype,"PROCESSING_INSTRUCTION_NODE",{configurable:false,enumerable:true, writable:false, value:7});
ldvm.toolsFunc.defineProperty(Node.prototype,"COMMENT_NODE",{configurable:false,enumerable:true, writable:false, value:8});
ldvm.toolsFunc.defineProperty(Node.prototype,"DOCUMENT_NODE",{configurable:false,enumerable:true, writable:false, value:9});
ldvm.toolsFunc.defineProperty(Node.prototype,"DOCUMENT_TYPE_NODE",{configurable:false,enumerable:true, writable:false, value:10});
ldvm.toolsFunc.defineProperty(Node.prototype,"DOCUMENT_FRAGMENT_NODE",{configurable:false,enumerable:true, writable:false, value:11});
ldvm.toolsFunc.defineProperty(Node.prototype,"NOTATION_NODE",{configurable:false,enumerable:true, writable:false, value:12});
ldvm.toolsFunc.defineProperty(Node.prototype,"DOCUMENT_POSITION_DISCONNECTED",{configurable:false,enumerable:true, writable:false, value:1});
ldvm.toolsFunc.defineProperty(Node.prototype,"DOCUMENT_POSITION_PRECEDING",{configurable:false,enumerable:true, writable:false, value:2});
ldvm.toolsFunc.defineProperty(Node.prototype,"DOCUMENT_POSITION_FOLLOWING",{configurable:false,enumerable:true, writable:false, value:4});
ldvm.toolsFunc.defineProperty(Node.prototype,"DOCUMENT_POSITION_CONTAINS",{configurable:false,enumerable:true, writable:false, value:8});
ldvm.toolsFunc.defineProperty(Node.prototype,"DOCUMENT_POSITION_CONTAINED_BY",{configurable:false,enumerable:true, writable:false, value:16});
ldvm.toolsFunc.defineProperty(Node.prototype,"DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC",{configurable:false,enumerable:true, writable:false, value:32});
ldvm.toolsFunc.defineProperty(Node.prototype,"appendChild",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Node.prototype,"Node","appendChild",arguments)}});
ldvm.toolsFunc.defineProperty(Node.prototype,"cloneNode",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Node.prototype,"Node","cloneNode",arguments)}});
ldvm.toolsFunc.defineProperty(Node.prototype,"compareDocumentPosition",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Node.prototype,"Node","compareDocumentPosition",arguments)}});
ldvm.toolsFunc.defineProperty(Node.prototype,"contains",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Node.prototype,"Node","contains",arguments)}});
ldvm.toolsFunc.defineProperty(Node.prototype,"getRootNode",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Node.prototype,"Node","getRootNode",arguments)}});
ldvm.toolsFunc.defineProperty(Node.prototype,"hasChildNodes",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Node.prototype,"Node","hasChildNodes",arguments)}});
ldvm.toolsFunc.defineProperty(Node.prototype,"insertBefore",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Node.prototype,"Node","insertBefore",arguments)}});
ldvm.toolsFunc.defineProperty(Node.prototype,"isDefaultNamespace",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Node.prototype,"Node","isDefaultNamespace",arguments)}});
ldvm.toolsFunc.defineProperty(Node.prototype,"isEqualNode",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Node.prototype,"Node","isEqualNode",arguments)}});
ldvm.toolsFunc.defineProperty(Node.prototype,"isSameNode",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Node.prototype,"Node","isSameNode",arguments)}});
ldvm.toolsFunc.defineProperty(Node.prototype,"lookupNamespaceURI",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Node.prototype,"Node","lookupNamespaceURI",arguments)}});
ldvm.toolsFunc.defineProperty(Node.prototype,"lookupPrefix",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Node.prototype,"Node","lookupPrefix",arguments)}});
ldvm.toolsFunc.defineProperty(Node.prototype,"normalize",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Node.prototype,"Node","normalize",arguments)}});
ldvm.toolsFunc.defineProperty(Node.prototype,"removeChild",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Node.prototype,"Node","removeChild",arguments)}});
ldvm.toolsFunc.defineProperty(Node.prototype,"replaceChild",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Node.prototype,"Node","replaceChild",arguments)}});

// Element对象
Element = function Element(){return ldvm.toolsFunc.throwError("TypeError","Illegal constructor");}
ldvm.toolsFunc.safeProto(Element,"Element");
Object.setPrototypeOf(Element.prototype,Node.prototype);
ldvm.toolsFunc.defineProperty(Element.prototype,"namespaceURI",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","namespaceURI_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Element.prototype,"prefix",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","prefix_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Element.prototype,"localName",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","localName_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Element.prototype,"tagName",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","tagName_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Element.prototype,"id",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","id_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","id_set",arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"className",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","className_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","className_set",arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"classList",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","classList_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","classList_set",arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"slot",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","slot_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","slot_set",arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"attributes",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","attributes_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Element.prototype,"shadowRoot",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","shadowRoot_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Element.prototype,"part",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","part_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","part_set",arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"assignedSlot",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","assignedSlot_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Element.prototype,"innerHTML",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","innerHTML_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","innerHTML_set",arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"outerHTML",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","outerHTML_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","outerHTML_set",arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"scrollTop",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","scrollTop_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","scrollTop_set",arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"scrollLeft",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","scrollLeft_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","scrollLeft_set",arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"scrollWidth",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","scrollWidth_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Element.prototype,"scrollHeight",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","scrollHeight_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Element.prototype,"clientTop",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","clientTop_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Element.prototype,"clientLeft",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","clientLeft_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Element.prototype,"clientWidth",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","clientWidth_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Element.prototype,"clientHeight",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","clientHeight_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Element.prototype,"onbeforecopy",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","onbeforecopy_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","onbeforecopy_set",arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"onbeforecut",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","onbeforecut_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","onbeforecut_set",arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"onbeforepaste",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","onbeforepaste_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","onbeforepaste_set",arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"onsearch",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","onsearch_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","onsearch_set",arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"elementTiming",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","elementTiming_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","elementTiming_set",arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"onfullscreenchange",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","onfullscreenchange_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","onfullscreenchange_set",arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"onfullscreenerror",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","onfullscreenerror_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","onfullscreenerror_set",arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"onwebkitfullscreenchange",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","onwebkitfullscreenchange_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","onwebkitfullscreenchange_set",arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"onwebkitfullscreenerror",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","onwebkitfullscreenerror_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","onwebkitfullscreenerror_set",arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"role",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","role_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","role_set",arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"ariaAtomic",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","ariaAtomic_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","ariaAtomic_set",arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"ariaAutoComplete",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","ariaAutoComplete_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","ariaAutoComplete_set",arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"ariaBusy",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","ariaBusy_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","ariaBusy_set",arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"ariaBrailleLabel",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","ariaBrailleLabel_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","ariaBrailleLabel_set",arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"ariaBrailleRoleDescription",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","ariaBrailleRoleDescription_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","ariaBrailleRoleDescription_set",arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"ariaChecked",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","ariaChecked_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","ariaChecked_set",arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"ariaColCount",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","ariaColCount_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","ariaColCount_set",arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"ariaColIndex",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","ariaColIndex_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","ariaColIndex_set",arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"ariaColSpan",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","ariaColSpan_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","ariaColSpan_set",arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"ariaCurrent",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","ariaCurrent_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","ariaCurrent_set",arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"ariaDescription",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","ariaDescription_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","ariaDescription_set",arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"ariaDisabled",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","ariaDisabled_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","ariaDisabled_set",arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"ariaExpanded",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","ariaExpanded_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","ariaExpanded_set",arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"ariaHasPopup",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","ariaHasPopup_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","ariaHasPopup_set",arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"ariaHidden",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","ariaHidden_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","ariaHidden_set",arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"ariaInvalid",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","ariaInvalid_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","ariaInvalid_set",arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"ariaKeyShortcuts",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","ariaKeyShortcuts_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","ariaKeyShortcuts_set",arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"ariaLabel",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","ariaLabel_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","ariaLabel_set",arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"ariaLevel",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","ariaLevel_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","ariaLevel_set",arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"ariaLive",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","ariaLive_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","ariaLive_set",arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"ariaModal",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","ariaModal_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","ariaModal_set",arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"ariaMultiLine",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","ariaMultiLine_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","ariaMultiLine_set",arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"ariaMultiSelectable",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","ariaMultiSelectable_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","ariaMultiSelectable_set",arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"ariaOrientation",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","ariaOrientation_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","ariaOrientation_set",arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"ariaPlaceholder",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","ariaPlaceholder_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","ariaPlaceholder_set",arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"ariaPosInSet",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","ariaPosInSet_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","ariaPosInSet_set",arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"ariaPressed",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","ariaPressed_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","ariaPressed_set",arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"ariaReadOnly",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","ariaReadOnly_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","ariaReadOnly_set",arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"ariaRelevant",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","ariaRelevant_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","ariaRelevant_set",arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"ariaRequired",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","ariaRequired_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","ariaRequired_set",arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"ariaRoleDescription",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","ariaRoleDescription_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","ariaRoleDescription_set",arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"ariaRowCount",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","ariaRowCount_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","ariaRowCount_set",arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"ariaRowIndex",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","ariaRowIndex_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","ariaRowIndex_set",arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"ariaRowSpan",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","ariaRowSpan_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","ariaRowSpan_set",arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"ariaSelected",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","ariaSelected_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","ariaSelected_set",arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"ariaSetSize",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","ariaSetSize_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","ariaSetSize_set",arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"ariaSort",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","ariaSort_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","ariaSort_set",arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"ariaValueMax",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","ariaValueMax_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","ariaValueMax_set",arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"ariaValueMin",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","ariaValueMin_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","ariaValueMin_set",arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"ariaValueNow",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","ariaValueNow_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","ariaValueNow_set",arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"ariaValueText",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","ariaValueText_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","ariaValueText_set",arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"children",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","children_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Element.prototype,"firstElementChild",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","firstElementChild_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Element.prototype,"lastElementChild",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","lastElementChild_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Element.prototype,"childElementCount",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","childElementCount_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Element.prototype,"previousElementSibling",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","previousElementSibling_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Element.prototype,"nextElementSibling",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","nextElementSibling_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Element.prototype,"after",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","after",arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"animate",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","animate",arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"append",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","append",arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"attachShadow",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","attachShadow",arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"before",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","before",arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"checkVisibility",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","checkVisibility",arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"closest",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","closest",arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"computedStyleMap",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","computedStyleMap",arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"getAnimations",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","getAnimations",arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"getAttribute",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","getAttribute",arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"getAttributeNS",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","getAttributeNS",arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"getAttributeNames",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","getAttributeNames",arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"getAttributeNode",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","getAttributeNode",arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"getAttributeNodeNS",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","getAttributeNodeNS",arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"getBoundingClientRect",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","getBoundingClientRect",arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"getClientRects",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","getClientRects",arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"getElementsByClassName",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","getElementsByClassName",arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"getElementsByTagName",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","getElementsByTagName",arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"getElementsByTagNameNS",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","getElementsByTagNameNS",arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"getInnerHTML",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","getInnerHTML",arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"hasAttribute",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","hasAttribute",arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"hasAttributeNS",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","hasAttributeNS",arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"hasAttributes",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","hasAttributes",arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"hasPointerCapture",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","hasPointerCapture",arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"insertAdjacentElement",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","insertAdjacentElement",arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"insertAdjacentHTML",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","insertAdjacentHTML",arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"insertAdjacentText",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","insertAdjacentText",arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"matches",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","matches",arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"prepend",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","prepend",arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"querySelector",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","querySelector",arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"querySelectorAll",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","querySelectorAll",arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"releasePointerCapture",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","releasePointerCapture",arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"remove",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","remove",arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"removeAttribute",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","removeAttribute",arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"removeAttributeNS",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","removeAttributeNS",arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"removeAttributeNode",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","removeAttributeNode",arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"replaceChildren",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","replaceChildren",arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"replaceWith",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","replaceWith",arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"requestFullscreen",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","requestFullscreen",arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"requestPointerLock",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","requestPointerLock",arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"scroll",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","scroll",arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"scrollBy",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","scrollBy",arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"scrollIntoView",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","scrollIntoView",arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"scrollIntoViewIfNeeded",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","scrollIntoViewIfNeeded",arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"scrollTo",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","scrollTo",arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"setAttribute",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","setAttribute",arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"setAttributeNS",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","setAttributeNS",arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"setAttributeNode",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","setAttributeNode",arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"setAttributeNodeNS",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","setAttributeNodeNS",arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"setPointerCapture",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","setPointerCapture",arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"toggleAttribute",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","toggleAttribute",arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"webkitMatchesSelector",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","webkitMatchesSelector",arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"webkitRequestFullScreen",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","webkitRequestFullScreen",arguments)}});
ldvm.toolsFunc.defineProperty(Element.prototype,"webkitRequestFullscreen",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Element.prototype,"Element","webkitRequestFullscreen",arguments)}});

// HTMLElement对象
HTMLElement = function HTMLElement(){return ldvm.toolsFunc.throwError("TypeError","Illegal constructor");}
ldvm.toolsFunc.safeProto(HTMLElement,"HTMLElement");
Object.setPrototypeOf(HTMLElement.prototype,Element.prototype);
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"title",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","title_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","title_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"lang",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","lang_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","lang_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"translate",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","translate_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","translate_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"dir",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","dir_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","dir_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"hidden",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","hidden_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","hidden_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"accessKey",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","accessKey_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","accessKey_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"draggable",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","draggable_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","draggable_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"spellcheck",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","spellcheck_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","spellcheck_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"autocapitalize",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","autocapitalize_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","autocapitalize_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"contentEditable",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","contentEditable_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","contentEditable_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"enterKeyHint",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","enterKeyHint_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","enterKeyHint_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"isContentEditable",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","isContentEditable_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"inputMode",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","inputMode_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","inputMode_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"virtualKeyboardPolicy",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","virtualKeyboardPolicy_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","virtualKeyboardPolicy_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"offsetParent",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","offsetParent_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"offsetTop",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","offsetTop_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"offsetLeft",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","offsetLeft_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"offsetWidth",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","offsetWidth_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"offsetHeight",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","offsetHeight_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"popover",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","popover_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","popover_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"innerText",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","innerText_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","innerText_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"outerText",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","outerText_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","outerText_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onbeforexrselect",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onbeforexrselect_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onbeforexrselect_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onabort",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onabort_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onabort_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onbeforeinput",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onbeforeinput_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onbeforeinput_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onbeforematch",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onbeforematch_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onbeforematch_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onbeforetoggle",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onbeforetoggle_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onbeforetoggle_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onblur",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onblur_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onblur_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"oncancel",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","oncancel_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","oncancel_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"oncanplay",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","oncanplay_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","oncanplay_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"oncanplaythrough",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","oncanplaythrough_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","oncanplaythrough_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onchange",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onchange_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onchange_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onclick",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onclick_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onclick_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onclose",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onclose_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onclose_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"oncontentvisibilityautostatechange",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","oncontentvisibilityautostatechange_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","oncontentvisibilityautostatechange_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"oncontextlost",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","oncontextlost_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","oncontextlost_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"oncontextmenu",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","oncontextmenu_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","oncontextmenu_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"oncontextrestored",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","oncontextrestored_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","oncontextrestored_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"oncuechange",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","oncuechange_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","oncuechange_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"ondblclick",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","ondblclick_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","ondblclick_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"ondrag",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","ondrag_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","ondrag_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"ondragend",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","ondragend_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","ondragend_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"ondragenter",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","ondragenter_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","ondragenter_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"ondragleave",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","ondragleave_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","ondragleave_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"ondragover",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","ondragover_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","ondragover_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"ondragstart",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","ondragstart_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","ondragstart_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"ondrop",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","ondrop_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","ondrop_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"ondurationchange",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","ondurationchange_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","ondurationchange_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onemptied",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onemptied_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onemptied_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onended",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onended_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onended_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onerror",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onerror_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onerror_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onfocus",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onfocus_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onfocus_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onformdata",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onformdata_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onformdata_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"oninput",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","oninput_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","oninput_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"oninvalid",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","oninvalid_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","oninvalid_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onkeydown",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onkeydown_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onkeydown_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onkeypress",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onkeypress_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onkeypress_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onkeyup",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onkeyup_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onkeyup_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onload",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onload_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onload_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onloadeddata",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onloadeddata_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onloadeddata_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onloadedmetadata",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onloadedmetadata_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onloadedmetadata_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onloadstart",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onloadstart_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onloadstart_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onmousedown",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onmousedown_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onmousedown_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onmouseenter",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onmouseenter_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onmouseenter_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onmouseleave",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onmouseleave_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onmouseleave_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onmousemove",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onmousemove_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onmousemove_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onmouseout",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onmouseout_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onmouseout_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onmouseover",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onmouseover_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onmouseover_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onmouseup",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onmouseup_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onmouseup_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onmousewheel",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onmousewheel_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onmousewheel_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onpause",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onpause_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onpause_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onplay",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onplay_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onplay_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onplaying",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onplaying_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onplaying_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onprogress",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onprogress_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onprogress_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onratechange",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onratechange_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onratechange_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onreset",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onreset_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onreset_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onresize",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onresize_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onresize_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onscroll",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onscroll_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onscroll_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onsecuritypolicyviolation",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onsecuritypolicyviolation_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onsecuritypolicyviolation_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onseeked",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onseeked_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onseeked_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onseeking",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onseeking_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onseeking_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onselect",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onselect_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onselect_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onslotchange",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onslotchange_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onslotchange_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onstalled",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onstalled_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onstalled_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onsubmit",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onsubmit_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onsubmit_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onsuspend",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onsuspend_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onsuspend_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"ontimeupdate",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","ontimeupdate_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","ontimeupdate_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"ontoggle",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","ontoggle_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","ontoggle_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onvolumechange",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onvolumechange_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onvolumechange_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onwaiting",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onwaiting_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onwaiting_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onwebkitanimationend",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onwebkitanimationend_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onwebkitanimationend_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onwebkitanimationiteration",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onwebkitanimationiteration_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onwebkitanimationiteration_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onwebkitanimationstart",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onwebkitanimationstart_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onwebkitanimationstart_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onwebkittransitionend",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onwebkittransitionend_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onwebkittransitionend_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onwheel",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onwheel_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onwheel_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onauxclick",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onauxclick_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onauxclick_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"ongotpointercapture",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","ongotpointercapture_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","ongotpointercapture_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onlostpointercapture",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onlostpointercapture_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onlostpointercapture_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onpointerdown",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onpointerdown_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onpointerdown_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onpointermove",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onpointermove_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onpointermove_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onpointerrawupdate",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onpointerrawupdate_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onpointerrawupdate_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onpointerup",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onpointerup_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onpointerup_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onpointercancel",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onpointercancel_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onpointercancel_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onpointerover",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onpointerover_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onpointerover_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onpointerout",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onpointerout_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onpointerout_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onpointerenter",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onpointerenter_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onpointerenter_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onpointerleave",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onpointerleave_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onpointerleave_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onselectstart",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onselectstart_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onselectstart_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onselectionchange",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onselectionchange_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onselectionchange_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onanimationend",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onanimationend_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onanimationend_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onanimationiteration",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onanimationiteration_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onanimationiteration_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onanimationstart",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onanimationstart_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onanimationstart_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"ontransitionrun",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","ontransitionrun_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","ontransitionrun_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"ontransitionstart",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","ontransitionstart_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","ontransitionstart_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"ontransitionend",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","ontransitionend_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","ontransitionend_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"ontransitioncancel",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","ontransitioncancel_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","ontransitioncancel_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"oncopy",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","oncopy_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","oncopy_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"oncut",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","oncut_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","oncut_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onpaste",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onpaste_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onpaste_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"dataset",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","dataset_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"nonce",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","nonce_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","nonce_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"autofocus",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","autofocus_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","autofocus_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"tabIndex",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","tabIndex_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","tabIndex_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"style",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","style_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","style_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"attributeStyleMap",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","attributeStyleMap_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"attachInternals",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","attachInternals",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"blur",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","blur",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"click",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","click",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"focus",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","focus",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"hidePopover",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","hidePopover",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"showPopover",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","showPopover",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"togglePopover",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","togglePopover",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"inert",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","inert_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","inert_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"onscrollend",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onscrollend_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","onscrollend_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLElement.prototype,"editContext",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","editContext_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLElement.prototype,"HTMLElement","editContext_set",arguments)}});

// HTMLAnchorElement对象
HTMLAnchorElement = function HTMLAnchorElement(){return ldvm.toolsFunc.throwError("TypeError","Illegal constructor");}
ldvm.toolsFunc.safeProto(HTMLAnchorElement,"HTMLAnchorElement");
Object.setPrototypeOf(HTMLAnchorElement.prototype,HTMLElement.prototype);
ldvm.toolsFunc.defineProperty(HTMLAnchorElement.prototype,"target",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLAnchorElement.prototype,"HTMLAnchorElement","target_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLAnchorElement.prototype,"HTMLAnchorElement","target_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLAnchorElement.prototype,"download",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLAnchorElement.prototype,"HTMLAnchorElement","download_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLAnchorElement.prototype,"HTMLAnchorElement","download_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLAnchorElement.prototype,"ping",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLAnchorElement.prototype,"HTMLAnchorElement","ping_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLAnchorElement.prototype,"HTMLAnchorElement","ping_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLAnchorElement.prototype,"rel",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLAnchorElement.prototype,"HTMLAnchorElement","rel_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLAnchorElement.prototype,"HTMLAnchorElement","rel_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLAnchorElement.prototype,"relList",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLAnchorElement.prototype,"HTMLAnchorElement","relList_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLAnchorElement.prototype,"HTMLAnchorElement","relList_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLAnchorElement.prototype,"hreflang",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLAnchorElement.prototype,"HTMLAnchorElement","hreflang_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLAnchorElement.prototype,"HTMLAnchorElement","hreflang_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLAnchorElement.prototype,"type",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLAnchorElement.prototype,"HTMLAnchorElement","type_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLAnchorElement.prototype,"HTMLAnchorElement","type_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLAnchorElement.prototype,"referrerPolicy",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLAnchorElement.prototype,"HTMLAnchorElement","referrerPolicy_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLAnchorElement.prototype,"HTMLAnchorElement","referrerPolicy_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLAnchorElement.prototype,"text",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLAnchorElement.prototype,"HTMLAnchorElement","text_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLAnchorElement.prototype,"HTMLAnchorElement","text_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLAnchorElement.prototype,"coords",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLAnchorElement.prototype,"HTMLAnchorElement","coords_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLAnchorElement.prototype,"HTMLAnchorElement","coords_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLAnchorElement.prototype,"charset",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLAnchorElement.prototype,"HTMLAnchorElement","charset_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLAnchorElement.prototype,"HTMLAnchorElement","charset_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLAnchorElement.prototype,"name",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLAnchorElement.prototype,"HTMLAnchorElement","name_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLAnchorElement.prototype,"HTMLAnchorElement","name_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLAnchorElement.prototype,"rev",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLAnchorElement.prototype,"HTMLAnchorElement","rev_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLAnchorElement.prototype,"HTMLAnchorElement","rev_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLAnchorElement.prototype,"shape",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLAnchorElement.prototype,"HTMLAnchorElement","shape_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLAnchorElement.prototype,"HTMLAnchorElement","shape_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLAnchorElement.prototype,"origin",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLAnchorElement.prototype,"HTMLAnchorElement","origin_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(HTMLAnchorElement.prototype,"protocol",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLAnchorElement.prototype,"HTMLAnchorElement","protocol_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLAnchorElement.prototype,"HTMLAnchorElement","protocol_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLAnchorElement.prototype,"username",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLAnchorElement.prototype,"HTMLAnchorElement","username_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLAnchorElement.prototype,"HTMLAnchorElement","username_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLAnchorElement.prototype,"password",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLAnchorElement.prototype,"HTMLAnchorElement","password_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLAnchorElement.prototype,"HTMLAnchorElement","password_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLAnchorElement.prototype,"host",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLAnchorElement.prototype,"HTMLAnchorElement","host_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLAnchorElement.prototype,"HTMLAnchorElement","host_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLAnchorElement.prototype,"hostname",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLAnchorElement.prototype,"HTMLAnchorElement","hostname_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLAnchorElement.prototype,"HTMLAnchorElement","hostname_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLAnchorElement.prototype,"port",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLAnchorElement.prototype,"HTMLAnchorElement","port_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLAnchorElement.prototype,"HTMLAnchorElement","port_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLAnchorElement.prototype,"pathname",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLAnchorElement.prototype,"HTMLAnchorElement","pathname_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLAnchorElement.prototype,"HTMLAnchorElement","pathname_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLAnchorElement.prototype,"search",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLAnchorElement.prototype,"HTMLAnchorElement","search_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLAnchorElement.prototype,"HTMLAnchorElement","search_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLAnchorElement.prototype,"hash",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLAnchorElement.prototype,"HTMLAnchorElement","hash_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLAnchorElement.prototype,"HTMLAnchorElement","hash_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLAnchorElement.prototype,"href",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLAnchorElement.prototype,"HTMLAnchorElement","href_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLAnchorElement.prototype,"HTMLAnchorElement","href_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLAnchorElement.prototype,"toString",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,HTMLAnchorElement.prototype,"HTMLAnchorElement","toString",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLAnchorElement.prototype,"hrefTranslate",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLAnchorElement.prototype,"HTMLAnchorElement","hrefTranslate_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLAnchorElement.prototype,"HTMLAnchorElement","hrefTranslate_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLAnchorElement.prototype,"attributionSrc",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLAnchorElement.prototype,"HTMLAnchorElement","attributionSrc_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLAnchorElement.prototype,"HTMLAnchorElement","attributionSrc_set",arguments)}});

// HTMLBodyElement对象
HTMLBodyElement = function HTMLBodyElement(){return ldvm.toolsFunc.throwError("TypeError","Illegal constructor");}
ldvm.toolsFunc.safeProto(HTMLBodyElement,"HTMLBodyElement");
Object.setPrototypeOf(HTMLBodyElement.prototype,HTMLElement.prototype);
ldvm.toolsFunc.defineProperty(HTMLBodyElement.prototype,"text",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLBodyElement.prototype,"HTMLBodyElement","text_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLBodyElement.prototype,"HTMLBodyElement","text_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLBodyElement.prototype,"link",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLBodyElement.prototype,"HTMLBodyElement","link_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLBodyElement.prototype,"HTMLBodyElement","link_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLBodyElement.prototype,"vLink",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLBodyElement.prototype,"HTMLBodyElement","vLink_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLBodyElement.prototype,"HTMLBodyElement","vLink_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLBodyElement.prototype,"aLink",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLBodyElement.prototype,"HTMLBodyElement","aLink_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLBodyElement.prototype,"HTMLBodyElement","aLink_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLBodyElement.prototype,"bgColor",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLBodyElement.prototype,"HTMLBodyElement","bgColor_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLBodyElement.prototype,"HTMLBodyElement","bgColor_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLBodyElement.prototype,"background",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLBodyElement.prototype,"HTMLBodyElement","background_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLBodyElement.prototype,"HTMLBodyElement","background_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLBodyElement.prototype,"onblur",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLBodyElement.prototype,"HTMLBodyElement","onblur_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLBodyElement.prototype,"HTMLBodyElement","onblur_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLBodyElement.prototype,"onerror",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLBodyElement.prototype,"HTMLBodyElement","onerror_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLBodyElement.prototype,"HTMLBodyElement","onerror_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLBodyElement.prototype,"onfocus",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLBodyElement.prototype,"HTMLBodyElement","onfocus_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLBodyElement.prototype,"HTMLBodyElement","onfocus_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLBodyElement.prototype,"onload",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLBodyElement.prototype,"HTMLBodyElement","onload_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLBodyElement.prototype,"HTMLBodyElement","onload_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLBodyElement.prototype,"onresize",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLBodyElement.prototype,"HTMLBodyElement","onresize_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLBodyElement.prototype,"HTMLBodyElement","onresize_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLBodyElement.prototype,"onscroll",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLBodyElement.prototype,"HTMLBodyElement","onscroll_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLBodyElement.prototype,"HTMLBodyElement","onscroll_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLBodyElement.prototype,"onafterprint",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLBodyElement.prototype,"HTMLBodyElement","onafterprint_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLBodyElement.prototype,"HTMLBodyElement","onafterprint_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLBodyElement.prototype,"onbeforeprint",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLBodyElement.prototype,"HTMLBodyElement","onbeforeprint_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLBodyElement.prototype,"HTMLBodyElement","onbeforeprint_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLBodyElement.prototype,"onbeforeunload",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLBodyElement.prototype,"HTMLBodyElement","onbeforeunload_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLBodyElement.prototype,"HTMLBodyElement","onbeforeunload_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLBodyElement.prototype,"onhashchange",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLBodyElement.prototype,"HTMLBodyElement","onhashchange_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLBodyElement.prototype,"HTMLBodyElement","onhashchange_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLBodyElement.prototype,"onlanguagechange",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLBodyElement.prototype,"HTMLBodyElement","onlanguagechange_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLBodyElement.prototype,"HTMLBodyElement","onlanguagechange_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLBodyElement.prototype,"onmessage",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLBodyElement.prototype,"HTMLBodyElement","onmessage_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLBodyElement.prototype,"HTMLBodyElement","onmessage_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLBodyElement.prototype,"onmessageerror",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLBodyElement.prototype,"HTMLBodyElement","onmessageerror_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLBodyElement.prototype,"HTMLBodyElement","onmessageerror_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLBodyElement.prototype,"onoffline",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLBodyElement.prototype,"HTMLBodyElement","onoffline_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLBodyElement.prototype,"HTMLBodyElement","onoffline_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLBodyElement.prototype,"ononline",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLBodyElement.prototype,"HTMLBodyElement","ononline_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLBodyElement.prototype,"HTMLBodyElement","ononline_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLBodyElement.prototype,"onpagehide",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLBodyElement.prototype,"HTMLBodyElement","onpagehide_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLBodyElement.prototype,"HTMLBodyElement","onpagehide_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLBodyElement.prototype,"onpageshow",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLBodyElement.prototype,"HTMLBodyElement","onpageshow_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLBodyElement.prototype,"HTMLBodyElement","onpageshow_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLBodyElement.prototype,"onpopstate",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLBodyElement.prototype,"HTMLBodyElement","onpopstate_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLBodyElement.prototype,"HTMLBodyElement","onpopstate_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLBodyElement.prototype,"onrejectionhandled",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLBodyElement.prototype,"HTMLBodyElement","onrejectionhandled_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLBodyElement.prototype,"HTMLBodyElement","onrejectionhandled_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLBodyElement.prototype,"onstorage",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLBodyElement.prototype,"HTMLBodyElement","onstorage_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLBodyElement.prototype,"HTMLBodyElement","onstorage_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLBodyElement.prototype,"onunhandledrejection",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLBodyElement.prototype,"HTMLBodyElement","onunhandledrejection_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLBodyElement.prototype,"HTMLBodyElement","onunhandledrejection_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLBodyElement.prototype,"onunload",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLBodyElement.prototype,"HTMLBodyElement","onunload_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLBodyElement.prototype,"HTMLBodyElement","onunload_set",arguments)}});

// HTMLCanvasElement对象
HTMLCanvasElement = function HTMLCanvasElement(){return ldvm.toolsFunc.throwError("TypeError","Illegal constructor");}
ldvm.toolsFunc.safeProto(HTMLCanvasElement,"HTMLCanvasElement");
Object.setPrototypeOf(HTMLCanvasElement.prototype,HTMLElement.prototype);
ldvm.toolsFunc.defineProperty(HTMLCanvasElement.prototype,"width",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLCanvasElement.prototype,"HTMLCanvasElement","width_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLCanvasElement.prototype,"HTMLCanvasElement","width_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLCanvasElement.prototype,"height",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLCanvasElement.prototype,"HTMLCanvasElement","height_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLCanvasElement.prototype,"HTMLCanvasElement","height_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLCanvasElement.prototype,"captureStream",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,HTMLCanvasElement.prototype,"HTMLCanvasElement","captureStream",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLCanvasElement.prototype,"getContext",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,HTMLCanvasElement.prototype,"HTMLCanvasElement","getContext",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLCanvasElement.prototype,"toBlob",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,HTMLCanvasElement.prototype,"HTMLCanvasElement","toBlob",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLCanvasElement.prototype,"toDataURL",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,HTMLCanvasElement.prototype,"HTMLCanvasElement","toDataURL",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLCanvasElement.prototype,"transferControlToOffscreen",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,HTMLCanvasElement.prototype,"HTMLCanvasElement","transferControlToOffscreen",arguments)}});
// HTMLDivElement对象
HTMLDivElement = function HTMLDivElement(){return ldvm.toolsFunc.throwError("TypeError","Illegal constructor");}
ldvm.toolsFunc.safeProto(HTMLDivElement,"HTMLDivElement");
Object.setPrototypeOf(HTMLDivElement.prototype,HTMLElement.prototype);
ldvm.toolsFunc.defineProperty(HTMLDivElement.prototype,"align",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLDivElement.prototype,"HTMLDivElement","align_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLDivElement.prototype,"HTMLDivElement","align_set",arguments)}});
// HTMLHeadElement对象
HTMLHeadElement = function HTMLHeadElement(){return ldvm.toolsFunc.throwError("TypeError","Illegal constructor");}
ldvm.toolsFunc.safeProto(HTMLHeadElement,"HTMLHeadElement");
Object.setPrototypeOf(HTMLHeadElement.prototype,HTMLElement.prototype);
// HTMLInputElement对象
HTMLInputElement = function HTMLInputElement(){return ldvm.toolsFunc.throwError("TypeError","Illegal constructor");}
ldvm.toolsFunc.safeProto(HTMLInputElement,"HTMLInputElement");
Object.setPrototypeOf(HTMLInputElement.prototype,HTMLElement.prototype);
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"accept",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLInputElement.prototype,"HTMLInputElement","accept_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLInputElement.prototype,"HTMLInputElement","accept_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"alt",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLInputElement.prototype,"HTMLInputElement","alt_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLInputElement.prototype,"HTMLInputElement","alt_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"autocomplete",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLInputElement.prototype,"HTMLInputElement","autocomplete_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLInputElement.prototype,"HTMLInputElement","autocomplete_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"defaultChecked",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLInputElement.prototype,"HTMLInputElement","defaultChecked_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLInputElement.prototype,"HTMLInputElement","defaultChecked_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"checked",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLInputElement.prototype,"HTMLInputElement","checked_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLInputElement.prototype,"HTMLInputElement","checked_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"dirName",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLInputElement.prototype,"HTMLInputElement","dirName_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLInputElement.prototype,"HTMLInputElement","dirName_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"disabled",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLInputElement.prototype,"HTMLInputElement","disabled_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLInputElement.prototype,"HTMLInputElement","disabled_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"form",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLInputElement.prototype,"HTMLInputElement","form_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"files",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLInputElement.prototype,"HTMLInputElement","files_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLInputElement.prototype,"HTMLInputElement","files_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"formAction",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLInputElement.prototype,"HTMLInputElement","formAction_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLInputElement.prototype,"HTMLInputElement","formAction_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"formEnctype",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLInputElement.prototype,"HTMLInputElement","formEnctype_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLInputElement.prototype,"HTMLInputElement","formEnctype_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"formMethod",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLInputElement.prototype,"HTMLInputElement","formMethod_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLInputElement.prototype,"HTMLInputElement","formMethod_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"formNoValidate",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLInputElement.prototype,"HTMLInputElement","formNoValidate_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLInputElement.prototype,"HTMLInputElement","formNoValidate_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"formTarget",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLInputElement.prototype,"HTMLInputElement","formTarget_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLInputElement.prototype,"HTMLInputElement","formTarget_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"height",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLInputElement.prototype,"HTMLInputElement","height_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLInputElement.prototype,"HTMLInputElement","height_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"indeterminate",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLInputElement.prototype,"HTMLInputElement","indeterminate_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLInputElement.prototype,"HTMLInputElement","indeterminate_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"list",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLInputElement.prototype,"HTMLInputElement","list_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"max",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLInputElement.prototype,"HTMLInputElement","max_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLInputElement.prototype,"HTMLInputElement","max_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"maxLength",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLInputElement.prototype,"HTMLInputElement","maxLength_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLInputElement.prototype,"HTMLInputElement","maxLength_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"min",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLInputElement.prototype,"HTMLInputElement","min_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLInputElement.prototype,"HTMLInputElement","min_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"minLength",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLInputElement.prototype,"HTMLInputElement","minLength_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLInputElement.prototype,"HTMLInputElement","minLength_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"multiple",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLInputElement.prototype,"HTMLInputElement","multiple_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLInputElement.prototype,"HTMLInputElement","multiple_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"name",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLInputElement.prototype,"HTMLInputElement","name_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLInputElement.prototype,"HTMLInputElement","name_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"pattern",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLInputElement.prototype,"HTMLInputElement","pattern_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLInputElement.prototype,"HTMLInputElement","pattern_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"placeholder",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLInputElement.prototype,"HTMLInputElement","placeholder_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLInputElement.prototype,"HTMLInputElement","placeholder_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"readOnly",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLInputElement.prototype,"HTMLInputElement","readOnly_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLInputElement.prototype,"HTMLInputElement","readOnly_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"required",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLInputElement.prototype,"HTMLInputElement","required_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLInputElement.prototype,"HTMLInputElement","required_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"size",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLInputElement.prototype,"HTMLInputElement","size_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLInputElement.prototype,"HTMLInputElement","size_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"src",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLInputElement.prototype,"HTMLInputElement","src_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLInputElement.prototype,"HTMLInputElement","src_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"step",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLInputElement.prototype,"HTMLInputElement","step_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLInputElement.prototype,"HTMLInputElement","step_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"type",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLInputElement.prototype,"HTMLInputElement","type_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLInputElement.prototype,"HTMLInputElement","type_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"defaultValue",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLInputElement.prototype,"HTMLInputElement","defaultValue_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLInputElement.prototype,"HTMLInputElement","defaultValue_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"value",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLInputElement.prototype,"HTMLInputElement","value_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLInputElement.prototype,"HTMLInputElement","value_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"valueAsDate",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLInputElement.prototype,"HTMLInputElement","valueAsDate_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLInputElement.prototype,"HTMLInputElement","valueAsDate_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"valueAsNumber",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLInputElement.prototype,"HTMLInputElement","valueAsNumber_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLInputElement.prototype,"HTMLInputElement","valueAsNumber_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"width",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLInputElement.prototype,"HTMLInputElement","width_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLInputElement.prototype,"HTMLInputElement","width_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"willValidate",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLInputElement.prototype,"HTMLInputElement","willValidate_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"validity",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLInputElement.prototype,"HTMLInputElement","validity_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"validationMessage",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLInputElement.prototype,"HTMLInputElement","validationMessage_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"labels",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLInputElement.prototype,"HTMLInputElement","labels_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"selectionStart",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLInputElement.prototype,"HTMLInputElement","selectionStart_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLInputElement.prototype,"HTMLInputElement","selectionStart_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"selectionEnd",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLInputElement.prototype,"HTMLInputElement","selectionEnd_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLInputElement.prototype,"HTMLInputElement","selectionEnd_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"selectionDirection",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLInputElement.prototype,"HTMLInputElement","selectionDirection_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLInputElement.prototype,"HTMLInputElement","selectionDirection_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"align",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLInputElement.prototype,"HTMLInputElement","align_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLInputElement.prototype,"HTMLInputElement","align_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"useMap",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLInputElement.prototype,"HTMLInputElement","useMap_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLInputElement.prototype,"HTMLInputElement","useMap_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"webkitdirectory",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLInputElement.prototype,"HTMLInputElement","webkitdirectory_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLInputElement.prototype,"HTMLInputElement","webkitdirectory_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"incremental",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLInputElement.prototype,"HTMLInputElement","incremental_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLInputElement.prototype,"HTMLInputElement","incremental_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"popoverTargetElement",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLInputElement.prototype,"HTMLInputElement","popoverTargetElement_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLInputElement.prototype,"HTMLInputElement","popoverTargetElement_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"popoverTargetAction",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLInputElement.prototype,"HTMLInputElement","popoverTargetAction_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLInputElement.prototype,"HTMLInputElement","popoverTargetAction_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"checkValidity",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,HTMLInputElement.prototype,"HTMLInputElement","checkValidity",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"reportValidity",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,HTMLInputElement.prototype,"HTMLInputElement","reportValidity",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"select",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,HTMLInputElement.prototype,"HTMLInputElement","select",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"setCustomValidity",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,HTMLInputElement.prototype,"HTMLInputElement","setCustomValidity",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"setRangeText",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,HTMLInputElement.prototype,"HTMLInputElement","setRangeText",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"setSelectionRange",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,HTMLInputElement.prototype,"HTMLInputElement","setSelectionRange",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"showPicker",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,HTMLInputElement.prototype,"HTMLInputElement","showPicker",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"stepDown",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,HTMLInputElement.prototype,"HTMLInputElement","stepDown",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"stepUp",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,HTMLInputElement.prototype,"HTMLInputElement","stepUp",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLInputElement.prototype,"webkitEntries",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLInputElement.prototype,"HTMLInputElement","webkitEntries_get",arguments)}, set: undefined});

// HTMLMetaElement对象
HTMLMetaElement = function HTMLMetaElement(){return ldvm.toolsFunc.throwError("TypeError","Illegal constructor");}
ldvm.toolsFunc.safeProto(HTMLMetaElement,"HTMLMetaElement");
Object.setPrototypeOf(HTMLMetaElement.prototype,HTMLElement.prototype);
ldvm.toolsFunc.defineProperty(HTMLMetaElement.prototype,"name",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLMetaElement.prototype,"HTMLMetaElement","name_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLMetaElement.prototype,"HTMLMetaElement","name_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLMetaElement.prototype,"httpEquiv",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLMetaElement.prototype,"HTMLMetaElement","httpEquiv_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLMetaElement.prototype,"HTMLMetaElement","httpEquiv_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLMetaElement.prototype,"content",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLMetaElement.prototype,"HTMLMetaElement","content_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLMetaElement.prototype,"HTMLMetaElement","content_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLMetaElement.prototype,"media",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLMetaElement.prototype,"HTMLMetaElement","media_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLMetaElement.prototype,"HTMLMetaElement","media_set",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLMetaElement.prototype,"scheme",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLMetaElement.prototype,"HTMLMetaElement","scheme_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLMetaElement.prototype,"HTMLMetaElement","scheme_set",arguments)}});
// HTMLSpanElement对象
HTMLSpanElement = function HTMLSpanElement(){return ldvm.toolsFunc.throwError("TypeError","Illegal constructor");}
ldvm.toolsFunc.safeProto(HTMLSpanElement,"HTMLSpanElement");
Object.setPrototypeOf(HTMLSpanElement.prototype,HTMLElement.prototype);
// Document对象
Document = function Document(){}
ldvm.toolsFunc.safeProto(Document,"Document");
Object.setPrototypeOf(Document.prototype,Node.prototype);
ldvm.toolsFunc.defineProperty(Document.prototype,"implementation",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","implementation_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Document.prototype,"URL",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","URL_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Document.prototype,"documentURI",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","documentURI_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Document.prototype,"compatMode",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","compatMode_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Document.prototype,"characterSet",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","characterSet_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Document.prototype,"charset",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","charset_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Document.prototype,"inputEncoding",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","inputEncoding_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Document.prototype,"contentType",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","contentType_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Document.prototype,"doctype",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","doctype_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Document.prototype,"documentElement",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","documentElement_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Document.prototype,"xmlEncoding",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","xmlEncoding_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Document.prototype,"xmlVersion",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","xmlVersion_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","xmlVersion_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"xmlStandalone",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","xmlStandalone_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","xmlStandalone_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"domain",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","domain_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","domain_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"referrer",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","referrer_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Document.prototype,"cookie",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","cookie_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","cookie_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"lastModified",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","lastModified_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Document.prototype,"readyState",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","readyState_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Document.prototype,"title",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","title_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","title_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"dir",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","dir_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","dir_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"body",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","body_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","body_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"head",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","head_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Document.prototype,"images",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","images_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Document.prototype,"embeds",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","embeds_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Document.prototype,"plugins",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","plugins_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Document.prototype,"links",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","links_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Document.prototype,"forms",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","forms_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Document.prototype,"scripts",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","scripts_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Document.prototype,"currentScript",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","currentScript_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Document.prototype,"defaultView",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","defaultView_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Document.prototype,"designMode",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","designMode_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","designMode_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onreadystatechange",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onreadystatechange_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onreadystatechange_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"anchors",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","anchors_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Document.prototype,"applets",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","applets_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Document.prototype,"fgColor",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","fgColor_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","fgColor_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"linkColor",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","linkColor_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","linkColor_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"vlinkColor",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","vlinkColor_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","vlinkColor_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"alinkColor",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","alinkColor_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","alinkColor_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"bgColor",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","bgColor_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","bgColor_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"all",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","all_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Document.prototype,"scrollingElement",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","scrollingElement_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Document.prototype,"onpointerlockchange",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onpointerlockchange_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onpointerlockchange_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onpointerlockerror",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onpointerlockerror_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onpointerlockerror_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"hidden",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","hidden_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Document.prototype,"visibilityState",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","visibilityState_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Document.prototype,"wasDiscarded",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","wasDiscarded_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Document.prototype,"prerendering",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","prerendering_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Document.prototype,"featurePolicy",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","featurePolicy_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Document.prototype,"webkitVisibilityState",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","webkitVisibilityState_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Document.prototype,"webkitHidden",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","webkitHidden_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Document.prototype,"onbeforecopy",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onbeforecopy_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onbeforecopy_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onbeforecut",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onbeforecut_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onbeforecut_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onbeforepaste",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onbeforepaste_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onbeforepaste_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onfreeze",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onfreeze_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onfreeze_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onprerenderingchange",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onprerenderingchange_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onprerenderingchange_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onresume",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onresume_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onresume_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onsearch",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onsearch_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onsearch_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onvisibilitychange",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onvisibilitychange_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onvisibilitychange_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"timeline",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","timeline_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Document.prototype,"fullscreenEnabled",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","fullscreenEnabled_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","fullscreenEnabled_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"fullscreen",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","fullscreen_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","fullscreen_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onfullscreenchange",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onfullscreenchange_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onfullscreenchange_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onfullscreenerror",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onfullscreenerror_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onfullscreenerror_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"webkitIsFullScreen",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","webkitIsFullScreen_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Document.prototype,"webkitCurrentFullScreenElement",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","webkitCurrentFullScreenElement_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Document.prototype,"webkitFullscreenEnabled",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","webkitFullscreenEnabled_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Document.prototype,"webkitFullscreenElement",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","webkitFullscreenElement_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Document.prototype,"onwebkitfullscreenchange",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onwebkitfullscreenchange_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onwebkitfullscreenchange_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onwebkitfullscreenerror",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onwebkitfullscreenerror_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onwebkitfullscreenerror_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"rootElement",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","rootElement_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Document.prototype,"pictureInPictureEnabled",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","pictureInPictureEnabled_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Document.prototype,"onbeforexrselect",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onbeforexrselect_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onbeforexrselect_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onabort",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onabort_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onabort_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onbeforeinput",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onbeforeinput_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onbeforeinput_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onbeforematch",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onbeforematch_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onbeforematch_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onbeforetoggle",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onbeforetoggle_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onbeforetoggle_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onblur",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onblur_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onblur_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"oncancel",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","oncancel_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","oncancel_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"oncanplay",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","oncanplay_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","oncanplay_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"oncanplaythrough",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","oncanplaythrough_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","oncanplaythrough_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onchange",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onchange_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onchange_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onclick",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onclick_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onclick_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onclose",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onclose_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onclose_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"oncontentvisibilityautostatechange",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","oncontentvisibilityautostatechange_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","oncontentvisibilityautostatechange_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"oncontextlost",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","oncontextlost_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","oncontextlost_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"oncontextmenu",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","oncontextmenu_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","oncontextmenu_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"oncontextrestored",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","oncontextrestored_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","oncontextrestored_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"oncuechange",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","oncuechange_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","oncuechange_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"ondblclick",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","ondblclick_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","ondblclick_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"ondrag",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","ondrag_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","ondrag_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"ondragend",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","ondragend_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","ondragend_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"ondragenter",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","ondragenter_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","ondragenter_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"ondragleave",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","ondragleave_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","ondragleave_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"ondragover",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","ondragover_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","ondragover_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"ondragstart",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","ondragstart_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","ondragstart_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"ondrop",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","ondrop_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","ondrop_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"ondurationchange",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","ondurationchange_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","ondurationchange_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onemptied",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onemptied_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onemptied_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onended",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onended_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onended_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onerror",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onerror_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onerror_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onfocus",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onfocus_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onfocus_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onformdata",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onformdata_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onformdata_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"oninput",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","oninput_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","oninput_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"oninvalid",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","oninvalid_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","oninvalid_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onkeydown",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onkeydown_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onkeydown_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onkeypress",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onkeypress_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onkeypress_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onkeyup",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onkeyup_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onkeyup_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onload",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onload_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onload_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onloadeddata",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onloadeddata_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onloadeddata_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onloadedmetadata",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onloadedmetadata_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onloadedmetadata_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onloadstart",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onloadstart_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onloadstart_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onmousedown",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onmousedown_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onmousedown_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onmouseenter",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onmouseenter_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onmouseenter_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onmouseleave",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onmouseleave_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onmouseleave_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onmousemove",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onmousemove_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onmousemove_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onmouseout",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onmouseout_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onmouseout_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onmouseover",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onmouseover_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onmouseover_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onmouseup",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onmouseup_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onmouseup_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onmousewheel",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onmousewheel_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onmousewheel_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onpause",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onpause_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onpause_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onplay",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onplay_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onplay_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onplaying",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onplaying_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onplaying_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onprogress",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onprogress_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onprogress_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onratechange",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onratechange_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onratechange_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onreset",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onreset_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onreset_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onresize",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onresize_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onresize_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onscroll",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onscroll_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onscroll_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onsecuritypolicyviolation",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onsecuritypolicyviolation_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onsecuritypolicyviolation_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onseeked",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onseeked_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onseeked_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onseeking",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onseeking_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onseeking_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onselect",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onselect_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onselect_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onslotchange",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onslotchange_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onslotchange_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onstalled",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onstalled_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onstalled_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onsubmit",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onsubmit_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onsubmit_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onsuspend",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onsuspend_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onsuspend_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"ontimeupdate",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","ontimeupdate_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","ontimeupdate_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"ontoggle",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","ontoggle_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","ontoggle_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onvolumechange",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onvolumechange_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onvolumechange_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onwaiting",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onwaiting_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onwaiting_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onwebkitanimationend",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onwebkitanimationend_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onwebkitanimationend_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onwebkitanimationiteration",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onwebkitanimationiteration_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onwebkitanimationiteration_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onwebkitanimationstart",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onwebkitanimationstart_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onwebkitanimationstart_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onwebkittransitionend",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onwebkittransitionend_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onwebkittransitionend_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onwheel",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onwheel_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onwheel_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onauxclick",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onauxclick_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onauxclick_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"ongotpointercapture",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","ongotpointercapture_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","ongotpointercapture_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onlostpointercapture",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onlostpointercapture_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onlostpointercapture_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onpointerdown",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onpointerdown_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onpointerdown_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onpointermove",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onpointermove_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onpointermove_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onpointerrawupdate",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onpointerrawupdate_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onpointerrawupdate_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onpointerup",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onpointerup_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onpointerup_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onpointercancel",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onpointercancel_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onpointercancel_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onpointerover",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onpointerover_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onpointerover_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onpointerout",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onpointerout_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onpointerout_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onpointerenter",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onpointerenter_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onpointerenter_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onpointerleave",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onpointerleave_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onpointerleave_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onselectstart",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onselectstart_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onselectstart_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onselectionchange",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onselectionchange_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onselectionchange_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onanimationend",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onanimationend_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onanimationend_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onanimationiteration",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onanimationiteration_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onanimationiteration_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onanimationstart",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onanimationstart_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onanimationstart_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"ontransitionrun",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","ontransitionrun_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","ontransitionrun_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"ontransitionstart",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","ontransitionstart_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","ontransitionstart_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"ontransitionend",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","ontransitionend_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","ontransitionend_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"ontransitioncancel",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","ontransitioncancel_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","ontransitioncancel_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"oncopy",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","oncopy_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","oncopy_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"oncut",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","oncut_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","oncut_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onpaste",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onpaste_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onpaste_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"children",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","children_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Document.prototype,"firstElementChild",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","firstElementChild_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Document.prototype,"lastElementChild",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","lastElementChild_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Document.prototype,"childElementCount",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","childElementCount_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Document.prototype,"activeElement",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","activeElement_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Document.prototype,"styleSheets",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","styleSheets_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Document.prototype,"pointerLockElement",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","pointerLockElement_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Document.prototype,"fullscreenElement",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","fullscreenElement_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","fullscreenElement_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"adoptedStyleSheets",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","adoptedStyleSheets_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","adoptedStyleSheets_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"pictureInPictureElement",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","pictureInPictureElement_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Document.prototype,"fonts",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","fonts_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Document.prototype,"adoptNode",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","adoptNode",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"append",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","append",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"captureEvents",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","captureEvents",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"caretRangeFromPoint",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","caretRangeFromPoint",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"clear",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","clear",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"close",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","close",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"createAttribute",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","createAttribute",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"createAttributeNS",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","createAttributeNS",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"createCDATASection",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","createCDATASection",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"createComment",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","createComment",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"createDocumentFragment",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","createDocumentFragment",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"createElement",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","createElement",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"createElementNS",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","createElementNS",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"createEvent",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","createEvent",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"createExpression",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","createExpression",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"createNSResolver",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","createNSResolver",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"createNodeIterator",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","createNodeIterator",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"createProcessingInstruction",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","createProcessingInstruction",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"createRange",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","createRange",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"createTextNode",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","createTextNode",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"createTreeWalker",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","createTreeWalker",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"elementFromPoint",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","elementFromPoint",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"elementsFromPoint",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","elementsFromPoint",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"evaluate",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","evaluate",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"execCommand",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","execCommand",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"exitFullscreen",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","exitFullscreen",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"exitPictureInPicture",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","exitPictureInPicture",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"exitPointerLock",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","exitPointerLock",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"getAnimations",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","getAnimations",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"getElementById",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","getElementById",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"getElementsByClassName",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","getElementsByClassName",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"getElementsByName",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","getElementsByName",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"getElementsByTagName",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","getElementsByTagName",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"getElementsByTagNameNS",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","getElementsByTagNameNS",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"getSelection",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","getSelection",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"hasFocus",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","hasFocus",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"importNode",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","importNode",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"open",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","open",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"prepend",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","prepend",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"queryCommandEnabled",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","queryCommandEnabled",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"queryCommandIndeterm",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","queryCommandIndeterm",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"queryCommandState",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","queryCommandState",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"queryCommandSupported",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","queryCommandSupported",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"queryCommandValue",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","queryCommandValue",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"querySelector",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","querySelector",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"querySelectorAll",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","querySelectorAll",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"releaseEvents",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","releaseEvents",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"replaceChildren",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","replaceChildren",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"startViewTransition",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","startViewTransition",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"webkitCancelFullScreen",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","webkitCancelFullScreen",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"webkitExitFullscreen",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","webkitExitFullscreen",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"write",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","write",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"writeln",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","writeln",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"fragmentDirective",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","fragmentDirective_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Document.prototype,"browsingTopics",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","browsingTopics",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"hasPrivateToken",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","hasPrivateToken",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"hasRedemptionRecord",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","hasRedemptionRecord",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"requestStorageAccess",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","requestStorageAccess",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"onscrollend",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onscrollend_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","onscrollend_set",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"hasStorageAccess",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","hasStorageAccess",arguments)}});
ldvm.toolsFunc.defineProperty(Document.prototype,"requestStorageAccessFor",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Document.prototype,"Document","requestStorageAccessFor",arguments)}});

// HTMLDocument对象
HTMLDocument = function HTMLDocument(){return ldvm.toolsFunc.throwError("TypeError","Illegal constructor");}
ldvm.toolsFunc.safeProto(HTMLDocument,"HTMLDocument");
Object.setPrototypeOf(HTMLDocument.prototype,Document.prototype);

// document对象
document = {}
Object.setPrototypeOf(document,HTMLDocument.prototype);
ldvm.toolsFunc.defineProperty(document,"location",{configurable:false,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,document,"document","location_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,document,"document","location_set",arguments)}});
// Storage对象
Storage = function Storage(){return ldvm.toolsFunc.throwError("TypeError","Illegal constructor");}
ldvm.toolsFunc.safeProto(Storage,"Storage");
ldvm.toolsFunc.defineProperty(Storage.prototype,"length",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Storage.prototype,"Storage","length_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Storage.prototype,"clear",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Storage.prototype,"Storage","clear",arguments)}});
ldvm.toolsFunc.defineProperty(Storage.prototype,"getItem",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Storage.prototype,"Storage","getItem",arguments)}});
ldvm.toolsFunc.defineProperty(Storage.prototype,"key",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Storage.prototype,"Storage","key",arguments)}});
ldvm.toolsFunc.defineProperty(Storage.prototype,"removeItem",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Storage.prototype,"Storage","removeItem",arguments)}});
ldvm.toolsFunc.defineProperty(Storage.prototype,"setItem",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Storage.prototype,"Storage","setItem",arguments)}});

// localStorage对象
localStorage = {}
Object.setPrototypeOf(localStorage,Storage.prototype);

// sessionStorage对象
sessionStorage = {}
Object.setPrototypeOf(sessionStorage,Storage.prototype);
// Navigator对象
Navigator = function Navigator(){return ldvm.toolsFunc.throwError("TypeError","Illegal constructor");}
ldvm.toolsFunc.safeProto(Navigator,"Navigator");
ldvm.toolsFunc.defineProperty(Navigator.prototype,"vendorSub",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","vendorSub_get",arguments,'')}, set: undefined});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"productSub",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","productSub_get",arguments,'20030107')}, set: undefined});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"vendor",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","vendor_get",arguments,'Google Inc.')}, set: undefined});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"maxTouchPoints",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","maxTouchPoints_get",arguments,1)}, set: undefined});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"scheduling",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","scheduling_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"userActivation",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","userActivation_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"doNotTrack",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","doNotTrack_get",arguments,null)}, set: undefined});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"geolocation",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","geolocation_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"connection",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","connection_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"plugins",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","plugins_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"mimeTypes",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","mimeTypes_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"pdfViewerEnabled",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","pdfViewerEnabled_get",arguments,false)}, set: undefined});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"webkitTemporaryStorage",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","webkitTemporaryStorage_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"webkitPersistentStorage",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","webkitPersistentStorage_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"hardwareConcurrency",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","hardwareConcurrency_get",arguments,8)}, set: undefined});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"cookieEnabled",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","cookieEnabled_get",arguments,true)}, set: undefined});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"appCodeName",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","appCodeName_get",arguments,'Mozilla')}, set: undefined});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"appName",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","appName_get",arguments,'Netscape')}, set: undefined});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"appVersion",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","appVersion_get",arguments,'5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Mobile Safari/537.36')}, set: undefined});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"platform",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","platform_get",arguments,'Win32')}, set: undefined});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"product",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","product_get",arguments,'Gecko')}, set: undefined});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"userAgent",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","userAgent_get",arguments,'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Mobile Safari/537.36')}, set: undefined});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"language",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","language_get",arguments,'zh-CN')}, set: undefined});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"languages",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","languages_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"onLine",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","onLine_get",arguments,true)}, set: undefined});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"webdriver",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","webdriver_get",arguments,false)}, set: undefined});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"getGamepads",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","getGamepads",arguments)}});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"javaEnabled",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","javaEnabled",arguments)}});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"sendBeacon",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","sendBeacon",arguments)}});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"vibrate",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","vibrate",arguments)}});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"deprecatedRunAdAuctionEnforcesKAnonymity",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","deprecatedRunAdAuctionEnforcesKAnonymity_get",arguments,false)}, set: undefined});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"bluetooth",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","bluetooth_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"clipboard",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","clipboard_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"credentials",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","credentials_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"keyboard",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","keyboard_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"managed",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","managed_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"mediaDevices",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","mediaDevices_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"storage",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","storage_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"serviceWorker",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","serviceWorker_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"virtualKeyboard",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","virtualKeyboard_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"wakeLock",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","wakeLock_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"deviceMemory",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","deviceMemory_get",arguments,4)}, set: undefined});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"login",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","login_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"ink",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","ink_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"mediaCapabilities",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","mediaCapabilities_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"hid",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","hid_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"locks",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","locks_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"gpu",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","gpu_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"mediaSession",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","mediaSession_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"permissions",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","permissions_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"presentation",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","presentation_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"usb",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","usb_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"xr",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","xr_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"serial",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","serial_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"windowControlsOverlay",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","windowControlsOverlay_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"userAgentData",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","userAgentData_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"adAuctionComponents",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","adAuctionComponents",arguments)}});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"runAdAuction",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","runAdAuction",arguments)}});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"canLoadAdAuctionFencedFrame",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","canLoadAdAuctionFencedFrame",arguments)}});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"canShare",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","canShare",arguments)}});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"share",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","share",arguments)}});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"clearAppBadge",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","clearAppBadge",arguments)}});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"getBattery",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","getBattery",arguments)}});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"getUserMedia",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","getUserMedia",arguments)}});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"requestMIDIAccess",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","requestMIDIAccess",arguments)}});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"requestMediaKeySystemAccess",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","requestMediaKeySystemAccess",arguments)}});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"setAppBadge",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","setAppBadge",arguments)}});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"webkitGetUserMedia",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","webkitGetUserMedia",arguments)}});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"clearOriginJoinedAdInterestGroups",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","clearOriginJoinedAdInterestGroups",arguments)}});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"createAuctionNonce",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","createAuctionNonce",arguments)}});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"deprecatedReplaceInURN",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","deprecatedReplaceInURN",arguments)}});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"deprecatedURNToURL",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","deprecatedURNToURL",arguments)}});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"getInstalledRelatedApps",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","getInstalledRelatedApps",arguments)}});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"joinAdInterestGroup",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","joinAdInterestGroup",arguments)}});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"leaveAdInterestGroup",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","leaveAdInterestGroup",arguments)}});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"updateAdInterestGroups",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","updateAdInterestGroups",arguments)}});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"registerProtocolHandler",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","registerProtocolHandler",arguments)}});
ldvm.toolsFunc.defineProperty(Navigator.prototype,"unregisterProtocolHandler",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","unregisterProtocolHandler",arguments)}});

// navigator对象
navigator = {}
Object.setPrototypeOf(navigator,Navigator.prototype);
// Location对象
Location = function Location(){return ldvm.toolsFunc.throwError("TypeError","Illegal constructor");}
ldvm.toolsFunc.safeProto(Location,"Location");

// location对象
location = {}
Object.setPrototypeOf(location,Location.prototype);
ldvm.toolsFunc.defineProperty(location,"valueOf",{configurable:false,enumerable:false, writable:false, value: function (){return ldvm.toolsFunc.dispatch(this,location,"location","valueOf",arguments)}});
ldvm.toolsFunc.defineProperty(location,"ancestorOrigins",{configurable:false,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,location,"location","ancestorOrigins_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(location,"href",{configurable:false,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,location,"location","href_get",arguments,'https://q.10jqka.com.cn/')}, set: function (){return ldvm.toolsFunc.dispatch(this,location,"location","href_set",arguments)}});
ldvm.toolsFunc.defineProperty(location,"origin",{configurable:false,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,location,"location","origin_get",arguments,'https://q.10jqka.com.cn')}, set: undefined});
ldvm.toolsFunc.defineProperty(location,"protocol",{configurable:false,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,location,"location","protocol_get",arguments,'https:')}, set: function (){return ldvm.toolsFunc.dispatch(this,location,"location","protocol_set",arguments)}});
ldvm.toolsFunc.defineProperty(location,"host",{configurable:false,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,location,"location","host_get",arguments,'q.10jqka.com.cn')}, set: function (){return ldvm.toolsFunc.dispatch(this,location,"location","host_set",arguments)}});
ldvm.toolsFunc.defineProperty(location,"hostname",{configurable:false,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,location,"location","hostname_get",arguments,'q.10jqka.com.cn')}, set: function (){return ldvm.toolsFunc.dispatch(this,location,"location","hostname_set",arguments)}});
ldvm.toolsFunc.defineProperty(location,"port",{configurable:false,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,location,"location","port_get",arguments,'')}, set: function (){return ldvm.toolsFunc.dispatch(this,location,"location","port_set",arguments)}});
ldvm.toolsFunc.defineProperty(location,"pathname",{configurable:false,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,location,"location","pathname_get",arguments,'/')}, set: function (){return ldvm.toolsFunc.dispatch(this,location,"location","pathname_set",arguments)}});
ldvm.toolsFunc.defineProperty(location,"search",{configurable:false,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,location,"location","search_get",arguments,'')}, set: function (){return ldvm.toolsFunc.dispatch(this,location,"location","search_set",arguments)}});
ldvm.toolsFunc.defineProperty(location,"hash",{configurable:false,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,location,"location","hash_get",arguments,'')}, set: function (){return ldvm.toolsFunc.dispatch(this,location,"location","hash_set",arguments)}});
ldvm.toolsFunc.defineProperty(location,"assign",{configurable:false,enumerable:true, writable:false, value: function (){return ldvm.toolsFunc.dispatch(this,location,"location","assign",arguments)}});
ldvm.toolsFunc.defineProperty(location,"reload",{configurable:false,enumerable:true, writable:false, value: function (){return ldvm.toolsFunc.dispatch(this,location,"location","reload",arguments)}});
ldvm.toolsFunc.defineProperty(location,"replace",{configurable:false,enumerable:true, writable:false, value: function (){return ldvm.toolsFunc.dispatch(this,location,"location","replace",arguments)}});
ldvm.toolsFunc.defineProperty(location,"toString",{configurable:false,enumerable:true, writable:false, value: function (){return ldvm.toolsFunc.dispatch(this,location,"location","toString",arguments)}});
// HTMLCollection对象
HTMLCollection = function HTMLCollection(){return ldvm.toolsFunc.throwError("TypeError","Illegal constructor");}
ldvm.toolsFunc.safeProto(HTMLCollection,"HTMLCollection");
ldvm.toolsFunc.defineProperty(HTMLCollection.prototype,"length",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLCollection.prototype,"HTMLCollection","length_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(HTMLCollection.prototype,"item",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,HTMLCollection.prototype,"HTMLCollection","item",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLCollection.prototype,"namedItem",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,HTMLCollection.prototype,"HTMLCollection","namedItem",arguments)}});
// Plugin对象
Plugin = function Plugin(){return ldvm.toolsFunc.throwError("TypeError","Illegal constructor");}
ldvm.toolsFunc.safeProto(Plugin,"Plugin");
ldvm.toolsFunc.defineProperty(Plugin.prototype,"name",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Plugin.prototype,"Plugin","name_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Plugin.prototype,"filename",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Plugin.prototype,"Plugin","filename_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Plugin.prototype,"description",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Plugin.prototype,"Plugin","description_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Plugin.prototype,"length",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Plugin.prototype,"Plugin","length_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Plugin.prototype,"item",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Plugin.prototype,"Plugin","item",arguments)}});
ldvm.toolsFunc.defineProperty(Plugin.prototype,"namedItem",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Plugin.prototype,"Plugin","namedItem",arguments)}});
// PluginArray对象
PluginArray = function PluginArray(){return ldvm.toolsFunc.throwError("TypeError","Illegal constructor");}
ldvm.toolsFunc.safeProto(PluginArray,"PluginArray");
ldvm.toolsFunc.defineProperty(PluginArray.prototype,"length",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,PluginArray.prototype,"PluginArray","length_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(PluginArray.prototype,"item",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,PluginArray.prototype,"PluginArray","item",arguments)}});
ldvm.toolsFunc.defineProperty(PluginArray.prototype,"namedItem",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,PluginArray.prototype,"PluginArray","namedItem",arguments)}});
ldvm.toolsFunc.defineProperty(PluginArray.prototype,"refresh",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,PluginArray.prototype,"PluginArray","refresh",arguments)}});
// MimeType对象
MimeType = function MimeType(){return ldvm.toolsFunc.throwError("TypeError","Illegal constructor");}
ldvm.toolsFunc.safeProto(MimeType,"MimeType");
ldvm.toolsFunc.defineProperty(MimeType.prototype,"type",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,MimeType.prototype,"MimeType","type_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(MimeType.prototype,"suffixes",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,MimeType.prototype,"MimeType","suffixes_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(MimeType.prototype,"description",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,MimeType.prototype,"MimeType","description_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(MimeType.prototype,"enabledPlugin",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,MimeType.prototype,"MimeType","enabledPlugin_get",arguments)}, set: undefined});
// MimeTypeArray对象
MimeTypeArray = function MimeTypeArray(){return ldvm.toolsFunc.throwError("TypeError","Illegal constructor");}
ldvm.toolsFunc.safeProto(MimeTypeArray,"MimeTypeArray");
ldvm.toolsFunc.defineProperty(MimeTypeArray.prototype,"length",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,MimeTypeArray.prototype,"MimeTypeArray","length_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(MimeTypeArray.prototype,"item",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,MimeTypeArray.prototype,"MimeTypeArray","item",arguments)}});
ldvm.toolsFunc.defineProperty(MimeTypeArray.prototype,"namedItem",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,MimeTypeArray.prototype,"MimeTypeArray","namedItem",arguments)}});

delete Buffer;
delete process;
delete GLOBAL;
delete root;
delete VMError;
delete WindowProperties;
delete ldObj;
window=global;
delete global;
Object.setPrototypeOf(window,Window.prototype);


ldvm.toolsFunc.defineProperty(window,"atob",{
    configurable:true,
    enumerable:true,
    writable:true,
    value:function atob(str){
        return ldvm.toolsFunc.base64.base64decode(str);
    }
});
ldvm.toolsFunc.defineProperty(window,"btoa",{
    configurable:true,
    enumerable:true,
    writable:true,
    value:function btoa(str){
        return ldvm.toolsFunc.base64.base64encode(str);
    }
});
ldvm.toolsFunc.defineProperty(window,"name",{
    enumerable: true,
    configurable: true,
    get:function (){},
    set:function (){}
});

ldvm.toolsFunc.defineProperty(window,"top",{configurable:false,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,window,"window","top_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(window,"self",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,window,"window","self_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,window,"window","self_set",arguments)}});
ldvm.toolsFunc.defineProperty(window,"setTimeout",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,window,"window","setTimeout",arguments)}});
ldvm.toolsFunc.defineProperty(window,"clearTimeout",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,window,"window","clearTimeout",arguments)}});

// 代理器过滤特定属性,比如eval,通过hook解决
eval=ldvm.toolsFunc.hook(eval,undefined,false,function (){},function (){});
// 全局变量初始化
!function (){
    let onEnter=function (obj){
        try{
           ldvm.toolsFunc.printLog(obj.args);
        }catch (e){}
    }
    console.log = ldvm.toolsFunc.hook(
        console.log,
        undefined,
        false,
        onEnter,
        function (){},
        ldvm.config.print
    );
    ldvm.toolsFunc.createPlugin({
            "description":"Portable Document Format",
            "filename":"internal-pdf-viewer",
            "name":"PDF Viewer",
            "mimeTypes":[{
                "type":'application/pdf',
                "suffixes":'pdf',
                "description":'Portable Document Format'
            },{
                "type":'text/pdf',
                "suffixes":'pdf',
                "description":'Portable Document Format'
            }]
        });
    ldvm.toolsFunc.createPlugin({
            'description':"Portable Document Format",
            'filename': "internal-pdf-viewer",
            'name':"Chrome PDF Viewer",
            'mimeTypes':[{
                'type':'application/pdf',
                'suffixes':'pdf',
                'description':'Portable Document Format'
            },{
                'type':'text/pdf',
                'suffixes':'pdf',
                'description':'Portable Document Format'
            }]
        });
    ldvm.toolsFunc.createPlugin({
            'description':"Portable Document Format",
            'filename': "internal-pdf-viewer",
            'name':"Chromium PDF Viewer",
            'mimeTypes':[{
                'type':'application/pdf',
                'suffixes':'pdf',
                'description':'Portable Document Format'
            },{
                'type':'text/pdf',
                'suffixes':'pdf',
                'description':'Portable Document Format'
            }]
        });
    ldvm.toolsFunc.createPlugin({
            'description':"Portable Document Format",
            'filename': "internal-pdf-viewer",
            'name':"Microsoft Edge PDF Viewer",
            'mimeTypes':[{
                'type':'application/pdf',
                'suffixes':'pdf',
                'description':'Portable Document Format'
            },{
                'type':'text/pdf',
                'suffixes':'pdf',
                'description':'Portable Document Format'
            }]
        });
    ldvm.toolsFunc.createPlugin({
            'description':"Portable Document Format",
            'filename': "internal-pdf-viewer",
            'name':"WebKit built-in PDF",
            'mimeTypes':[{
                'type':'application/pdf',
                'suffixes':'pdf',
                'description':'Portable Document Format'
            },{
                'type':'text/pdf',
                'suffixes':'pdf',
                'description':'Portable Document Format'
            }]
        });
}();

// 需要代理的对象

// window = new Proxy(window,{});
localStorage=ldvm.toolsFunc.proxy(localStorage,"localStorge");
sessionStorage=ldvm.toolsFunc.proxy(sessionStorage,"sessionStorage");
location=ldvm.toolsFunc.proxy(location,"location");
navigator=ldvm.toolsFunc.proxy(navigator,"navigator");
document=ldvm.toolsFunc.proxy(document,"document");
window=ldvm.toolsFunc.proxy(window,"window");


var TOKEN_SERVER_TIME = 1720190987.315;
function v_cookie(n, t){
    !function() {
        var r, e, a;
        r = e = a = n;
        var u, c, s;
        u = c = s = t;
        function v() {
            var n = arguments[s[0]];
            if (!n)
                return r[0];
            for (var t = u[1], o = a[1], i = c[2]; i < n.length; i++) {
                var v = n.charCodeAt(i)
                  , f = v ^ o;
                o = v,
                t += e[2].fromCharCode(f)
            }
            return t
        }
        var f = c[3]
          , l = s[4]
          , p = Wn(e[3], r[4], s[5])
          , d = a[5]
          , h = Wn(c[6], s[7])
          , g = c[8]
          , w = c[9]
          , m = r[6]
          , I = u[10]
          , y = a[7]
          , _ = (s[11],
        c[12],
        s[13])
          , C = e[8]
          , E = u[14]
          , A = ot(e[9], e[10])
          , b = a[11]
          , T = u[15]
          , B = c[16]
          , R = r[12]
          , k = r[13]
          , S = s[17]
          , P = u[18]
          , M = Wn(s[19], s[20], u[21])
          , O = v(s[22], e[14])
          , D = s[23]
          , x = s[24]
          , N = u[25]
          , L = u[26]
          , W = Wn(s[27], r[15])
          , F = u[28]
          , Y = r[16]
          , j = a[17]
          , H = e[18]
          , $ = e[19]
          , U = r[20]
          , V = v(c[29], e[21], e[22])
          , X = s[30]
          , G = s[31]
          , K = s[32]
          , Q = s[33]
          , Z = r[23]
          , q = r[24]
          , z = v(u[12], u[34], s[35])
          , J = u[36]
          , nn = a[25]
          , tn = s[37]
          , rn = c[38]
          , en = r[26]
          , an = c[39]
          , on = s[40]
          , un = a[27]
          , cn = u[41]
          , sn = ot(s[42], c[43])
          , vn = r[28]
          , fn = u[8]
          , ln = s[44]
          , pn = a[29]
          , dn = s[45]
          , hn = a[30]
          , gn = c[46]
          , wn = a[31]
          , mn = a[32]
          , In = s[47]
          , yn = r[33]
          , _n = a[34]
          , Cn = c[48]
          , En = a[8]
          , An = v(a[35], s[49])
          , bn = c[50]
          , Tn = c[51]
          , Bn = at(r[36], s[52])
          , Rn = ot(r[37], e[38])
          , kn = e[39]
          , Sn = u[53]
          , Pn = r[40]
          , Mn = s[54]
          , On = s[55]
          , Dn = Wn(u[56], r[41], r[42])
          , xn = r[43]
          , Nn = u[57]
          , Ln = e[44];
        function Wn() {
            return arguments[u[0]].split(e[0]).reverse().join(c[1])
        }
        var Fn = r[45], Yn = Wn(c[58], e[46]), jn = v(s[59], u[60]), Hn = Wn(r[47], s[61]), $n = s[62], Un = s[63], Vn = u[2], Xn = [new u[27](r[48]), new u[27](c[64])], Gn = [new e[47](ot(a[49])), new u[27](ot(a[50], u[65]))], Kn = c[66][f + l] || r[51].getElementsByTagName(p + d)[r[52]], Qn;
        !function(n) {
            n[e[53]] = s[67];
            function t(n) {
                var t = r[51][u[68]]
                  , o = u[69] + n + s[70]
                  , i = t.indexOf(o);
                if (i == -e[54]) {
                    if (o = n + c[70],
                    t.substr(r[52], o.length) != o)
                        return;
                    i = a[52]
                }
                var f = i + o[v(u[71], s[72])]
                  , l = t.indexOf(r[55], f);
                return l == -a[54] && (l = t[a[56]]),
                t.substring(f, l)
            }
            n[a[57]] = f;
            function o(n, t, a, o, i) {
                var c = n + r[58] + t;
                o && (c += e[59] + o),
                i && (c += v(Jn, u[73], s[74]) + i),
                a && (c += u[75] + a),
                u[66][u[68]] = c
            }
            n[s[76]] = t;
            function i(n, t, r) {
                this.setCookie(n, u[1], u[77], t, r)
            }
            n[s[78]] = o;
            function f() {
                var t = a[60];
                this.setCookie(t, u[67]),
                this.getCookie(t) || (n[r[53]] = e[61]),
                this.delCookie(t)
            }
            n[Wn(N, r[62], c[79])] = i
        }(Qn || (Qn = {}));
        var Zn;
        !function(n) {
            var t = u[80], o = v(nn, s[81], u[82]), i = s[67], f, l = u[83][Wn(u[84], e[63])], p, d;
            function g(n) {
                var t = j;
                return t = dn,
                i ? y(n) : f ? w(n) : void u[2]
            }
            function w(n) {
                E(function() {
                    return n = R(n),
                    f.getAttribute(n)
                })()
            }
            function m() {
                try {
                    return !!(o in s[83] && s[83][o])
                } catch (n) {
                    return void u[2]
                }
            }
            function I(n) {
                try {
                    f.removeItem(n)
                } catch (t) {}
            }
            n[c[85]] = C;
            function y(n) {
                try {
                    return f.getItem(n)
                } catch (t) {
                    return u[86]
                }
            }
            n[c[87]] = B;
            function _(n, t) {
                try {
                    f.setItem(n, t)
                } catch (r) {}
            }
            function C() {
                var n = e[64]
                  , r = u[88];
                if (i = m(),
                i)
                    f = a[65][o];
                else if (l[at(e[66])][at(e[67], a[68])])
                    try {
                        p = new ActiveXObject(Wn(a[69], s[89], l)),
                        p.open(),
                        p.write(s[90]),
                        p.close(),
                        d = p.w[e[70]][s[2]][e[71]],
                        f = d.createElement(n + t + r)
                    } catch (c) {
                        f = l.createElement(o),
                        d = l[Wn(u[91], a[72])] || l.getElementsByTagName(s[92])[s[2]] || l[a[73]]
                    }
            }
            function E(n) {
                return function() {
                    d.appendChild(f),
                    f.addBehavior(s[93]),
                    f.load(o);
                    var t = n();
                    return d.removeChild(f),
                    t
                }
            }
            n[c[94]] = g;
            function A(n) {
                var t, r, e;
                if (t = r = e = a,
                i)
                    I(n);
                else {
                    if (!f)
                        return void e[52];
                    b(n)
                }
            }
            function b(n) {
                E(function() {
                    n = R(n),
                    f.removeAttribute(n),
                    f.save(o)
                })()
            }
            function T(n, t) {
                E(function() {
                    n = R(n),
                    f.setAttribute(n, t),
                    f.save(o)
                })()
            }
            n[a[74]] = A;
            function B(n, t) {
                if (void 0 === t)
                    return A(n);
                if (i)
                    _(n, t);
                else {
                    if (!f)
                        return void u[2];
                    T(n, t)
                }
            }
            function R(n) {
                var t = s[95]
                  , e = r[75]
                  , a = new r[47](t + h + e,c[96]);
                return n.replace(new c[27](u[97]), v(s[98], s[99], s[100])).replace(a, c[101])
            }
        }(Zn || (Zn = {}));
        var qn = function() {
            var n, t, r;
            n = t = r = a;
            var e, o, i;
            e = o = i = s;
            var u = o[15]
              , c = o[102]
              , f = e[103];
            function l(r) {
                var a = o[102]
                  , i = e[103];
                this[n[76]] = r;
                for (var u = t[52], c = r[a + g + i]; u < c; u++)
                    this[u] = t[52]
            }
            return l[e[104]][w + m + I + u] = function() {
                for (var a = e[105], u = this[a + y], c = [], s = -e[0], v = o[2], f = u[r[56]]; v < f; v++)
                    for (var l = this[v], p = u[v], d = s += p; c[d] = l & parseInt(t[77], n[78]),
                    --p != r[52]; )
                        --d,
                        l >>= parseInt(n[79], i[106]);
                return c
            }
            ,
            l[v(t[80], t[81], b)][ot(i[107])] = function(n) {
                for (var r = e[8], a = this[ot(e[108], e[109])], o = t[52], u = e[2], s = a[c + r + f]; u < s; u++) {
                    var v = a[u]
                      , l = i[2];
                    do {
                        l = (l << t[82]) + n[o++]
                    } while (--v > t[52]);
                    this[u] = l >>> i[2]
                }
            }
            ,
            l
        }(), zn;
        !function(n) {
            var t = s[13]
              , o = c[53]
              , i = r[83]
              , f = r[84]
              , l = s[110]
              , d = r[85]
              , h = r[86];
            function g(n, a, o, i, u) {
                for (var c = s[13], v = r[87], f = n[s[111]]; a < f; )
                    o[i++] = n[a++] ^ u & parseInt(c + v + t + _, r[88]),
                    u = ~(u * parseInt(e[89], e[82]))
            }
            function w(n) {
                for (var t = c[112], i = r[52], v = n[s[111]], f = []; i < v; ) {
                    var l = n[i++] << parseInt(C + t, c[113]) | n[i++] << e[82] | n[i++];
                    f.push(m.charAt(l >> parseInt(e[90], e[82])), m.charAt(l >> parseInt(s[114], e[78]) & parseInt(a[91], r[88])), m.charAt(l >> u[59] & parseInt(E + o, a[78])), m.charAt(l & parseInt(a[92], u[113])))
                }
                return f.join(e[0])
            }
            for (var m = at(u[115], s[116]), I = {}, y = u[2]; y < parseInt(i + A, e[93]); y++)
                I[m.charAt(y)] = y;
            function O(n) {
                var t, r, e;
                t = r = e = s;
                var o, i, u;
                o = i = u = a;
                for (var c = ot(i[94]), l = e[2], p = n[o[56]], d = []; l < p; ) {
                    var h = I[n.charAt(l++)] << parseInt(at(t[117]), u[82]) | I[n.charAt(l++)] << parseInt(v(t[118], u[95], e[119]), o[88]) | I[n.charAt(l++)] << t[59] | I[n.charAt(l++)];
                    d.push(h >> parseInt(e[120], t[106]), h >> parseInt(t[121], r[122]) & parseInt(f + b + c, t[106]), h & parseInt(o[96], u[88]))
                }
                return d
            }
            function D(n) {
                var t = O(n);
                if (rn,
                p,
                t[r[52]] != h)
                    return error = T + B + l,
                    void 0;
                var a = t[c[0]]
                  , o = [];
                return g(t, +parseInt(e[79], c[122]), o, +u[2], a),
                x(o) == a ? o : void 0
            }
            function x(n) {
                var t = o;
                t = Vn;
                for (var e = c[2], i = a[52], u = n[c[111]]; i < u; i++)
                    e = (e << s[123]) - e + n[i];
                return e & parseInt(s[124], r[88])
            }
            function N(n) {
                var t = et
                  , r = x(n)
                  , e = [h, r];
                return g(n, +a[52], e, +a[88], r),
                t = P,
                w(e)
            }
            n[e[97]] = w,
            n[R + k + S] = O,
            n[u[125]] = N,
            n[d + P + M] = D
        }(zn || (zn = {}));
        var Jn;
        !function(n) {
            var t = Fn
              , o = at(c[126], a[98])
              , i = r[99]
              , f = v(U, u[127])
              , l = s[128]
              , p = ot(a[100])
              , d = r[5]
              , h = r[101]
              , g = ot(u[129])
              , w = s[130]
              , m = r[102]
              , C = a[103]
              , E = e[104];
            function A(n) {
                for (var t = (Tn,
                I,
                []), e = r[52]; e < n[c[111]]; e++)
                    t.push(n.charCodeAt(e));
                return t
            }
            function b() {
                var n = new e[105];
                try {
                    return time = s[52].now(),
                    time / parseInt(c[131], a[88]) >>> c[2]
                } catch (t) {
                    return time = n.getTime(),
                    time / parseInt(s[121], s[84]) >>> r[52]
                }
            }
            function T(n) {
                var t = u[8]
                  , o = {}
                  , i = function(n, o) {
                    var i = c[102], f, l, p, d;
                    for (o = o.replace(s[132], u[1]),
                    o = o.substring(u[0], o[e[56]] - c[0]),
                    f = o.split(c[133]),
                    p = c[2]; p < f[i + t + O]; p++)
                        if (l = f[p].split(v(r[106], c[134])),
                        l && !(l[r[56]] < s[122])) {
                            for (d = r[88]; d < l[r[56]]; d++)
                                l[r[54]] = l[r[54]] + r[107] + l[d];
                            l[s[2]] = new r[47](c[135]).test(l[e[52]]) ? l[a[52]].substring(u[0], l[e[52]][D + x] - c[0]) : l[a[52]],
                            l[r[54]] = new a[47](c[135]).test(l[r[54]]) ? l[e[54]].substring(s[0], l[a[54]][a[56]] - u[0]) : l[s[0]],
                            n[l[c[2]]] = l[e[54]]
                        }
                    return n
                };
                return new r[47](e[108]).test(n) && (o = i(o, n)),
                o
            }
            function B(n) {
                var t, e, a;
                t = e = a = c;
                var u, s, v;
                if (u = s = v = r,
                typeof n === ot(s[109], sn) && n[Wn(y, a[136], s[110])])
                    try {
                        switch (parseInt(n[e[137]])) {
                        case parseInt(a[131], t[122]):
                            break;
                        case parseInt(v[111], s[78]):
                            top[e[138]][v[112]] = n[t[139]];
                            break;
                        case parseInt(u[113], e[122]):
                            top[o + i + N][e[140]] = n[s[114]];
                            break;
                        default:
                            break
                        }
                    } catch (f) {}
            }
            function R(n, t, r) {
                var e, a, o;
                e = a = o = u,
                q ? n.addEventListener(t, r) : n.attachEvent(a[25] + t, r)
            }
            function k() {
                return Math.random() * parseInt(u[141], r[78]) >>> r[52]
            }
            function S(n, t) {
                var o = en
                  , i = new r[47](e[115],a[116]);
                o = T;
                var s = new u[27](v(p, r[117], m));
                if (n) {
                    var f = n.match(i);
                    if (f) {
                        var l = f[u[0]];
                        return t && s.test(l) && (l = l.split(r[118]).pop().split(r[107])[c[2]]),
                        l
                    }
                }
            }
            function P(n) {
                var t = mn
                  , o = c[142]
                  , i = r[119]
                  , v = e[120]
                  , I = a[121];
                if (!(n > e[122])) {
                    n = n || a[52];
                    var y = parseInt(u[143], e[78])
                      , _ = a[51].createElement(u[144]);
                    t = Q,
                    _[c[145]] = location[r[123]] + a[124] + parseInt((new r[105]).getTime() / y) + (f + o + l),
                    _[e[125]] = function() {
                        Vn = u[0],
                        setTimeout(function() {
                            P(++n)
                        }, n * parseInt(e[126], u[84]))
                    }
                    ,
                    _[p + L + d] = _[s[146]] = function() {
                        var n, t, r;
                        n = t = r = a;
                        var e, o, u;
                        e = o = u = c;
                        var s = e[147];
                        this[t[127]] && this[i + W] !== o[148] && this[u[149]] !== o[150] && this[s + F + h] !== u[151] || (Vn = n[52],
                        _[e[152]] = _[g + w + v] = n[128])
                    }
                    ,
                    c[66][m + I].appendChild(_)
                }
            }
            function M(n) {
                var t, e, a;
                t = e = a = r;
                var o, i, u;
                return o = i = u = s,
                new u[27](t[129]).test(n)
            }
            function X() {
                var n = new s[52];
                return typeof TOKEN_SERVER_TIME == s[153] ? r[52] : (time = parseInt(TOKEN_SERVER_TIME),
                time)
            }
            function G(n) {
                var t, e, a;
                t = e = a = s;
                var o, i, u;
                o = i = u = r;
                for (var c = u[52], v = a[2], f = n[o[56]]; v < f; v++)
                    c = (c << a[123]) - c + n.charCodeAt(v),
                    c >>>= o[52];
                return c
            }
            function K(n) {
                var t = new s[27](e[130],s[80]);
                if (n) {
                    return n.match(t)
                }
            }
            function Z(n) {
                var t = new u[27](c[154]);
                if (M(n))
                    return n;
                var o = t.test(n) ? -a[86] : -parseInt(r[79], e[88]);
                return (tn,
                _,
                n.split(s[155])).slice(o).join(a[131])
            }
            n[Y + C + j] = T,
            t = En,
            n[c[156]] = P,
            n[ot(u[157])] = B,
            n[r[132]] = A,
            n[c[158]] = G,
            n[c[159]] = k,
            n[r[133]] = M,
            n[s[160]] = Z,
            n[E + H] = S,
            n[$ + U] = K,
            n[s[161]] = z,
            n[s[162]] = b,
            n[r[134]] = X;
            var q = !!a[65][a[135]];
            function z(n) {
                for (var t = v(O, u[163]), a = e[136], o = s[2], i = n[V + t + a] - s[0]; i >= r[52]; i--)
                    o = o << r[54] | +n[i];
                return o
            }
            n[u[164]] = R
        }(Jn || (Jn = {}));
        var nt;
        !function(n) {
            var t = u[165]
              , o = a[137]
              , i = at(s[166], s[167])
              , v = u[168]
              , f = a[138]
              , l = c[169]
              , p = ot(s[170], B)
              , d = a[52]
              , h = r[52]
              , g = c[2]
              , w = c[2]
              , m = c[2]
              , I = s[2]
              , y = s[67]
              , _ = t + X in s[66].createElement(s[171]) ? o + G + i : s[172]in c[66] ? u[173] : v + K + f + Q;
            Jn.eventBind(s[66], _, S),
            Jn.eventBind(a[51], r[139], T),
            Jn.eventBind(u[66], Wn(e[140], e[141], s[174]), T),
            Jn.eventBind(c[66], l + Z + q, M),
            Jn.eventBind(u[66], c[175], b);
            function C() {
                return w
            }
            function E() {
                return d
            }
            function b(n) {
                w++
            }
            function T(n) {
                d++
            }
            function R() {
                return h
            }
            function k() {
                return g
            }
            function S(n) {
                h++
            }
            function P() {
                return {
                    x: m,
                    y: I,
                    trusted: y
                }
            }
            function M(n) {
                var t, r, e;
                t = r = e = a;
                var o, i, u;
                o = i = u = c;
                var s = (S,
                A,
                u[36]);
                g++,
                y = void 0 == n[s + z] || n[J + nn],
                m = n[ot(r[142], o[84])],
                I = n[i[176]]
            }
            n[e[143]] = E,
            n[ot(e[144])] = R,
            n[e[145]] = k,
            n[u[177]] = C,
            n[tn + p + rn] = P
        }(nt || (nt = {}));
        var tt;
        !function(n) {
            var t = e[146]
              , f = c[4]
              , l = c[178]
              , p = u[179]
              , h = r[147]
              , g = r[148]
              , m = e[149]
              , I = s[102]
              , y = v(rn, u[180], zn)
              , _ = at(r[150], Y)
              , C = a[151]
              , E = u[181]
              , A = c[182]
              , b = e[152]
              , B = u[183]
              , R = s[184]
              , k = a[64];
            BROWSER_LIST = {
                _1: function() {
                    return c[185]in r[65]
                },
                _2: function() {
                    return a[153]in r[65]
                },
                _3: function() {
                    return e[154]in u[83]
                },
                _4: function() {
                    var n = J
                      , r = u[186]
                      , o = s[187];
                    return n = et,
                    e[155]in e[65] && !(r + o + t in a[51].getElementsByTagName(en + f)[s[2]])
                },
                _5: function() {
                    return e[155]in s[83] && !(e[156]in c[83])
                },
                _6: function() {
                    var n, t, r;
                    n = t = r = c;
                    var e, o, u;
                    return e = o = u = a,
                    e[155]in t[83] && !i
                },
                _7: function() {
                    var n, t, r;
                    n = t = r = a;
                    var e, o, i;
                    return e = o = i = u,
                    o[188]in o[83] && !o[83][r[157]]
                },
                _8: function() {
                    return a[155]in e[65] && !e[65][e[158]]
                },
                _9: function() {
                    return u[188]in s[83] && r[65][e[158]]
                },
                _10: function() {
                    var n, t, r;
                    n = t = r = a;
                    var e, o, i;
                    e = o = i = c;
                    var u = o[189];
                    return n[159] === navigator[an + u + on]
                },
                _11: function() {
                    return ot(u[190]) === navigator[r[160]]
                },
                _12: function() {
                    var n, t, r;
                    return n = t = r = s,
                    at(t[191])in r[83]
                },
                _13: function() {
                    var n, t, r;
                    n = t = r = s;
                    var a, o, i;
                    return a = o = i = e,
                    i[161]in t[83]
                },
                _14: function() {
                    return new u[27](a[162],r[116]).test(navigator.appVersion)
                },
                _15: function() {
                    return e[163]in navigator
                },
                _16: function() {
                    return new c[27](u[192],ot(u[193])).test(navigator.vendor)
                },
                _17: function() {
                    return u[194]in u[83]
                },
                _18: function() {
                    return u[195]in c[83] && new r[47](s[196],e[116]).test(o)
                },
                _19: function() {
                    var n, t, r;
                    n = t = r = s;
                    var a, i, u;
                    a = i = u = e;
                    var c = ot(i[164], i[165])
                      , v = u[166];
                    return l + c + v in t[83] && new n[27](u[167],t[80]).test(o)
                },
                _20: function() {
                    var n = u[197];
                    return r[161]in u[83] && new r[47](n + un).test(o)
                },
                _21: function() {
                    return ot(s[198], r[168])in r[65] && new c[27](c[199],r[116]).test(o)
                },
                _22: function() {
                    var n = x;
                    return n = S,
                    s[195]in e[65] && new c[27](a[169]).test(o)
                },
                _23: function() {
                    var n, t, r;
                    n = t = r = c;
                    var a, i, u;
                    return a = i = u = e,
                    u[161]in a[65] && new t[27](u[170]).test(o)
                },
                _24: function() {
                    return s[195]in r[65] && s[200]in e[65]
                },
                _25: function() {
                    var n = w;
                    return n = Q,
                    cn + sn in u[83]
                }
            };
            function P() {
                var n = v(q, e[171], r[172]);
                return plugin_num = a[52],
                navigator[u[201]] && (plugin_num = navigator[p + h + n][c[111]]),
                plugin_num
            }
            function M() {
                for (var n in BROWSER_LIST)
                    if (BROWSER_LIST.hasOwnProperty(n)) {
                        var t = BROWSER_LIST[n];
                        if (t())
                            return +n.substr(u[0])
                    }
                return s[2]
            }
            var O = navigator[s[201]];
            function D() {
                var n, t, r;
                n = t = r = s;
                var e, o, i;
                e = o = i = a;
                var u = e[173];
                return at(e[174]) == (navigator[g + vn + u + m] || navigator[n[202]])
            }
            function N(n) {
                if (!e[65][at(s[191])])
                    return !a[54];
                var t;
                try {
                    t = new a[65][a[155]](n)
                } catch (r) {
                    return !u[0]
                }
                return !!t
            }
            function L() {
                return a[65][a[175]][a[176]]
            }
            function W() {
                for (var n = [], t = r[52]; t < parseInt(a[79], a[93]); t++)
                    n[t] = tn[t]();
                return Jn.booleanToDecimal(n)
            }
            function F() {
                var t = (n,
                d,
                navigator[r[177]]);
                return t && t[I + fn + y] > a[52]
            }
            function j() {
                return z(new a[47](ln + pn + _,s[80])) || N(s[203])
            }
            function H() {
                return z(new a[47](Wn(s[204], r[178]),e[116]))
            }
            function $() {
                var n = Y
                  , t = at(a[179], a[180]);
                n = J;
                var r;
                try {
                    r = c[66].createElement(dn + t).getContext(c[205])
                } catch (e) {}
                return !!r
            }
            function U() {
                return -parseInt(r[181], u[113]) === (new c[52]).getTimezoneOffset()
            }
            function V() {
                var n, t, e;
                n = t = e = r;
                var a, o, i;
                a = o = i = u;
                for (var c = navigator[o[206]], s = o[2]; s < An[o[111]]; s++)
                    if (An[s].test(c))
                        return s + e[54];
                return i[2]
            }
            function X() {
                var n = (m,
                B,
                a[182]);
                return z(new r[47](C + n + hn))
            }
            function G() {
                return gn + E + wn + A in a[51]
            }
            function K() {
                var n, t, r;
                return n = t = r = c,
                r[86]
            }
            function Z() {
                return u[86]
            }
            function q() {
                return navigator.javaEnabled()
            }
            function z(n) {
                var t = T;
                t = h;
                for (var r = a[52]; r < O[u[111]]; r++) {
                    var e = O[r][s[207]];
                    if (n.test(e))
                        return !a[52]
                }
                return !c[0]
            }
            function J() {
                var n, t, r;
                return n = t = r = e,
                n[183] === r[51][t[184]]
            }
            function nn() {
                var n, t, r;
                return n = t = r = c,
                n[86]
            }
            var tn = [q, j, H, X, L, En, D, bn, G, U, $, F, J, nn, Z, K];
            function En() {
                var n = Nn;
                n = un;
                try {
                    return a[185]in s[83]
                } catch (t) {
                    return s[86]
                }
            }
            var An = [new a[47](u[208]), new a[47](e[186]), new e[47](a[187]), new s[27](mn + In), new e[47](r[188]), new u[27](e[189]), new s[27](s[209]), new u[27](u[210]), new a[47](b + yn), new e[47](B + R + k), new c[27](u[211])];
            function bn() {
                return new u[27](ot(r[190]),u[80]).test(navigator[s[212]] || navigator[_n + Cn])
            }
            n[s[213]] = V,
            n[c[214]] = M,
            n[e[191]] = P,
            n[e[192]] = W
        }(tt || (tt = {}));
        var rt;
        !function(n) {
            var t = e[87], o = a[8], i = e[8], f = s[215], l = r[52], p = s[0], d = parseInt(c[216], u[122]), h = e[86], g = u[217], w = u[123], m = e[165], I = parseInt(t + En, c[122]), y = parseInt(a[79], a[82]), _ = c[218], C = parseInt(a[193], e[82]), E = parseInt(o + i, r[78]), A = parseInt(u[219], s[122]), b = parseInt(f + An, s[106]), T = parseInt(r[194], s[106]), B = parseInt(ot(s[220], e[195]), r[82]), R = parseInt(e[196], u[122]), k = parseInt(e[197], a[78]), S;
            function P() {
                var n = s[0]
                  , t = r[88]
                  , e = parseInt(u[13], c[122])
                  , a = s[217];
                S = new qn([a, a, a, a, n, n, n, e, t, t, t, t, t, t, t, a, t, n]),
                S[p] = Jn.serverTimeNow(),
                M(),
                S[B] = Vn,
                S[k] = Un,
                S[R] = c[2],
                S[h] = Jn.strhash(navigator.userAgent),
                S[b] = tt.getBrowserFeature(),
                S[g] = tt.getPlatform(),
                S[w] = tt.getBrowserIndex(),
                S[m] = tt.getPluginNum()
            }
            function M() {
                var n = Qn.getCookie(Fn) || Zn.get(jn);
                if (n && n[s[111]] == parseInt(c[221], e[93])) {
                    var t = zn.decode(n);
                    if (t && (S.decodeBuffer(t),
                    S[l] != s[2]))
                        return
                }
                S[l] = Jn.random()
            }
            function O() {
                S[R]++,
                S[p] = Jn.serverTimeNow(),
                S[d] = Jn.timeNow(),
                S[B] = Vn,
                S[I] = nt.getMouseMove(),
                S[y] = nt.getMouseClick(),
                S[_] = nt.getMouseWhell(),
                S[C] = nt.getKeyDown(),
                S[E] = nt.getClickPos().x,
                S[A] = nt.getClickPos().y;
                var n = S.toBuffer();
                return zn.encode(n)
            }
            n[e[57]] = P;
            function D() {
                return O()
            }
            n[v(an, a[198], r[199])] = D
        }(rt || (rt = {}));
        var et;
        function at() {
            var n, t, r;
            n = t = r = u;
            var a, o, i;
            a = o = i = e;
            var c = arguments[o[52]];
            if (!c)
                return t[1];
            for (var s = o[0], v = o[1], f = a[52]; f < c.length; f++) {
                var l = c.charCodeAt(f)
                  , p = l ^ v;
                v = v * f % n[222] + o[200],
                s += i[2].fromCharCode(p)
            }
            return s
        }
        !function(n) {
            var t, r, e;
            t = r = e = a;
            var o, i, c;
            o = i = c = u;
            var s = c[223], f = t[201], l = i[224], p = o[225], d = t[202], h = i[92], g = e[203], w = o[226], m = c[110], I = c[223], y = !!r[65][r[135]], _, E, A, T, B, R;
            function k(n) {
                var r = o[227]
                  , e = t[204];
                return j(n) && Qn[r + e + s]
            }
            function S(n, t, e) {
                var a, i, u;
                a = i = u = o;
                var c, s, v;
                c = s = v = r;
                var f = b;
                if (f = En,
                Wn(v[205], s[206])in t)
                    return t.apply(n, e);
                switch (e[v[56]]) {
                case v[52]:
                    return t();
                case i[0]:
                    return t(e[c[52]]);
                case u[122]:
                    return t(e[c[52]], e[a[0]]);
                default:
                    return t(e[u[2]], e[v[88]], e[i[63]])
                }
            }
            function P() {
                var n, t, r;
                n = t = r = i;
                var a, o, u;
                a = o = u = e,
                U(o[65], n[188], function(r) {
                    return function(e) {
                        if (e && new t[27](f + l,v(Fn, n[228])).test(e))
                            try {
                                D()
                            } catch (o) {
                                return a[207]
                            }
                        return new r(e)
                    }
                })
            }
            function M() {
                var n = t[51].getElementsByTagName(c[229]);
                function a(a) {
                    if (!new i[27](at(o[230])).test(a.protocol))
                        return r[61];
                    var u = a[i[231]];
                    if (!u) {
                        var s = n[i[2]];
                        s && (u = s[t[208]])
                    }
                    if ((!u || new e[47](ot(c[232], $n),c[80]).test(u)) && (a[o[140]].split(i[233])[e[52]] == _ && a[at(i[234], c[235])]))
                        return i[86];
                    return e[44]
                }
                Jn.eventBind(t[51], r[209], function(n) {
                    var t = i[236];
                    n = n || event;
                    var r = n[bn + t + p] || n[Wn(o[5], c[237], o[238])];
                    do {
                        if (r[i[240]] == i[241]) {
                            a(r) && D();
                            break
                        }
                    } while (r = r[i[239]])
                }),
                Jn.eventBind(i[66], o[242], D),
                Ln || Jn.eventBind(o[83], e[210], D)
            }
            function O() {
                var n = ot(o[243])
                  , e = o[244];
                _ = location[c[140]].split(o[233])[i[2]],
                E = location[n + Tn + e],
                T = location[i[245]],
                B = location[ot(t[211])],
                A = Jn.getRootDomain(E),
                R = new o[27](i[246] + A.replace(new r[47](t[212],i[96]), ot(c[247], r[213])) + t[214],r[116]),
                M(),
                Y(),
                N(),
                $(),
                D()
            }
            function D() {
                var n = rt.update();
                return Qn.setCookie(Fn, n, o[248], A, t[215]),
                Zn.set(jn, n),
                n
            }
            function N() {
                var n = B;
                n = Un;
                var r = ot(c[249]);
                H(t[216], function(n) {
                    return function(t, a) {
                        var i, u, c;
                        i = u = c = e;
                        var s, v, f;
                        s = v = f = o,
                        f[22][i[217]][f[250]].call(t) === v[251] && (t = t[u[218]] || i[0]);
                        var l = D();
                        return a = a || {},
                        Qn[at(u[219], K)] ? X(t) ? k || (t = L(t)) : a[i[220]] ? a[v[252]][jn] = l : (a[s[252]] = new Headers,
                        a[u[220]].append(jn, l)) : (l = rt.update(),
                        a[f[252]] ? a[Bn + d][jn] = l : (a[h + r] = new Headers,
                        a[i[220]].append(jn, l))),
                        n.call(this, t, a)
                    }
                })
            }
            function L(n) {
                for (var a = rt.update(), u = Gn, s = c[2]; s < u[Rn + kn]; s++)
                    if (u[s].test(n))
                        return n;
                return n + (new t[47](v(r[82], r[221], t[222])).test(n) ? Wn(c[253], i[254], bn) : e[223]) + Yn + c[70] + o[255](a)
            }
            function W(n) {
                var t = cn
                  , a = i[16]
                  , u = e[43];
                t = C;
                var s;
                U(n, c[256], function(n) {
                    return function() {
                        var t, r, a;
                        t = r = a = i;
                        var o, u, c;
                        o = u = c = e;
                        try {
                            X(arguments[o[54]]) && !k(arguments[a[0]]) ? arguments[t[0]] = L(arguments[r[0]]) : s = D(),
                            n.apply(this, arguments),
                            X(arguments[r[0]]) || (Qn[u[53]] || (s = rt.update()),
                            this.setRequestHeader(jn, s))
                        } catch (v) {
                            return o[207]
                        }
                    }
                }),
                U(n, c[257], function(n) {
                    var t = w;
                    return t = p,
                    function() {
                        var t, e, i;
                        t = e = i = r;
                        var c, s, v;
                        c = s = v = o;
                        var f = c[258];
                        try {
                            if (parseInt(this.status) === parseInt(f + g + Sn, e[78])) {
                                for (var l = n.apply(this, arguments), p = new s[27](i[224],t[225]), d, h, w = {}; d = p.exec(l); )
                                    w[d[s[0]].toLowerCase()] = d[i[88]];
                                Jn.analysisRst(Jn.parse(w[$n.toLowerCase()]))
                            }
                        } catch (m) {
                            return Pn + a + u
                        }
                        return n.apply(this, arguments)
                    }
                })
            }
            function Y() {
                var n = i[83][Wn(x, c[259])];
                n && W(n.prototype),
                r[65][o[188]] && P()
            }
            function j(n) {
                var r = rn;
                r = p;
                var e = Jn.getHostFromUrl(n, t[44]);
                return e ? R.test(e) : t[44]
            }
            function H(n, t) {
                if (n in i[83]) {
                    c[83].hasOwnProperty(n) && U(i[83], n, t);
                    var r = e[65][c[260]];
                    if (r) {
                        var a = r[o[104]];
                        a.hasOwnProperty(n) && U(a, n, t)
                    }
                }
            }
            function $() {
                var n = at(c[261])
                  , e = c[262]
                  , a = r[226];
                function u(n) {
                    return function(t) {
                        try {
                            s(t)
                        } catch (r) {
                            return r
                        }
                        return S(this, n, arguments)
                    }
                }
                function s(r) {
                    var u = it
                      , c = i[50]
                      , s = at(o[263], i[264]);
                    if (r && r[c + s + Mn + On] == n + e + Dn) {
                        var v = r[t[227]];
                        u = F,
                        V(v) || (k(v) ? D() : r[a + xn + w] = L(r.src))
                    }
                }
                function v(n) {
                    y ? U(Element.prototype, n, u) : (U(Kn, n, u),
                    U(r[51].body, n, u))
                }
                t[65][Hn] = Jn[t[228]],
                v(at(r[229])),
                v(r[230])
            }
            function U(n, a, i) {
                var u = D
                  , s = c[265]
                  , v = ot(t[231]);
                if (!n)
                    return e[61];
                var f = n[a];
                if (u = S,
                !f)
                    return o[86];
                var l = i(f);
                return y || (l[c[266]] = f + t[0]),
                l[s + m + v + I] = f,
                n[a] = l,
                r[44]
            }
            function V(n) {
                var t = Xn
                  , e = o[83][r[232]];
                e && (t = t.concat(e));
                for (var a = i[2]; a < t[c[111]]; a++)
                    if (t[a].test(n))
                        return o[67];
                return o[86]
            }
            function X(n) {
                var t = Jn.getOriginFromUrl(n);
                return t ? !new r[47](e[233] + T).test(t[c[122]]) || !new o[27](B).test(t[r[54]]) : e[61]
            }
            n[t[57]] = O
        }(et || (et = {}));
        function ot() {
            var n, t, e;
            n = t = e = c;
            var a, o, i;
            a = o = i = r;
            var u = arguments[a[52]];
            if (!u)
                return o[0];
            for (var s = a[0], v = n[267], f = o[200], l = t[2]; l < u.length; l++) {
                var p = u.charCodeAt(l);
                f = (f + t[0]) % v.length,
                p ^= v.charCodeAt(f),
                s += i[2].fromCharCode(p)
            }
            return s
        }
        var it;
        !function(n) {
            var t = Wn(r[234], e[235]);
            function o() {
                try {
                    c()
                } catch (n) {
                    return n
                }
            }
            function i() {
                var n = parseInt(t + Nn, s[113]);
                setInterval(function() {
                    Jn.getServerTime()
                }, n)
            }
            function c() {
                Qn.Init(),
                Zn.Init(),
                rt.Init(),
                et.Init(),
                i()
            }
            u[83][v(r[236], e[237])] || (o(),
            u[83][a[238]] = a[44])
        }(it || (it = {}))
    }()
};
console.log(v_cookie(["", 9527, String, Boolean, "eh", "ad", "Bu", "ileds", "1", "\b", Array, "7", "base", "64De", "\u2543\u252b", "etatS", "pa", "e", "FromUrl", "getOrigi", "nFromUrl", "\u255b\u253e", "b?\x18q)", "ic", "k", "sted", "he", "wser", "oNo", "ckw", "ent", "hst", "^And", "RM", "systemL", 5, "\u255f\u0978\u095b\u09f5", "TR8", "!'", "gth", "er", "TP", 83, "r", !0, "v", "v-nixeh", RegExp, "thsi.cn", 'K\x19"]K^xVV', "KXxAPD?\x1b[Y", document, 0, "allow", 1, "; ", "length", "Init", "=", "; domain=", "checkcookie", !1, "eikooCled", "tnemucod", "d", window, "\u2553\u0972\u0959\u09e4\u09bd\u0938\u0980\u09c5\u09b1\u09d1\u09a7\u09dc\u09dd\u09d3\u09c2", "\u2556\u0979\u095e\u09d3\u09b5\u0935\u098f\u09c7\u099d\u09d2\u09b0", 23, "l$P$~", "frames", "ducument", "ydob", "documentElement", "del", "@[\\]^`{|}~]", "base_fileds", "255", 10, "10", 39, "\u2547\u2535\u255a\u252e\u2541\u2535\u254c\u253c\u2559", 8, "4", "3", "de", 3, "11", 2, "203", "22", "111111", "3f", 16, "\x0f", "\u2506\u2537\u2507\u2537", "11111111", "base64Encode", "v\x1d", "ati", "WY", "te", "bo", "rs", "getHost", Date, "{DF", ":", "^{.*}$", "WU<P[C", 52, "1001", "href", "1111101010", "redirect_url", "^\\s*(?:https?:)?\\/{2,}([^\\/\\?\\#\\\\]+)", "i", "\u256c\u252c\u2516\u254b", "@", "ready", "change", "dy", 7, "protocol", "//s.thsi.cn/js/chameleon/time.1", "onerror", "2000", "readyState", null, "^(\\d+\\.)+\\d+$", "^\\s*(?:(https?:))?\\/{2,}([^\\/\\?\\#\\\\]+)", ".", "strToBytes", "isIPAddr", "serverTimeNow", "addEventListener", "th", "wh", "Scro", "mousemove", 55, "evomhcuot", "[[?PVC\x0e", "getMouseMove", '_R"xWB%Po_3YT', "getMouseClick", "ght", "gin", "msD", "ack", "\u2556\u096b\u095f", "Nativ", "^A", "MozSettingsEvent", "safari", "ActiveXObject", "postMessage", "Uint8Array", "WeakMap", "Google Inc.", "vendor", "chrome", "python", "sgAppName", "JX", 6, "me", "LBBROWSER", "w4", "2345Explorer", "TheWorld", "\u2544", 40, "tTr", "\u2506", "navigator", "webdriver", "languages", "taborcA|FDP", "\u2541\u097c\u0949", 95, "1e0", "e Cli", "iso-8859-1", "defaultCharset", "localStorage", "^Win64", "^Linux armv|Android", "^iPhone", "^iPad", "B_{VV", "getPluginNum", "getBrowserFeature", "12", "16", "sE", "10000", "17", "\u2542\u2532\u2556\u2537\u2543\u2526", "\x1cx`R", 2333, "XMLH", "ers", "0", "lo", 57, "ylppa", "error", "target", "click", "unload", "HE9AWT9Y", "\\.", "c?", "$", "/", "fetch", "prototype", "url", "\u2556\u0971\u0956\u09fe\u09a7", "headers", "\u256b\u2554", 79, "?", "^(.*?):[ \\t]*([^\\r\\n]*)\\r?$", "gm", "s", "src", "analysisRst", "\u255e\u0973\u0949\u09f4\u09a2\u0929\u09ac\u09d4\u0992\u09d2\u09b0\u09d4", "appendChild", "Y", "jsonp_ignore", "^", 70, "421", "XH>a", "\u2574\u253c\u257d\u2530\u2575\u2539\u257c\u2533\u257d\u2522\u256e\u2521\u2560\u2524\u2561\u2525", "CHAMELEON_LOADED"], [1, "", 0, "he", "ad", 29, "\x180G\x1f", "?>=<;:\\\\/,+", "ng", "to", "ff", Number, Error, "11", "6", "er", "ro", "code", "co", "_?L", "ed", "@S\x15D*", Object, "len", "gth", "on", "lo", RegExp, "ySta", 13, "eel", "ee", "ouse", "ll", "\u2544\u2530\u2555\u2531", "FCm-", "isTru", "getC", "Pos", "ve", "or", "ae", "^", "On", "Sho", "can", "ont", "roid", "anguage", "\u2502", "ta", "tna", Date, "3", "am", "e", "n+", "f80", "\x1dD", 6, "\u255f\u253a\u2542\u252b\u2545\u2568\u251e", "KCABLLAC_NOELEMAHC", "X-Antispider-Message", 3, ".baidu.", Function, document, !0, "cookie", "; ", "=", 96, "\u255b\u253e\u2550\u2537\u2543\u252b", "\u250c\u252c\u255c\u253d\u2549\u2521\u251c", ";O", "; expires=", "getCookie", "Thu, 01 Jan 1970 00:00:00 GMT", "setCookie", "Z\x18|", "i", "\u255b\u2534\u2557\u2536\u255a\u2509\u257d\u2512\u2560\u2501\u2566\u2503", 52, window, 10, "Init", !1, "set", "v", "eliflmth", '<script>document.w=window<\/script><iframe src="/favicon.icon"></iframe>', "iS.p", "head", "#default#userData", "get", "[!\"#$%&'()*", "g", "^d", "$D", "\u2568\u2537\u2568\u254c\u256a", "]\\P", "___", "le", "th", "prototype", "base_f", 8, "\\R5Z\\R\x14@^Q3G", "ZV%PgQ?Y]S%", 67, "r", "length", "0", 16, "12", "\u2576\u095f\u0979\u09d5\u0995\u091b\u09a9\u09f9\u09bd\u09f7\u0989\u09fd\u09f5\u09f3\u09f9\u0a41\u0a4d\u098f\u0999\u0905\u0975\u09cb\u09a9\u09a9\u099d\u0927\u0933\u0913\u0a6b\u0999\u09a3\u0937\u098b\u09f5\u0933\u0a7b\u091b\u09b1\u0a63\u095f\u09fb\u094d\u0993\u0943\u092b\u0949\u09a3\u09e7\u09cb\u0925\u0993\u09ab\u09f0\u092c\u092c\u0942\u0950\u09c8\u0944\u09c6\u0990\u0944\u09cb\u098e", "i,", "\u2505\u092f", 12, 56, "20", "1000", 2, 5, "11111111", "encode", "\u255b\u0972\u0959", "\u2519", "s", "WY$PYS", "ystate", "1111101000", / /g, ",", "\u250d", '^".*"$', "edoc_sutats", "status_code", "location", "redirect_url", "href", "4294967295", "j", "1200000", "script", "src", "onreadystatechange", "read", "loaded", "readyState", "complete", "interactive", "onload", "undefined", "\\.com\\.cn$|\\.com\\.hk$", ".", "getServerTime", 'YY7YAD?FjD"', "strhash", "random", "getRootDomain", "booleanToDecimal", "timeNow", "\u2559\u253e", "eventBind", "onwh", "\u255b", 46, "DOMM", "cl", "T^5^", "div", "onmousewheel", "mousewheel", 51, "keydown", "clientY", "getKeyDown", "ch", "plu", "\u2543\u252b", "ouc", "art", "^i", "Po", "callPhantom", "max", "Hei", "ActiveXObject", "nd", "yG&Y]\x17\x15ZUG#A]Ez\x15qY5\x1b", "\u2576\u097e\u094e\u09f8\u09a6\u0938\u09b6\u09fe\u0996\u09d7\u09a7\u09d2\u09cc", "Maxthon", "Q", "opr", "chrome", "BIDUBrowser", "QQBro", "[_$ZUR", "UBrowser", "MSGesture", "plugins", "doNotTrack", "ShockwaveFlash.ShockwaveFlash", "]C|\x18", "webgl2", "platform", "name", "^Win32", "^MacIntel", "^Linux [ix]\\d+", "^BlackBerry", "language", "getPlatform", "getBrowserIndex", "1", "10", 4, 9, "1100", "\t\0", "3c", 256, "w", "TTP", "et", "c", "al", "\u255e", "base", "\u2569\u0975\u094e\u09e5\u09a0\u092e\u09d1\u09ed\u09ce", "target", "fh%PTQr", "#", "\u255f\u097c\u0949\u09f9", 97, "rg", "tnemelEcrs", "fn_Ws", "parentNode", "tagName", "A", "submit", "PX%", "me", "host", "\\.?", "d\x19", "Fri, 01 Feb 2050 00:00:00 GMT", "]E%", "toString", "[object Request]", "headers", 83, "&", encodeURIComponent, "open", "getAllResponseHeaders", "4", "tseuqeRpttHLMX", "Window", "\u2564\u095e", "RI", "\u2550\u0953", "(YaZ", "_", "_str", "V587"]))




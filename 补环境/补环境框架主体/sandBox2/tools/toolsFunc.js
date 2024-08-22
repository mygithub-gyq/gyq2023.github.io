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
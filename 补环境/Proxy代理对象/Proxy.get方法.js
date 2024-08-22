// 3.Proxy.get方法

// 框架功能代码
ld={};
ld.config={};
ld.config.proxy=true;

ld.getType=function getType(obj){
    return Object.prototype.toString.call(obj);
}

ld.proxy = function proxy(obj,objName){
    // obj:原始对象
    // objName:原始对象的名字
    if(!ld.config.proxy){
        return obj;
    }
    let handler={
        get:function (target,prop,receiver){
        // target: 原始对象,这里是user
        // prop: 属性
        // receiver: 代理后的对象
            let result;
            try{// 防止报错
                result=Reflect.get(target,prop,receiver);
                let type=ld.getType(result);
                if(result instanceof Object){
                    console.log(`{get|obj:[${objName}] --> prop:[${prop}],type:[${type}]}`);
                    // 如果是对象,还要进行递归代理
                    result=ld.proxy(result,`${objName}.${prop.toString()}`);
                }else {
                    console.log(`{get|obj:[${objName}] --> prop:[${prop}],ret:[${result}]}`);
                }
            }catch (e){
                console.log(`{get|obj:[${objName}] --> prop:[${prop}],error:[${e.message}]}`);
            }
            return result;
        }
    };

    return new Proxy(obj,handler);

}

user={
    "username":"xm",
    "info":{
        "name":"小明",
        "age":12
    }
}

user=ld.proxy(user,"user");
console.log(user.info.name);
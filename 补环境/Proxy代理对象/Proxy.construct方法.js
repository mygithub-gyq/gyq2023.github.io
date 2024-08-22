// 8.Proxy.construct方法
// 拦截 new关键字

// 框架功能代码
ld={};
ld.config={};
ld.config.proxy=true;// 代理开关,决定是否代理

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
                    console.log(`{get|obj:[${objName}] --> prop:[${prop.toString()}],type:[${type}]}`);
                    // 如果是对象,还要进行递归代理
                    result=ld.proxy(result,`${objName}.${prop.toString()}`);
                }else {
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
                let type=ld.getType(value);
                if(value instanceof Object){
                    console.log(`{set|obj:[${objName}] --> prop:[${prop.toString()}],type:[${type}]}`);
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
                let type=ld.getType(result);
                console.log(`{getOwnPropertyDescriptor|obj:[${objName}] --> prop:[${prop.toString()}],type:[${type}]}`);
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
                let type=ld.getType(result);
                if(result instanceof Object){
                    console.log(`{apply|function:[${objName}], type:[${type}]}`);
                }else if(typeof result==="symbol"){
                    console.log(`{apply|function:[${objName}], result:[${result.toString()}]}`);
                }else{
                    console.log(`{apply|function:[${objName}], result:[${result}]}`);
                }
            }catch (e){
                console.log(`{apply|function:[${objName}],error:[${e.message}]}`);
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
                let type=ld.getType(result);
                console.log(`{construct|function:[${objName}], type:[${type}]}`);
            }catch (e){
                console.log(`{construct|function:[${objName}],error:[${e.message}]}`);
            }
            return result;
        }
    };

    return new Proxy(obj,handler);

}

function User(){

}

Object.defineProperty(User.prototype,Symbol.toStringTag,{
    value:"UserTest"
})
User=ld.proxy(User,"User")
u=new User();
// 2.代理器方法封装

// 框架功能代码
ld={};
ld.config={};
ld.config.proxy=true;

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
            console.log(`${objName}正在获取${prop.toString()}`);
            // let result=target[prop];
            let result = Reflect.get(target,prop,receiver);// 反射: 执行原始操作
            console.log(`返回值:${result}`);
            return result;
        }
    };

    return new Proxy(obj,handler);

}


let symbol=Symbol(123);

// 这相当于浏览器接口对象
let user={
    "name":"小明",
    1:2,
    [symbol]:"symbol123",
    "age":12,// 相当于补原本没有的环境
}


user=ld.proxy(user,"user");
// js 执行的代码
console.log(user.name);
console.log(user[1]);
console.log(user[symbol]);
console.log(user["age"]);
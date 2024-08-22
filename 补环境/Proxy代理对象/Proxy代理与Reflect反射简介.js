// 1.Proxy代理与Reflect反射简介
// proxy作用: 监控对象操作,获取属性,设置属性,调用属性的一些方法
// reflect作用: 执行原始操作

let symbol=Symbol(123);

// 这相当于浏览器接口对象
let user={
    "name":"小明",
    1:2,
    [symbol]:"symbol123",
    "age":12,// 相当于补原本没有的环境
}

// 第一个参数: 原始对象
// 第二个参数: handler,也是对象
// 我们添加代理
user =new Proxy(user,{
    get:function (target,prop,receiver){
        // target: 原始对象,这里是user
        // prop: 属性
        // receiver: 代理后的对象

        console.log(`正在获取${prop.toString()}`);

        // let result=target[prop];
        let result = Reflect.get(target,prop,receiver);// 反射: 执行原始操作
        console.log(`返回值:${result}`);
        return result;
    }
});

// 可以处理对象没有的属性,在补环境中,可以监测到需要补哪些环境


// js执行代码
console.log(user["age"])

// console.log(user.name);
// console.log(user[1]);
// console.log(user[symbol]);


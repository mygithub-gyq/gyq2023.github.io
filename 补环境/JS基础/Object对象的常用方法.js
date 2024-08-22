// Object 对象常用方法
// Object.create() :创建对象
// Object.is()     :判断两个对象是否是同一对象
// obj.hasOwnProperty() :对象自身属性中是否具有指定的属性
// Object.getOwnPropertyDescriptor() :返回指定对象上一个自有属性对应的属性描述符
// Object.getOwnPropertyDescriptors() :获取一个对象的所有自身属性的描述符
// Object.getPrototypeOf()      :获取实例对象的原型对象
// Object.setPrototypeOf()      :方法设置一个指定的对象的原型
// Object.defineProperty()      :直接在一个对象上定义一个新属性,或者修改一个对象的现有属性,并返回此对象,要求原属性可配置
// 更具体更详细的Object方法: https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object

// let a=Object.create(Document.prototype);
// Object.is(window,top);
// document.hasOwnProperty("location");
// Object.getOwnPropertyDescriptor(document,"location");
// Object.getOwnPropertyDescriptors(Document.prototype);
// Object.getPrototypeOf(document);
// let x={};
// Object.setPrototypeOf(x,Document.prototype);
// Object.defineProperty(x,'age',{value:18});

//初始化对象时定义属性

let User={
    "name":"小明",
}

User.age=10;
// User["age"]=20;
// console.log(User)

// 方法一:直接定义value
// 第一个参数是一个对象,第二个参数是一个属性名,第三个参数是一个描述符(对象)
// Object.defineProperty(User,"height",{
//     enumerable:true,
//     configurable:true,
//     value:160,
//     writable:true
// });
//
// for (const userKey in User){
//     console.log(userKey)
// }
//
// User.height=180;
// console.log(User.height)



// 方法二,get,set,其中通过临时变量,来设置值
let temp=150;
Object.defineProperty(User,"height",{
    enumerable:true,
    configurable:true,
    get:function (){
        console.log("正在获取值");
        return temp;
    },
    set:function (value) { //当对属性进行赋值操作时调用
        console.log("正在设置值");
        temp=value;
    }
});

console.log(User.height)

User.height=180;

console.log(User.height)

// 这两个方法不能混合使用,补环境中常用方法二,set,get方法
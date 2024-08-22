//原型链
// 1.原型            ->类
// 2.原型对象         ->类中属性与方法组成的一个对象
// 3.实例对象         ->创建的实例
// 4.如何相互转换

// 原型(它是一个函数)
function User(){

}
console.log(User)
// 原型上定义属性和方法
User.prototype.username= "test";
User.prototype.password= "123456";

User.prototype.login = function login(username, password) {
    console.log(`${username}登录成功`);
};
// 从原型到原型对象,原型.prototype=原型对象
console.log(User.prototype);

// 从原型到实例对象,通过new关键字,拥有原型对象上的一些属性和方法
let user=new User();
user.login("小明","1")

// 从原型对象到原型,通过constructor方法
console.log(User.prototype.constructor===User)

// 从原型对象到实例对象,通过第26行的操作
let user2=new User.prototype.constructor();
console.log(user2)

// 从实例对象到原型
console.log(Object.getPrototypeOf(user).constructor===User)

// 从实例对象到原型对象,这样一来就可以得到user这个实例对象的原型对象,Object.getPrototypeOf(user)

console.log(user.__proto__===User.prototype);

console.log(Object.getPrototypeOf(user)===User.prototype);
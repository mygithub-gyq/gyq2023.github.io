//一共有3种创建JS对象的方式
//1.直接字面量的方式
//2.通过new关键字
//3.通过Object.create()方法

let a={};

let b=new Object();

let c=Object.create(Object.prototype);

console.log(a)

console.log(b)

console.log(c)
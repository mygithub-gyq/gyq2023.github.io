// 判断对象的类型
// typeof
// Object.prototype.toString.call,优先使用！！！！！！！！！！

console.log(typeof 1);
console.log(typeof "1");
console.log(typeof {});
console.log(typeof true);
console.log(typeof []);//这两个有问题,得用另一种方式
console.log(typeof null);//这两个有问题,得用另一种方式
console.log(typeof undefined);
console.log(typeof Symbol());
console.log(typeof function (){});


console.log("------------------------------------------")
console.log(Object.prototype.toString.call(1));
console.log(Object.prototype.toString.call("1"));
console.log(Object.prototype.toString.call({}));
console.log(Object.prototype.toString.call(true));
console.log(Object.prototype.toString.call([]));
console.log(Object.prototype.toString.call(null));
console.log(Object.prototype.toString.call(undefined));
console.log(Object.prototype.toString.call(Symbol()));
console.log(Object.prototype.toString.call(function () {}));



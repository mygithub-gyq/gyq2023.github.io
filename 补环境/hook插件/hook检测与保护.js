// hook 检测与保护
// toString()方法

function atob(){
    console.log("正在执行atob");
}
// 方法一 改写toString方法
// atob.toString = function (){
//     return 'function atob() { [native code] }';
// }

// 方法二 从原型链上改写(模板字符串,通用的保护方法),把想要的结果保护起来
Function.prototype.toString= function (){
    return `function ${this.name}() { [native code] }`;
}

console.log(btoa.toString())
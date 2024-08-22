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
    global.setNative = function (func, funcname){
        set_native(func,symbol,`function ${funcname || func.name || ''}() { [native code] }`);
    }
}();

add=function (a,b){
    return a+b;
}
btoa=function (){

}
setNative(btoa,"btoa")// 添加了一个Symbol类型的属性,值是function btoa() { [native code] }
console.log(btoa.toString())
console.log(Function.prototype.toString.call(btoa))
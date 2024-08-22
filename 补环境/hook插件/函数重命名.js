// 函数重命名

reNameFunc=function reNameFunc(func,name){
    Object.defineProperty(func,"name",{
        writable:false,
        configurable:true,
        enumerable:false,
        value:name
    })
}

add=function xxx(a,b){
    return a+b;
}

reNameFunc(add,"get add");
console.log(add.name)
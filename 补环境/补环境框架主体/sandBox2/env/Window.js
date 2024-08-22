
// Window对象
Window=function Window(){
    return ldvm.toolsFunc.throwError("TypeError","Illegal constructor");
}
// 保护Window原型
ldvm.toolsFunc.safeProto(Window,"Window");
// 设置Window.prototype的原型对象
Object.setPrototypeOf(Window.prototype,WindowProperties.prototype);
// Window:原型的属性
ldvm.toolsFunc.defineProperty(Window,"PERSISTENT",{
    value: 1,
    writable: false,
    enumerable: true,
    configurable: false
})
ldvm.toolsFunc.defineProperty(Window,"TEMPORARY",{
    value: 0,
    writable: false,
    enumerable: true,
    configurable: false
})
// Window.prototype:原型对象的属性
ldvm.toolsFunc.defineProperty(Window.prototype,"PERSISTENT",{
    value: 1,
    writable: false,
    enumerable: true,
    configurable: false
})
ldvm.toolsFunc.defineProperty(Window.prototype,"TEMPORARY",{
    value: 0,
    writable: false,
    enumerable: true,
    configurable: false
})

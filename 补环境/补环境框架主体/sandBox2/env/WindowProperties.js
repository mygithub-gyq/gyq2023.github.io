// WindowProperties对象

WindowProperties=function WindowProperties(){

}
// 保护原型
ldvm.toolsFunc.safeProto(WindowProperties,"WindowProperties");
// 删除构造方法
delete WindowProperties.prototype.constructor;
Object.setPrototypeOf(WindowProperties.prototype,EventTarget.prototype);

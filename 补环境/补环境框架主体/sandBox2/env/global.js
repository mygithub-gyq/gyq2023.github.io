// window对象

window=global;
delete global;
delete Buffer;
delete WindowProperties;
Object.setPrototypeOf(window,Window.prototype);

ldvm.toolsFunc.defineProperty(window,"atob",{
    configurable:true,
    enumerable:true,
    writable:true,
    value:function atob(str){
        return ldvm.toolsFunc.base64.base64decode(str);
    }
});
ldvm.toolsFunc.defineProperty(window,"btoa",{
    configurable:true,
    enumerable:true,
    writable:true,
    value:function btoa(str){
        return ldvm.toolsFunc.base64.base64encode(str);
    }
});
ldvm.toolsFunc.defineProperty(window,"name",{
    enumerable: true,
    configurable: true,
    get:function (){},
    set:function (){}
});
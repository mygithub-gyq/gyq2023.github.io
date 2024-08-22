// 简单hook cookie

_cookie=document.cookie;
Object.defineProperty(document,"cookie",{
    get(){
        console.log("正在获取cookie:",_cookie);
        return _cookie;
    },
    set(value){
        console.log("正在设置cookie",value);
        _cookie=value;
    }
});
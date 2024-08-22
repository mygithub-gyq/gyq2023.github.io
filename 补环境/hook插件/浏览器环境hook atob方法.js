// 浏览器环境 hook  函数atob:对base64进行解码

_atob=atob;

atob= function (str){
    console.log("正在执行atob方法,参数:",str);
    let result=_atob(str);
    console.log("正在执行atob方法,返回值:",result);
    if(result==="name"){// 定位到关键点
        debugger;
    }
    return result;
}
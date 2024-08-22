// valueOf和toString方法
// js自动调用,不需要我们主动去调用,当然也可以主动去调用

let a={
    "toString":function (){
        console.log("toString正在执行");
        return "toString"
    },
    "valueOf":function (){
        console.log("valueOf正在执行");
        return "valueOf"
    }
}
console.log(+a);//valueOf,NaN表示非数字,,,,当没有valueOf时执行toString

console.log(a+"");//valueOf,,,,当没有valueOf时执行toString

console.log(`${a}`);//不管什么情况,都执行toString方法
//1. call方法
//2. apply方法
//3. arguments对象

function add(a,b){
    console.log(a+b);
}

add(1,2)
// call方法第一个参数是指针,this或者null,即谁调用的,第二个参数开始,就是原函数的实际参数
add.call(this, 8, 9)
// apply 第一个参数也是this指针,即调用者,第二个参数是一个数组,把实际参数进行打包到一个数组内
add.apply(this, [10,20])

function info(height,weight){
    console.log(`${this.name}:${this.age}`);
    console.log(`${height}:${weight}`);
}

name="小张";
age=10;
info(150,40)

let user={
    "name":"小王",
    "age":12
}

info.call(user,180,40)

info.apply(user,[165,70])

// arguments:类似于一个数组的对象,//函数参数个数不确定时,使用apply 和 arguments 配合使用
// 具体来说, 当调用 info.apply(user, arguments) 时, arguments 对象的作用是将 test 函数调用时传入的参数（在这个例子中是 160 和 50）传递给 info 函数
function test(){
    let user={
        "name":"小王",
        "age":12
    }
    info.apply(user,arguments);
}

test(160,50)
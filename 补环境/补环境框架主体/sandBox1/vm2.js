// vm2 作用,整合JS,提供相对纯净的V8环境,方便我们调试

const {VM,VMScript} = require("vm2");
const fs =require("fs");

// 创建虚拟机
const vm = new VM();
const code = fs.readFileSync("./input.js");

const script=new VMScript(code,"./debugJS.js");

const result = vm.run(script);

console.log(result);

fs.writeFileSync("./output.js",code);
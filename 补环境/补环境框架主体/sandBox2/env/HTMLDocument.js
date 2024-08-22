// HTMLDocument对象
HTMLDocument = function HTMLDocument(){return ldvm.toolsFunc.throwError("TypeError","Illegal constructor");}
ldvm.toolsFunc.safeProto(HTMLDocument,"HTMLDocument");
Object.setPrototypeOf(HTMLDocument.prototype,Document.prototype);

// document对象
document = {}
Object.setPrototypeOf(document,HTMLDocument.prototype);
ldvm.toolsFunc.defineProperty(document,"location",{configurable:false,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,document,"document","location_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,document,"document","location_set",arguments)}});
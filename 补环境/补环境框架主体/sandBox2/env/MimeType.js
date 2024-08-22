// MimeType对象
MimeType = function MimeType(){return ldvm.toolsFunc.throwError("TypeError","Illegal constructor");}
ldvm.toolsFunc.safeProto(MimeType,"MimeType");
ldvm.toolsFunc.defineProperty(MimeType.prototype,"type",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,MimeType.prototype,"MimeType","type_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(MimeType.prototype,"suffixes",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,MimeType.prototype,"MimeType","suffixes_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(MimeType.prototype,"description",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,MimeType.prototype,"MimeType","description_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(MimeType.prototype,"enabledPlugin",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,MimeType.prototype,"MimeType","enabledPlugin_get",arguments)}, set: undefined});
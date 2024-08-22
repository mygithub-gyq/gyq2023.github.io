// XMLHttpRequest对象
XMLHttpRequest = function XMLHttpRequest(){}
ldvm.toolsFunc.safeProto(XMLHttpRequest,"XMLHttpRequest");
Object.setPrototypeOf(XMLHttpRequest.prototype,XMLHttpRequestEventTarget.prototype);
ldvm.toolsFunc.defineProperty(XMLHttpRequest,"UNSENT",{configurable:false,enumerable:true, writable:false, value:0});
ldvm.toolsFunc.defineProperty(XMLHttpRequest,"OPENED",{configurable:false,enumerable:true, writable:false, value:1});
ldvm.toolsFunc.defineProperty(XMLHttpRequest,"HEADERS_RECEIVED",{configurable:false,enumerable:true, writable:false, value:2});
ldvm.toolsFunc.defineProperty(XMLHttpRequest,"LOADING",{configurable:false,enumerable:true, writable:false, value:3});
ldvm.toolsFunc.defineProperty(XMLHttpRequest,"DONE",{configurable:false,enumerable:true, writable:false, value:4});
ldvm.toolsFunc.defineProperty(XMLHttpRequest.prototype,"onreadystatechange",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,XMLHttpRequest.prototype,"XMLHttpRequest","onreadystatechange_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,XMLHttpRequest.prototype,"XMLHttpRequest","onreadystatechange_set",arguments)}});
ldvm.toolsFunc.defineProperty(XMLHttpRequest.prototype,"readyState",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,XMLHttpRequest.prototype,"XMLHttpRequest","readyState_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(XMLHttpRequest.prototype,"timeout",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,XMLHttpRequest.prototype,"XMLHttpRequest","timeout_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,XMLHttpRequest.prototype,"XMLHttpRequest","timeout_set",arguments)}});
ldvm.toolsFunc.defineProperty(XMLHttpRequest.prototype,"withCredentials",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,XMLHttpRequest.prototype,"XMLHttpRequest","withCredentials_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,XMLHttpRequest.prototype,"XMLHttpRequest","withCredentials_set",arguments)}});
ldvm.toolsFunc.defineProperty(XMLHttpRequest.prototype,"upload",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,XMLHttpRequest.prototype,"XMLHttpRequest","upload_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(XMLHttpRequest.prototype,"responseURL",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,XMLHttpRequest.prototype,"XMLHttpRequest","responseURL_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(XMLHttpRequest.prototype,"status",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,XMLHttpRequest.prototype,"XMLHttpRequest","status_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(XMLHttpRequest.prototype,"statusText",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,XMLHttpRequest.prototype,"XMLHttpRequest","statusText_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(XMLHttpRequest.prototype,"responseType",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,XMLHttpRequest.prototype,"XMLHttpRequest","responseType_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,XMLHttpRequest.prototype,"XMLHttpRequest","responseType_set",arguments)}});
ldvm.toolsFunc.defineProperty(XMLHttpRequest.prototype,"response",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,XMLHttpRequest.prototype,"XMLHttpRequest","response_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(XMLHttpRequest.prototype,"responseText",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,XMLHttpRequest.prototype,"XMLHttpRequest","responseText_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(XMLHttpRequest.prototype,"responseXML",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,XMLHttpRequest.prototype,"XMLHttpRequest","responseXML_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(XMLHttpRequest.prototype,"UNSENT",{configurable:false,enumerable:true, writable:false, value:0});
ldvm.toolsFunc.defineProperty(XMLHttpRequest.prototype,"OPENED",{configurable:false,enumerable:true, writable:false, value:1});
ldvm.toolsFunc.defineProperty(XMLHttpRequest.prototype,"HEADERS_RECEIVED",{configurable:false,enumerable:true, writable:false, value:2});
ldvm.toolsFunc.defineProperty(XMLHttpRequest.prototype,"LOADING",{configurable:false,enumerable:true, writable:false, value:3});
ldvm.toolsFunc.defineProperty(XMLHttpRequest.prototype,"DONE",{configurable:false,enumerable:true, writable:false, value:4});
ldvm.toolsFunc.defineProperty(XMLHttpRequest.prototype,"abort",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,XMLHttpRequest.prototype,"XMLHttpRequest","abort",arguments)}});
ldvm.toolsFunc.defineProperty(XMLHttpRequest.prototype,"getAllResponseHeaders",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,XMLHttpRequest.prototype,"XMLHttpRequest","getAllResponseHeaders",arguments)}});
ldvm.toolsFunc.defineProperty(XMLHttpRequest.prototype,"getResponseHeader",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,XMLHttpRequest.prototype,"XMLHttpRequest","getResponseHeader",arguments)}});
ldvm.toolsFunc.defineProperty(XMLHttpRequest.prototype,"open",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,XMLHttpRequest.prototype,"XMLHttpRequest","open",arguments)}});
ldvm.toolsFunc.defineProperty(XMLHttpRequest.prototype,"overrideMimeType",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,XMLHttpRequest.prototype,"XMLHttpRequest","overrideMimeType",arguments)}});
ldvm.toolsFunc.defineProperty(XMLHttpRequest.prototype,"send",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,XMLHttpRequest.prototype,"XMLHttpRequest","send",arguments)}});
ldvm.toolsFunc.defineProperty(XMLHttpRequest.prototype,"setRequestHeader",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,XMLHttpRequest.prototype,"XMLHttpRequest","setRequestHeader",arguments)}});
ldvm.toolsFunc.defineProperty(XMLHttpRequest.prototype,"setAttributionReporting",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,XMLHttpRequest.prototype,"XMLHttpRequest","setAttributionReporting",arguments)}});
ldvm.toolsFunc.defineProperty(XMLHttpRequest.prototype,"setPrivateToken",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,XMLHttpRequest.prototype,"XMLHttpRequest","setPrivateToken",arguments)}});
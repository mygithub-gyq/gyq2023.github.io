// 浏览器接口具体的实现

// ldvm.envFunc.EventTarget_addEventListener = function EventTarget_addEventListener(){
//
//     console.log(this===window);
//     console.log(arguments);
//     debugger;
//     return 666;
// }
!function (){
    ldvm.envFunc.Navigator_languages_get=function Navigator_languages_get(){
        return ['zh-CN', 'zh'];
    }
    ldvm.envFunc.Document_head_get=function Document_head_get(){
        return '';
    }
    ldvm.envFunc.Navigator_javaEnabled=function Navigator_javaEnabled(){
        return true;
    }
    // ldvm.envFunc.Document_head_get=function Document_head_get(){
    //     return ldvm.toolsFunc.getProtoArr.call(this,"head");
    // }
    // ldvm.envFunc.Document_getElementsByTagName_head=function Document_getElementsByTagName_head(){
    //     return '';
    // }
    ldvm.envFunc.Document_all_get=function Document_all_get(){
        let all=ldvm.memory.globalVar.all;
        Object.setPrototypeOf(all,HTMLAllCollection.prototype);
        return all;
    }
    ldvm.envFunc.Event_timeStamp_get=function Event_timeStamp_get(){
        return ldvm.toolsFunc.getProtoArr.call(this,"timeStamp");
    }
    ldvm.envFunc.MouseEvent_clientY_get=function MouseEvent_clientY_get(){
        return ldvm.toolsFunc.getProtoArr.call(this,"clientY");
    }
    ldvm.envFunc.MouseEvent_clientX_get=function MouseEvent_clientX_get(){
        return ldvm.toolsFunc.getProtoArr.call(this,"clientX");
    }
    // ldvm.envFunc.EventTarget_addEventListener=function EventTarget_addEventListener(){
    //     let type=arguments[0];
    //     let listener=arguments[1];
    //     let options=arguments[2];
    //
    //     let event={
    //         "self":this,
    //         "type":type,
    //         "listener":listener,
    //         "options":options
    //     }
    //     if(ldvm.memory.asyncEvent.listener===undefined){
    //         ldvm.memory.asyncEvent.listener={};
    //     }
    //     if(ldvm.memory.asyncEvent.listener[type]===undefined){
    //         ldvm.memory.asyncEvent.listener[type]=[];
    //     }
    //     ldvm.memory.asyncEvent.listener[type].push(event);
    // }
    ldvm.envFunc.BatteryManager_level_get=function BatteryManager_level_get(){
        return 1;
    }
    ldvm.envFunc.BatteryManager_chargingTime_get=function BatteryManager_chargingTime_get(){
        return 0;
    }
    ldvm.envFunc.BatteryManager_charging_get=function BatteryManager_charging_get(){
        return true;
    }
    ldvm.envFunc.Navigator_getBattery=function Navigator_getBattery(){
        let batteryManager={};
        batteryManager=ldvm.toolsFunc.createProxyObj(batteryManager,BatteryManager,"batteryManager");
        let obj={
            "then":function (callBack){
                let _callBack=callBack;
                callBack=function (){
                    return _callBack(batteryManager);
                }
            if(ldvm.memory.asyncEvent.promise===undefined){
                ldvm.memory.asyncEvent.promise=[];
            }
            ldvm.memory.asyncEvent.promise.push(callBack);
            }
        }
        return obj;
    }
    ldvm.envFunc.window_clearTimeout=function window_clearTimeout(){
        let timeouID=arguments[0];
        for(let i=0;i<ldvm.memory.asyncEvent.setTimeout.length;i++){
            let event=ldvm.memory.asyncEvent.setTimeout[i];
            if(event.timeoutID===timeouID){
                delete ldvm.memory.asyncEvent.setTimeout[i];
            }
        }
    }
    ldvm.envFunc.window_setTimeout=function window_setTimeout(){
        let func=arguments[0];
        let delay=arguments[1] || 0;
        let length=arguments.length;
        let args=[];
        for(let i=2;i<length;i++){
            args.push(arguments[i]);
        }
        let type=1;
        if(typeof func!=="function"){
            type=0;
        }
        ldvm.memory.globalVar.timeoutID+=1;
        let event={
            "callback":func,
            "delay":delay,
            "args":args,
            "type":type,
            "timeoutID":ldvm.memory.globalVar.timeoutID
        }
        if(ldvm.memory.asyncEvent.setTimeout===undefined){
            ldvm.memory.asyncEvent.setTimeout=[];
        }
        ldvm.memory.asyncEvent.setTimeout.push(event);
        return ldvm.memory.globalVar.timeoutID;
    }
    ldvm.envFunc.XMLHttpRequest_open=function XMLHttpRequest_open(){
        // 浏览器接口函数,xmlopen改写了
        let method=arguments[0];
        let url=arguments[1];
        return url;
    }
    ldvm.envFunc.HTMLElement_offsetHeight_get=function HTMLElement_offsetHeight_get(){
        let fontFamily=this.style.fontFamily;
        if(ldvm.memory.globalVar.fontList.indexOf(fontFamily)!==-1){//能够识别的字体
            return 666;
        }else{
            return 999;
        }
    }
    ldvm.envFunc.HTMLElement_offsetWidth_get=function HTMLElement_offsetWidth_get(){
        let fontFamily=this.style.fontFamily;
        if(ldvm.memory.globalVar.fontList.indexOf(fontFamily)!==-1){//能够识别的字体
            return 1666;
        }else{
            return 1999;
        }
    }
    ldvm.envFunc.Element_children_get=function Element_children_get(){
        return ldvm.toolsFunc.getProtoArr.call(this,"children");
    }
    ldvm.envFunc.Node_appendChild=function Node_appendChild(){
        let tag=arguments[0];
        let collection=[];
        collection.push(tag);
        collection=ldvm.toolsFunc.createProxyObj(collection,HTMLCollection,"collection");
        ldvm.toolsFunc.setProtoArr.call(this,"children",collection);
        return tag;
    }
    ldvm.envFunc.Document_body_get=function Document_body_get(){
        let collection=ldvm.toolsFunc.getCollection('[object HTMLBodyElement]');
        return collection[0];
    }
    ldvm.envFunc.Element_innerHTML_set=function Element_innerHTML_set(){
        let htmlStr=arguments[0];
        // 通用解析法,自己写一个,很难

        let style={
            "font-family":"mmll",
            "font-size":"160px",
            "fontFamily":"mmll"
        };
        style=ldvm.toolsFunc.createProxyObj(style,CSSStyleDeclaration,"style");
        let tagJson={
            "type":"span",
            "prop":{
                "lang":"zh",
                "style":style,
                "textContent":"fontTest"
            }
        }
        let span=document.createElement(tagJson["type"]);
        for(const key in tagJson["prop"]){
            ldvm.toolsFunc.setProtoArr.call(span,key,tagJson["type"][key]);
        }
        let collection=[];
        collection.push(span);
        collection=ldvm.toolsFunc.createProxyObj(collection,HTMLCollection,"collection");
        ldvm.toolsFunc.setProtoArr.call(this,"children",collection);
    }
    ldvm.envFunc.WebGLRenderingContext_canvas_get=function WebGLRenderingContext_canvas_get(){
        return ldvm.toolsFunc.getProtoArr.call(this,"canvas");
    }
    ldvm.envFunc.WebGLRenderingContext_createProgram=function WebGLRenderingContext_createProgram(){
        let program={};
        program=ldvm.toolsFunc.createProxyObj(program,WebGLProgram,"program");
        return program;
    }
    ldvm.envFunc.WebGLRenderingContext_createBuffer=function WebGLRenderingContext_createBuffer(){
        let buffer={};
        buffer=ldvm.toolsFunc.createProxyObj(buffer,WebGLBuffer,"buffer");
        return buffer;
    }
    ldvm.envFunc.HTMLCanvasElement_toDataURL=function HTMLCanvasElement_toDataURL(){
        // 返回base64形式的图片
        let type=ldvm.toolsFunc.getProtoArr.call(this,"type");
        if(type==="2d"){
            return ldvm.memory.globalVar.canvas_2d;
        }else if(type==="webgl"){
            return ldvm.memory.globalVar.canvas_webgl;
        }
    }
    ldvm.envFunc.HTMLCanvasElement_getContext=function HTMLCanvasElement_getContext(){
        let type=arguments[0];
        let context={};
        switch (type) {
            case "2d":
                context=ldvm.toolsFunc.createProxyObj(context,CanvasRenderingContext2D,"context_2d");
                ldvm.toolsFunc.setProtoArr.call(context,"canvas",this);
                ldvm.toolsFunc.setProtoArr.call(this,"type",type);
                break;
            case "webgl":
                context=ldvm.toolsFunc.createProxyObj(context,WebGLRenderingContext,"context_webgl");
                ldvm.toolsFunc.setProtoArr.call(context,"canvas",this);
                ldvm.toolsFunc.setProtoArr.call(this,"type",type);
                break;
            default:
                console.log(`HTMLCanvasElement_getContext_${type}未实现`);
                break;
        }
        return context;
    }
    ldvm.envFunc.HTMLElement_style_get=function HTMLElement_style_get(){
        let style=ldvm.toolsFunc.getProtoArr.call(this,"style");
        if(style===undefined){
            style=ldvm.toolsFunc.createProxyObj({},CSSStyleDeclaration,"style");
        }
        return style;
    }
    ldvm.envFunc.HTMLCanvasElement_height_set=function HTMLCanvasElement_height_set(){

    }
    ldvm.envFunc.HTMLCanvasElement_width_set=function HTMLCanvasElement_width_set(){

    }
    ldvm.envFunc.MimeTypeArray_item=function MimeTypeArray_item(){
        let index=arguments[0];
        return this[index];
    }
    ldvm.envFunc.MimeTypeArray_namedItem=function MimeTypeArray_namedItem(){
        let name=arguments[0];
        return this[name];
    }
    ldvm.envFunc.Plugin_item=function Plugin_item(){
        let index=arguments[0];
        return this[index];
    }
    ldvm.envFunc.Plugin_namedItem=function Plugin_namedItem(){
        let name=arguments[0];
        return this[name];
    }
    ldvm.envFunc.PluginArray_namedItem=function PluginArray_namedItem(){
        let name=arguments[0];
        return this[name];
    }
    ldvm.envFunc.PluginArray_item=function PluginArray_item(){
        let index=arguments[0];
        return this[index];
    }
    ldvm.envFunc.Navigator_mimeTypes_get=function Navigator_mimeTypes_get(){
        return ldvm.memory.globalVar.mimeTypeArray;
    }
    ldvm.envFunc.Plugin_name_get=function Plugin_name_get(){
        return ldvm.toolsFunc.getProtoArr.call(this,"name");
    }
    ldvm.envFunc.PluginArray_length_get=function PluginArray_length_get(){
        return ldvm.toolsFunc.getProtoArr.call(this,"length");
    }
    ldvm.envFunc.MimeType_type_get=function MimeType_type_get(){
        return ldvm.toolsFunc.getProtoArr.call(this,"type");
    }
    ldvm.envFunc.MimeTypeArray_length_get=function MimeTypeArray_length_get(){
        return ldvm.toolsFunc.getProtoArr.call(this,"length");
    }
    ldvm.envFunc.Navigator_plugins_get=function Navigator_plugins_get(){
        return ldvm.memory.globalVar.pluginArray;
    }
    ldvm.envFunc.HTMLAnchorElement_hash_get=function HTMLAnchorElement_hash_get(){
        return ldvm.toolsFunc.getProtoArr.call(this,"hash")
    }
    ldvm.envFunc.HTMLAnchorElement_origin_get=function HTMLAnchorElement_origin_get(){
        return ldvm.toolsFunc.getProtoArr.call(this,"origin")
    }
    ldvm.envFunc.HTMLAnchorElement_search_get=function HTMLAnchorElement_search_get(){
        return ldvm.toolsFunc.getProtoArr.call(this,"search")
    }
    ldvm.envFunc.HTMLAnchorElement_hostname_get=function HTMLAnchorElement_hostname_get(){
        return ldvm.toolsFunc.getProtoArr.call(this,"hostname")
    }
    ldvm.envFunc.HTMLAnchorElement_protocol_get=function HTMLAnchorElement_protocol_get(){
        return ldvm.toolsFunc.getProtoArr.call(this,"protocol")
    }
    ldvm.envFunc.HTMLAnchorElement_href_get=function HTMLAnchorElement_href_get(){
        return ldvm.toolsFunc.getProtoArr.call(this,"href")

    }
    ldvm.envFunc.HTMLAnchorElement_href_set=function HTMLAnchorElement_href_set(){
        let url=arguments[0];
        if(url.indexOf("http")===-1){
            url=location.protocol+"//"+location.hostname+url;
        }
        let jsonUrl=ldvm.toolsFunc.parseUrl(url);

        ldvm.toolsFunc.setProtoArr.call(this,"origin",jsonUrl["origin"]);
        ldvm.toolsFunc.setProtoArr.call(this,"protocol",jsonUrl["protocol"]);
        ldvm.toolsFunc.setProtoArr.call(this,"host",jsonUrl["host"]);
        ldvm.toolsFunc.setProtoArr.call(this,"hostname",jsonUrl["hostname"]);
        ldvm.toolsFunc.setProtoArr.call(this,"port",jsonUrl["port"]);
        ldvm.toolsFunc.setProtoArr.call(this,"pathname",jsonUrl["pathname"]);
        ldvm.toolsFunc.setProtoArr.call(this,"search",jsonUrl["search"]);
        ldvm.toolsFunc.setProtoArr.call(this,"hash",jsonUrl["hash"]);
        ldvm.toolsFunc.setProtoArr.call(this,"href",jsonUrl["href"]);
    }
    ldvm.envFunc.location_hostname_set=function location_hostname_set(){
        let value=arguments[0];
        return ldvm.toolsFunc.setProtoArr.call(this,"hostname",value);
    }
    ldvm.envFunc.location_hostname_get=function location_hostname_get(){
        return ldvm.toolsFunc.getProtoArr.call(this,"hostname");
    }
    ldvm.envFunc.location_protocol_set=function location_protocol_set(){
        let value=arguments[0];
        return ldvm.toolsFunc.setProtoArr.call(this,"protocol",value);
    }
    ldvm.envFunc.location_protocol_get=function location_protocol_get(){
        return ldvm.toolsFunc.getProtoArr.call(this,"protocol");
    }
    ldvm.envFunc.HTMLInputElement_name_set=function HTMLInputElement_name_set(){
        let value=arguments[0];
        return ldvm.toolsFunc.setProtoArr.call(this,"name",value);
    }
    ldvm.envFunc.HTMLInputElement_name_get=function HTMLInputElement_name_get(){
        return ldvm.toolsFunc.getProtoArr.call(this,"name");
    }
    ldvm.envFunc.HTMLInputElement_value_set=function HTMLInputElement_value_set(){
        let value=arguments[0];
        return ldvm.toolsFunc.setProtoArr.call(this,"value",value);
    }
    ldvm.envFunc.HTMLInputElement_value_get=function HTMLInputElement_value_get(){
        return ldvm.toolsFunc.getProtoArr.call(this,"value");
    }
    ldvm.envFunc.Element_id_set=function Element_id_set(){
        let value=arguments[0];
        return ldvm.toolsFunc.setProtoArr.call(this,"id",value);
    }
    ldvm.envFunc.Element_id_get=function Element_id_get(){
        return ldvm.toolsFunc.getProtoArr.call(this,"id");
    }
    ldvm.envFunc.Node_removeChild=function Node_removeChild(){

    }
    ldvm.envFunc.HTMLInputElement_type_set=function HTMLInputElement_type_set(){
        let value=arguments[0];
        return ldvm.toolsFunc.setProtoArr.call(this,"type",value);
    }
    ldvm.envFunc.HTMLInputElement_type_get=function HTMLInputElement_type_get(){
        return ldvm.toolsFunc.getProtoArr.call(this,"type");
    }
    ldvm.envFunc.Document_write=function Document_write(){
        let tagStr=arguments[0];
        // 解析标签字符串
        let tagJson=ldvm.toolsFunc.getTagJson(tagStr);
        let tag=document.createElement(tagJson.type);
        for(const key in tagJson.prop){
            tag[key]=tagJson.prop[key];
            if(tag[key]===undefined){
                ldvm.toolsFunc.setProtoArr.call(tag,key,tagJson.prop[key]);
            }
        }
    }
    ldvm.envFunc.Node_parentNode_get=function Node_parentNode_get(){
        return ldvm.toolsFunc.getProtoArr.call(this,"parentNode");
    }
    ldvm.envFunc.HTMLMetaElement_content_get=function HTMLMetaElement_content_get(){
        return ldvm.toolsFunc.getProtoArr.call(this,"content");
    }
    ldvm.envFunc.HTMLMetaElement_content_set=function HTMLMetaElement_content_set(){
        let value=arguments[0];
        return ldvm.toolsFunc.setProtoArr.call(this,"content",value);
    }
    ldvm.envFunc.HTMLDivElement_align_get=function HTMLDivElement_align_get(){
        return ldvm.toolsFunc.getProtoArr.call(this,"align");
    }
    ldvm.envFunc.HTMLDivElement_align_set=function HTMLDivElement_align_set(){
        let value=arguments[0];
        return ldvm.toolsFunc.setProtoArr.call(this,"align",value);
    }
    ldvm.envFunc.Storage_setItem = function Storage_setItem(){
        let keyName=arguments[0];
        let keyValue=arguments[1];
        this[keyName]=keyValue;
    }
    ldvm.envFunc.Storage_getItem = function Storage_getItem(){
        let key=arguments[0];
        if(key in this){
            return this[key]
        }
        return null;
    }
    ldvm.envFunc.Storage_removeItem = function Storage_removeItem(){
        let key=arguments[0];
        delete this[key];
    }
    ldvm.envFunc.Storage_key = function Storage_key(){
        let index=arguments[0];
        let i=0;
        for(const key in this){
            if(i===index){
                return key;
            }
            i++;
        }
        return null;
    }
    ldvm.envFunc.Storage_clear = function Storage_clear(){
        for(const key in this){
            delete this[key];
        }
    }
    ldvm.envFunc.Storage_length_get = function Storage_length_get(){
        let i=0;
        for(const key in Object.getOwnPropertyDescriptors(this)){
            i++;
        }
        return i;
    }
    ldvm.envFunc.Document_createElement=function Document_createElement(){
        let tagName=arguments[0].toLowerCase();
        let options=arguments[1];
        let tag={};
        switch (tagName){
            case "div":
                tag=ldvm.toolsFunc.createProxyObj(tag,HTMLDivElement,`Document_createElement_${tagName}`);
                ldvm.memory.tag.push(tag);
                break
            case "meta":
                tag=ldvm.toolsFunc.createProxyObj(tag,HTMLMetaElement,`Document_createElement_${tagName}`);
                ldvm.memory.tag.push(tag);
                break
            case "head":
                tag=ldvm.toolsFunc.createProxyObj(tag,HTMLHeadElement,`Document_createElement_${tagName}`);
                ldvm.memory.tag.push(tag);
                break
            case "input":
                tag=ldvm.toolsFunc.createProxyObj(tag,HTMLInputElement,`Document_createElement_${tagName}`);
                ldvm.memory.tag.push(tag);
                break
            case "a":
                tag=ldvm.toolsFunc.createProxyObj(tag,HTMLAnchorElement,`Document_createElement_${tagName}`);
                ldvm.memory.tag.push(tag);
                break
            case "canvas":
                tag=ldvm.toolsFunc.createProxyObj(tag,HTMLCanvasElement,`Document_createElement_${tagName}`);
                ldvm.memory.tag.push(tag);
                break
            case "body":
                tag=ldvm.toolsFunc.createProxyObj(tag,HTMLBodyElement,`Document_createElement_${tagName}`);
                ldvm.memory.tag.push(tag);
                break
            case "span":
                tag=ldvm.toolsFunc.createProxyObj(tag,HTMLSpanElement,`Document_createElement_${tagName}`);
                ldvm.memory.tag.push(tag);
                break
            // ....接着写别的标签
            default:
                console.log(`Document_createElement_${tagName}未实现`);
                break;
        }
        return tag;
    }
    ldvm.envFunc.Document_getElementById=function Document_getElementById(){
        let id =arguments[0];
        let tags=ldvm.memory.tag;
        for(let i=0;i<tags.length;i++){
            if(tags[i].id===id){
                return tags[i];
            }
        }
        return null;
    }
    ldvm.envFunc.Document_getElementsByTagName=function Document_getElementsByTagName(){
        let tagName=arguments[0].toLowerCase();
        let collection=[];
        switch (tagName){
            case "meta":
                collection=ldvm.toolsFunc.getCollection('[object HTMLMetaElement]');
                collection=ldvm.toolsFunc.createProxyObj(collection,HTMLCollection,`Document_getElementsByTagName_${tagName}`)
                break;
            case "head":
                return '';
            default:
                console.log(`Document_getElementsByTagName_${tagName}未实现`);
                break;
        }
        return collection;
    }
    ldvm.envFunc.Document_cookie_get=function Document_cookie_get(){
        let cookieJson=ldvm.memory.globalVar.cookieJson;
        let tempCookie="";
        for(const key in cookieJson){
            if(key===""){
                tempCookie+=`${cookieJson[key]}; `;
            }else{
                tempCookie+=`${key}=${cookieJson[key]}; `;
            }
        }
        return tempCookie;
    }
    ldvm.envFunc.Document_cookie_set=function Document_cookie_set(){
        let cookieValue=arguments[0];
        let index=cookieValue.indexOf(";");
        if(index!==-1){
            cookieValue=cookieValue.substring(0,index)
        }
        if(cookieValue.indexOf("=")===-1){
            ldvm.memory.globalVar.cookieJson[""]=cookieValue.trim();
        }else{
            let item=cookieValue.split("=");
            let key=item[0];
            let val=item[1];
            ldvm.memory.globalVar.cookieJson[key]=val;
        }
    }
    ldvm.envFunc.document_location_get=function document_location_get(){
        return location;
    }
    ldvm.envFunc.window_top_get=function window_top_get(){
        return window;
    }
    ldvm.envFunc.window_self_get=function window_self_get(){
        return window;
    }

}();
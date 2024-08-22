// 全局变量初始化
!function (){
    let onEnter=function (obj){
        try{
           ldvm.toolsFunc.printLog(obj.args);
        }catch (e){}
    }
    console.log = ldvm.toolsFunc.hook(
        console.log,
        undefined,
        false,
        onEnter,
        function (){},
        ldvm.config.print
    );
    ldvm.toolsFunc.createPlugin({
            "description":"Portable Document Format",
            "filename":"internal-pdf-viewer",
            "name":"PDF Viewer",
            "mimeTypes":[{
                "type":'application/pdf',
                "suffixes":'pdf',
                "description":'Portable Document Format'
            },{
                "type":'text/pdf',
                "suffixes":'pdf',
                "description":'Portable Document Format'
            }]
        });
    ldvm.toolsFunc.createPlugin({
            'description':"Portable Document Format",
            'filename': "internal-pdf-viewer",
            'name':"Chrome PDF Viewer",
            'mimeTypes':[{
                'type':'application/pdf',
                'suffixes':'pdf',
                'description':'Portable Document Format'
            },{
                'type':'text/pdf',
                'suffixes':'pdf',
                'description':'Portable Document Format'
            }]
        });
    ldvm.toolsFunc.createPlugin({
            'description':"Portable Document Format",
            'filename': "internal-pdf-viewer",
            'name':"Chromium PDF Viewer",
            'mimeTypes':[{
                'type':'application/pdf',
                'suffixes':'pdf',
                'description':'Portable Document Format'
            },{
                'type':'text/pdf',
                'suffixes':'pdf',
                'description':'Portable Document Format'
            }]
        });
    ldvm.toolsFunc.createPlugin({
            'description':"Portable Document Format",
            'filename': "internal-pdf-viewer",
            'name':"Microsoft Edge PDF Viewer",
            'mimeTypes':[{
                'type':'application/pdf',
                'suffixes':'pdf',
                'description':'Portable Document Format'
            },{
                'type':'text/pdf',
                'suffixes':'pdf',
                'description':'Portable Document Format'
            }]
        });
    ldvm.toolsFunc.createPlugin({
            'description':"Portable Document Format",
            'filename': "internal-pdf-viewer",
            'name':"WebKit built-in PDF",
            'mimeTypes':[{
                'type':'application/pdf',
                'suffixes':'pdf',
                'description':'Portable Document Format'
            },{
                'type':'text/pdf',
                'suffixes':'pdf',
                'description':'Portable Document Format'
            }]
        });
}();
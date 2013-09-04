var fs = require('fs'),
    cheerio = require('cheerio'),
    http = require('http'),
    querystring = require('querystring');

module.exports = {
    save: save,
    getPage : getPage,
    getAlbum : getAlbum
};

var pageId = '';

function save(list){
	list.forEach(function(r){

		var uid = r.split('/')[1];
		var pid = r.split('/')[3];
		//console.log('/ajaxgetphoto.do?owner=' + uid + '&id=' + pid +'&requestToken=230339918&_rtk=d97bb3a8')
		//http参数对象
		var post_data = querystring.stringify({
			owner : pageId,
			id : pid,
			curpage : 1
		});

		var options = {
		    host:'page.renren.com',
		    port:80,
		    method:'POST',
		    path:'/ajaxgetphoto.do?curpage=1&owner=' + pageId + '&albumId=' + pid,
		    headers: {
			    'X-Requested-With':'XMLHttpRequest',
			    'Content-Type':'application/x-www-form-urlencoded',
			    'Content-Length': post_data.length
			}
		};		

		var html = '';//http获取html字符串

		//fs.mkdirSync('photo', 0755);

		var req = http.request(options, function(res){
		    res.on('data', function (chunk) {
		      html += chunk;
		    }).on('end',function(){
		    	var object = JSON.parse(html) ;
                if(object.photo){
                    if(object.photo.large){
                        var url = object.photo.large ;              
                        savekImageFile(url,pid);
                    }
                }		    	       
		    })
		  });
		req.write(post_data+ '\n');
		
		req.on('error', function (err) {
		    console.log('error');
		});

		req.end();
	})
}

function savekImageFile(picUrl,name) {
    var hostName = picUrl.split('/')[2];
    var path = picUrl.substring(picUrl.indexOf(hostName) + hostName.length);

    var options = {
        host:hostName,
        port:80,
        path:path
    };

    http.get(options, function (res) {
        res.setEncoding('binary');
        var imageData = '';

        res.on('data', function (data) {//图片加载到内存变量
            imageData += data;
        }).on('end', function () {//加载完毕保存图片
    		fs.writeFile('./photo/'+name+'.png', imageData, 'binary', function (err) {
            	if (err) throw err;
        	});
        });
    });
}

function getAlbum(url){
	var options = {
	    host:'page.renren.com',
	    port:80,
	    path:url.replace('http://page.renren.com','')
	};

    console.log(options.path);

    if(pageId == '')
        pageId = options.path.split('/')[1];

    console.log(pageId);

    var albumList = [];
	var html = '';

	var req = http.request(options, function(res){
    	res.on('data', function (chunk) {
        	html += chunk;
        }).on('end',function(){
            var $ = cheerio.load(html);
            var photoDom = $('.picitem a');
            var pageIndex = $('.pager-top .chn');
            $('.picitem a').each(function(){
            	albumList.push($(this).attr('href'));
            	});
           	console.log(albumList);
            for (var i = 0, len = albumList.length; i < len ; i++){
                getPage(albumList[i] + '?curpage=0');
            	};
            if(pageIndex.eq(pageIndex.length-1).attr('title') == '下一页'||pageIndex.eq(pageIndex.length-2).attr('title') == '下一页'){
                var index = url.split('=')[1];
                index = +index + 1;
                url = url.substr(0,url.length - 1) + index;
                getAlbum(url);
                }
            })
            
        });

    req.on('error', function (err) {
       console.log('error');
    });

    req.end();

}

function getPage(url){
	var photoList = [];

	//http参数对象
	var options = {
	    host:'page.renren.com',
	    port:80,
	    path:url
	};

    console.log(options.path);
    var html = '';//http获取html字符串
    var req = http.request(options, function(res){
    	res.on('data', function (chunk) {
        	html += chunk;
        }).on('end',function(){
            var $ = cheerio.load(html);
            var photoDom = $('.photoPan a');
            var len = photoDom.length;
            var pageIndex = $('.pager-top .chn');
            for (var i = 0; i < len ; i++) {
                photoList.push(photoDom.eq(i).attr('href'));
            };
            save(photoList);
            console.log(pageIndex.length);
            if( pageIndex.eq(pageIndex.length-1).attr('title') == '下一页' ){
                var index = options.path.split('=')[1];
                index = +index + 1;
                options.path = options.path.substr(0,options.path.length - 1) + index;
                getPage(options.path);
            }
            else{
                console.log('over');
            }

            })
        });

    req.on('error', function (err) {
       console.log('error');
    });

    req.end();    
}
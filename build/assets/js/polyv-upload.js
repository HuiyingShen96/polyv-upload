/**
 *  上传参数options：
 *  sign: 根据将secretkey和13位的毫秒级时间戳按照顺序拼凑起来的字符串进行MD5计算得到的值
 *  userid: 
 *  hash: 根据将13位的毫秒级时间戳和writeToken按照顺序拼凑起来的字符串进行MD5计算得到的值
 *  ts
 *  cataid: 上传目录id
 *  luping(optional): 开启视频课件优化处理，对于上传录屏类视频清晰度有所优化；
 *  extra(optional): 
 *  {
 *      state, // 自定义参数，可以通过回调通知接口抓取到该字段
 *      keepsource, // 源文件播放（不对源文件进行编码）
 *  }
 *  response(optional): function，返回指定视频的信息时的回调函数
 *  
 *  方法：
 *  update(data): 用于更新ts、hash、sign3个信息
 *  closeWrap(): 关闭插件
 **/
function PolyvUpload(options) {
    this.param = {
        sign: options.sign,
        userid: options.userid,
        hash: options.hash,
        ts: options.ts,
        url: location.href,
        cataid: options.cataid,
        luping: (options.luping || '0') + '',
        extra: JSON.stringify(options.extra || {}),
    };
    this.uploadButton = document.getElementById(options.uploadButtton);
    this.url = 'http://localhost:9090';
    // this.url = 'http://localhost:8088/build/index.html';
    // this.url = 'http://localhost:8088/upload-webpack-react/build/index.html';
    this._init();
    if (options.response !== undefined) {
        this._handleMsgReceive(options.response);
    }
}
PolyvUpload.prototype = {
    constructor: PolyvUpload,
    _addHander: function(ele, type, handler) {
        if (ele.addEventListener) {
            ele.addEventListener(type, handler, false);
        } else if (ele.attachEvent) {
            ele.attachEvent('on' + type, handler);
        } else {
            ele['on' + type] = handler;
        }
    },

    _init: function() {
        var self = this;

        // Build the iframe
        var wrapAll = document.createElement('div'),
            wrap = document.createElement('div'),
            frameWrap = document.createElement('div'),
            cancle = document.createElement('span'),
            iframe = document.createElement('iframe');
        wrapAll.setAttribute('id', 'polyv-wrapAll');
        wrapAll.style.display = 'none';
        wrap.style.cssText = 'display: block;position: fixed;left: 0;top: 0;width: 100%;height: 100%;z-index: 1001;background-color: #000;-moz-opacity: 0.5;opacity: .50;filter: alpha(opacity=50);';
        frameWrap.style.cssText = 'display: block;position: fixed;left: 50%;top: 50%;width: 1000px;height: 600px;margin-top: -300px;margin-left: -500px;z-index: 1002;box-shadow: 0 0 25px rgba(0,0,0,0.7);border-radius: 10px;';
        cancle.innerHTML = 'x';
        cancle.style.cssText = 'width: 26px;height: 26px;position: absolute;top: 0px;right: 0px;cursor: pointer;background: #eee;text-align: center;line-height: 26px;color: #666;font-size: 16px;font-family: microsoft yahei;border-radius: 0 10px 0 0;';
        iframe.setAttribute('src', this.url);
        iframe.setAttribute('id', 'polyv-iframe');
        iframe.setAttribute('width', '1000');
        iframe.setAttribute('height', '600');
        iframe.style.cssText = 'width: 100%;height: 100%;z-index: 1002;border:none;border-radius: 10px;background-color: #fff;';
        frameWrap.appendChild(iframe);
        frameWrap.appendChild(cancle);
        wrapAll.appendChild(wrap);
        wrapAll.appendChild(frameWrap);
        document.getElementsByTagName('body')[0].appendChild(wrapAll);

        // 
        var polyvFrame = document.getElementById('polyv-iframe');
        this.frameMsg = polyvFrame.contentWindow;
        polyvFrame.onload = polyvFrame.onreadystatechange = function() {
            if (this.readyState && this.readyState !== 'complete') {
                return;
            } else {
                self.update();
            }
        };

        // Controls whether to display iframe
        cancle.onclick = function() {
            wrapAll.style.display = 'none';
        };
        this._addHander(this.uploadButton, 'click', function() {
            wrapAll.style.display = 'block';
        });
    },

    _handleMsgReceive: function(callbackFunc) {
        this._addHander(window, 'message', function(event) {
            callbackFunc(JSON.parse(event.data));
        });
    },

    update: function() {
        // Update user information regularly
        if (typeof arguments[0] === 'object') {
            for (var i in arguments[0]) {
                if (arguments[0].hasOwnProperty(i)) {
                    this.param[i] = arguments[0][i];
                }
            }
        }
        this.frameMsg.postMessage(JSON.stringify(this.param), this.url);
    },

    closeWrap: function() {
        document.getElementById('polyv-wrapAll').style.display = 'none';
    }
};

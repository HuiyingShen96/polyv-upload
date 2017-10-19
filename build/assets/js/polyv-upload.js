/**
 * 用于向用户提供接口
 * @param {object} options 用户可以自行设置的参数
 */
function PolyvUpload(options) {
    this.options = {
        sign: options.sign,
        userid: options.userid,
        hash: options.hash,
        ts: options.ts,
        url: location.href,
        cataid: options.cataid,
        luping: (options.luping || '0') + '',
        extra: JSON.stringify(options.extra || {}),
        source: 'polyv-upload',
        response: options.response,
        openWrap: options.openWrap,
        onCancle: options.onCancle,
        onClearQueue: options.onClearQueue,
        uploadSuccess: options.uploadSuccess,
        uploadFail: options.uploadFail,
        onSelect: options.onSelect,
        onUploadComplete: options.onUploadComplete,
        onUploadProgress: options.onUploadProgress,
        onUploadStart: options.onUploadStart,
    };
    this.uploadButton = document.getElementById(options.uploadButtton);

    // 默认使用HTML5方式上传
    this.url = 'http://localhost:9090';
    // this.url = 'http://localhost:8088/upload-webpack-react/build/index.html';

    this._init();
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
    _checkH5Support: function() {
        var input = document.createElement('input');
        var fileSupport = !!(window.File && window.FileList);
        var xhr = new XMLHttpRequest();
        var fd = !!window.FormData;
        return 'multiple' in input && fileSupport && 'onprogress' in xhr && 'upload' in xhr && fd;
    },

    _init: function() {
        var self = this;

        if (!this._checkH5Support()) { // 不支持HTML5新特性时使用flash上传
            this.url = '//v.polyv.net/file/plug-in2/index.html';
        }

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
        cancle.innerHTML = '&times;';
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
            self.openWrap();
        });

        this._handleMsgReceive();
    },

    _handleMsgReceive: function() {
        var self = this;
        this._addHander(window, 'message', function(event) {
            var msgData = JSON.parse(event.data);
            switch (msgData.type) {
                case 'VIDEO_INFO':
                    if (typeof self.options.response === 'function') {
                        self.options.response(msgData.data);
                    }
                    break;
                case 'CLEAR_QUEUE':
                    if (typeof self.options.onClearQueue === 'function') {
                        self.options.onClearQueue(msgData.data);
                    }
                    break;
                case 'QUEUE_COMPLETE':
                    if (typeof self.options.uploadSuccess === 'function') {
                        self.options.uploadSuccess(msgData.data);
                    }
                    break;
                case 'QUEUE_FAIL': // todo:
                    if (typeof self.options.uploadFail === 'function') {
                        self.options.uploadFail(msgData.data);
                    }
                    break;
                case 'FILE_CANCEL':
                    if (typeof self.options.onCancle === 'function') {
                        self.options.onCancle(msgData.data);
                    }
                    break;
                case 'FILE_SELECT':
                    if (typeof self.options.onSelect === 'function') {
                        self.options.onSelect(msgData.data);
                    }
                    break;
                case 'FILE_COMPLETE':
                    if (typeof self.options.onUploadComplete === 'function') {
                        self.options.onUploadComplete(msgData.data);
                    }
                    break;
                case 'FILE_FAIL':
                    if (typeof self.options.uploadFail === 'function') {
                        self.options.uploadFail(msgData.data);
                    }
                    break;
                case 'FILE_PROGRESS':
                    if (typeof self.options.onUploadProgress === 'function') {
                        var file = msgData.data.file,
                            percentage = msgData.data.percentage;
                        self.options.onUploadProgress(file, percentage);
                    }
                    break;
                case 'UPLOAD_START':
                    if (typeof self.options.onUploadStart === 'function') {
                        self.options.onUploadStart(msgData.data);
                    }
                    break;
                default:
                    break;
            }
        });
    },

    update: function() {
        // Update user information regularly
        if (typeof arguments[0] === 'object') {
            for (var i in arguments[0]) {
                if (arguments[0].hasOwnProperty(i)) {
                    this.options[i] = arguments[0][i];
                }
            }
        }
        this.frameMsg.postMessage(JSON.stringify(this.options), this.url);
    },

    openWrap: function() {
        this.options.openWrap && this.options.openWrap();
        document.getElementById('polyv-wrapAll').style.display = 'block';
    },
    closeWrap: function() {
        document.getElementById('polyv-wrapAll').style.display = 'none';
    }
};

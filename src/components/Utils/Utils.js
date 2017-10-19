export default class Utils {
    sendMsg({
        type,
        data,
        url
    }) {
        var msgData = {
            type: type,
            data: data,
        };
        if (!url) {
            url = '*';
        }
        window.parent.postMessage(JSON.stringify(msgData), url);
    }
    addHander(ele, type, handler) {
        if (ele.addEventListener) {
            ele.addEventListener(type, handler, false);
        } else if (ele.attachEvent) {
            ele.attachEvent(`on${type}`, handler);
        } else {
            ele[`on${type}`] = handler;
        }
    }
    param(a, traditional) {

        let rbracket = /\[\]$/;

        function buildParams(prefix, obj, traditional, add) {
            let name;

            if (Array.isArray(obj)) {

                // Serialize array item.
                obj.forEach((v, i) => {
                    if (traditional || rbracket.test(prefix)) {

                        // Treat each array item as a scalar.
                        add(prefix, v);

                    } else {

                        // Item is non-scalar (array or object), encode its numeric index.
                        buildParams(
                            prefix + '[' + (typeof v === 'object' && v !== null ? i : '') + ']',
                            v,
                            traditional,
                            add
                        );
                    }
                });

            } else if (!traditional && typeof obj === 'object') {

                // Serialize object item.
                for (name in obj) {
                    buildParams(prefix + '[' + name + ']', obj[name], traditional, add);
                }

            } else {

                // Serialize scalar item.
                add(prefix, obj);
            }
        }


        var prefix,
            s = [],
            add = function(key, valueOrFunction) {

                // If value is a function, invoke it and use its return value
                var value = typeof valueOrFunction === 'function' ?
                    valueOrFunction() :
                    valueOrFunction;

                s[s.length] = encodeURIComponent(key) + '=' +
                    encodeURIComponent(value === null ? '' : value);
            };

        // If an array was passed in, assume that it is an array of form elements.
        if (Array.isArray(a) || (a.jquery && typeof a === 'object')) {

            // Serialize the form elements
            a.forEach((ele) => {
                add(ele.name, ele.value);
            });

        } else {

            // If traditional, encode the "old" way (the way 1.3.2 or older
            // did it), otherwise encode params recursively.
            for (prefix in a) {
                buildParams(prefix, a[prefix], traditional, add);
            }
        }

        // Return the resulting serialization
        return s.join('&');
        // let encodedString = '';
        // for (let prop in object) {
        //     if (object.hasOwnProperty(prop)) {
        //         // if (typeof object[prop] === 'object') {
        //         //     param
        //         // }
        //         encodedString += encodeURI(`&${prop}=${object[prop]}`);
        //     }
        // }
        // return encodedString.slice(1);
    }
    get({
        url,
        queryParams,
        headers,
        done,
        fail
    }) {
        if (queryParams) {
            let queryStr = this.param(queryParams);
            url += `?${queryStr}`;
        }

        let xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        if (headers) {
            for (let key in headers) {
                if (headers.hasOwnProperty(key)) {
                    xhr.setRequestHeader(key, headers[key]);
                }
            }
        }
        xhr.onload = function() {
            if (xhr.status === 200) {
                done(xhr.responseText);
            } else {
                fail(xhr.status);
            }
        };
    }
    post({
        url,
        queryParams,
        data,
        headers,
        done,
        fail
    }) {
        if (queryParams) {
            let queryStr = this.param(queryParams);
            url += `?${queryStr}`;
        }
        let dataStr = data ? this.param(data) : '';

        let xhr = new XMLHttpRequest();
        xhr.open('POST', url);
        if (headers) {
            for (let key in headers) {
                if (headers.hasOwnProperty(key)) {
                    xhr.setRequestHeader(key, headers[key]);
                }
            }
        }
        xhr.onreadystatechange = function() {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                switch (xhr.status) {
                    case 200:
                        done(xhr.responseText, xhr.status, xhr);
                        break;
                    case 201:
                        done(xhr.responseText, xhr.status, xhr);
                        break;
                    default:
                        fail(xhr.status, xhr);
                        break;
                }
            }
        };
        xhr.send(dataStr);
    }
    getJSON({
        url,
        data,
        done,
        fail
    }) {
        if (data) {
            let queryStr = this.param(data);
            url += `?${queryStr}`;
        }
        let xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    done(JSON.parse(xhr.responseText));
                } else {
                    fail(xhr.status);
                }
            }
        };
        xhr.send();
    }
    jsonp({
        url,
        data,
        done
    }) {
        if (data) {
            let queryStr = this.param(data);
            url += `?${queryStr}`;
        }

        let callbackName = 'jsonp_callback_' + Math.round(100000 * Math.random());
        window[callbackName] = function(data) {
            delete window[callbackName];
            document.body.removeChild(script);
            done(data);
        };

        let script = document.createElement('script');
        script.src = url + (url.indexOf('?') >= 0 ? '&' : '?') + 'callback=' + callbackName;
        document.body.appendChild(script);
    }
    uploadFile({
        url,
        data,
        queryParams,
        headers,
        done,
        fail
    }) {
        if (queryParams) {
            let queryStr = this.param(queryParams);
            url += `?${queryStr}`;
        }
        let xhr = new XMLHttpRequest();
        let fd = new FormData();
        for (let key in data) {
            if (data.hasOwnProperty(key)) {
                fd.append(key, data[key]);
            }
        }
        xhr.open('POST', url);
        if (headers) {
            for (let key in headers) {
                if (headers.hasOwnProperty(key)) {
                    xhr.setRequestHeader(key, headers[key]);
                }
            }
        }
        xhr.send(fd);
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                switch (xhr.status) {
                    case 200:
                        done(JSON.parse(xhr.responseText));
                        break;
                    case 201:
                        done(xhr.status, xhr);
                        break;
                    default:
                        fail(xhr.status, xhr);
                        break;
                }
            }
        };
    }

    head({
        url,
        cache,
        done,
        fail
    }) {
        console.log('head!!!');

        let xhr = new XMLHttpRequest();

        xhr.open('HEAD', url);
        // if (!cache) {
        //     xhr.setRequestHeader('Cache-Control', 'no-cache');
        // }
        xhr.send();
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    done(null, xhr.status, xhr);
                } else {
                    fail(xhr.status);
                }
            }
        };
    }
    transformSize(bytes) {
        let bt = parseInt(bytes);
        let result;
        if (bt === 0) {
            result = '0B';
        } else {
            let k = 1024;
            let sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
            let i = Math.floor(Math.log(bt) / Math.log(k));
            if (typeof i !== 'number') {
                result = '-';
            } else {
                result = (bt / Math.pow(k, i)).toFixed(2) + sizes[i];
            }
        }
        return result;
    }
    transformStatus(statusCode) {
        let status;
        switch (statusCode) {
            case '60':
                status = '已发布';
                break;
            case '61':
                status = '已发布';
                break;
            case '10':
                status = '等待编码';
                break;
            case '20':
                status = '正在编码';
                break;
            case '40':
                status = '编码失败';
                break;
            case '41':
                status = '已删除';
                break;
            case '50':
                status = '等待审核';
                break;
            case '51':
                status = '审核不通过';
                break;
            case '5':
                status = '上传中';
                break;
            default:
                status = '已删除';
        }
        return status;
    }

    uploadPic(file, options) {
        let ossClient = new OSS.Wrapper(options.stsInfo);
        ossClient.put(file.name, file)
            .then(function(res) {
                console.log('图片上传成功');
                console.log(res);
                // todo: 将地址传到后台给后台处理
            }).catch(function(err) {
                console.log(err);
            });
    }
}

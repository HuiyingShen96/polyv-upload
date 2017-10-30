import Utils from '../../components/Utils/Utils';
let utils = new Utils();

export default class ResumableUpload {
    constructor() {
        this.upload = this.upload.bind(this);
        this.fingerprint = this.fingerprint.bind(this);
        this.stop = this.stop.bind(this);
    }
    upload(file, options) {
        if (!file) {
            return;
        }
        this._init(file, options);
        this._start();
    }
    fingerprint(file, title, {
        userid,
        cataid
    }) {
        return `polyv-${userid}-${cataid}-${title}-${file.type}-${file.size}`;
    }
    stop() {
        this.ossClient.stopMultipartUpload();
        console.log('暂停上传');
    }

    _init(file, options) {
        let userid = options.userid,
            cataid = options.cataid;

        this.file = file;
        this.userData = {
            ptime: options.ptime,
            hash: options.hash,
            sign: options.sign,
            userid: userid,
        };
        this.fileData = {
            cataid: cataid,
            desc: options.desc,
            ext: options.ext,
            extra: options.extra,
            luping: options.luping,
            title: options.title,
            tag: options.tag,
            fingerprint: options.fingerprint || this.fingerprint(file, options.title, {
                userid,
                cataid
            }),
        };
        this.url_getStsInfo = options.url_getStsInfo;
        this.url_completeUpload = options.url_completeUpload;

        this.resumable = options.resumable || true; // 默认为true
        // 回调函数
        this.progress = options.progress;
        this.done = options.done;
        this.fail = options.fail;

        this.checkpoint = null;
        this.uploadId = '';
        this.ossClient = null;
    }
    _start() {
        let userData = this.userData;
        let fileData = this.fileData;
        let url = this.url_getStsInfo.replace('{userid}', userData.userid);

        utils.post({
            url: url,
            data: {
                ptime: userData.ptime, // 当前时间的毫秒级时间戳（13位），30分钟内有效
                sign: userData.sign,
                hash: userData.hash,

                title: fileData.title,
                describ: fileData.desc,
                cataid: fileData.cataid,
                tag: fileData.tag,
                luping: fileData.luping,

                filesize: this.file.size,

                autoid: 1, // 自动生成vid，无需在请求参数中传vid

                compatible: 1,
            },
            done: res => {
                if (res.status !== 'success') {
                    console.log('获取sts信息出错！刷新重试！');
                    return;
                }
                let data = res.data;
                this.fileData.vid = data.vid;
                let stsInfo = {
                    endpoint: data.endpoint,
                    bucket: data.bucketName,
                    accessKeyId: data.accessId,
                    accessKeySecret: data.accessKey,
                    stsToken: data.token,
                };
                this.ossClient = new OSS.Wrapper(stsInfo);

                let fingerprint = this.fileData.fingerprint;

                if (!this.resumable) { // disable resumable upload
                    localStorage.removeItem(fingerprint);
                }
                this.checkpoint = this._getCheckpoint(fingerprint); // Get the file upload address from localStorage

                if (typeof this.checkpoint === 'object' && this.checkpoint) {
                    this.checkpoint.file = this.file;
                }

                let that = this;

                let progress = function(percentage, checkpoint) {
                    return function(done) {
                        that.uploadId = checkpoint.uploadId;
                        if (typeof that.progress === 'function') {
                            that.progress(percentage);
                        }
                        that._setCheckpoint(that.fileData.fingerprint, checkpoint);
                        done();
                    };
                };

                let multipartUpload = this.ossClient.multipartUpload(this.file.name, this.file, {
                    partSize: 210 * 1024,
                    progress: progress,
                    checkpoint: this.checkpoint
                }).then(result => {
                    if (!result.stop) {
                        localStorage.setItem(fingerprint, null);
                        console.log(result);

                        // todo: 将地址传给后台存到数据库
                        let url = that.url_completeUpload.replace('{userid}', userData.userid);
                        let tempArr = result.res.requestUrls[0].split('?');
                        let videoUrl = tempArr[0];
                        utils.post({
                            url: url,
                            data: {
                                ptime: userData.ptime,
                                sign: userData.sign,
                                hash: userData.hash,
                                object: videoUrl,
                                etag: result.etag,
                                vid: that.fileData.vid,
                                compatible: 1,
                            },
                            done: res => {
                                if (res.status === 'success' && typeof that.done === 'function') {
                                    that.done();
                                }
                            },
                            fail: err => {
                                console.log(err);
                            }
                        });
                    }


                }).catch(function(err) {
                    console.log(err);
                });
            }
        });
    }

    // handle checkPoint
    _getCheckpoint(fingerprint) {
        var checkpoint = localStorage.getItem(fingerprint);
        checkpoint = typeof checkpoint === 'string' ? JSON.parse(checkpoint) : null;
        return checkpoint;
    }
    _setCheckpoint(fingerprint, checkpoint) {
        let result = false;
        try {
            result = localStorage.setItem(fingerprint, JSON.stringify(checkpoint));
        } catch (e) {
            // most likely quota exceeded error
        }
        return result;
    }

    _emitFail(err) {
        this.fail && this.fail(err);
    }

}

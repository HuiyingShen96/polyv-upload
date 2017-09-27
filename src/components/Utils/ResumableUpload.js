import Utils from '../../components/Utils/Utils';
let utils = new Utils();

export default class ResumableUpload {
    upload(file, options) {
        this._init(file, options);
        if (file) {
            this._start();
        }
    }
    fingerprint(file, title, {
        userid,
        cataid
    }) {
        console.log(`polyv-${userid}-${cataid}-${title}-${file.type}-${file.size}`);

        return `polyv-${userid}-${cataid}-${title}-${file.type}-${file.size}`;
    }
    stop() {
        if (this.uploadRequest) {
            this.uploadRequest.abort();
        }
    }
    getResponse() {
        if (this.uploadRequest) {
            return this.uploadRequest.responseText;
        }
    }

    _init(file, options) {
        let userid = options.userid,
            cataid = options.cataid;

        this.file = file;
        this.options = {
            endpoint: options.endpoint,
            fingerprint: options.fingerprint || this.fingerprint(file, options.title, {
                userid,
                cataid
            }),
            resumable: options.resumable || !options.resetBefore, // 默认为true
            resetBefore: options.resetBefore || false,
            resetAfter: options.resetAfter || true,

            cataid: cataid,
            desc: options.desc,
            ext: options.ext,
            extra: options.extra,
            luping: options.luping,
            title: options.title,
            tag: options.tag,

            ts: options.ts,
            hash: options.hash,
            userid: userid,
        };
        this.progress = options.progress;
        this.done = options.done;
        this.fail = options.fail;

        this.fileUrl = null;
        this.bytesWritten = null;
        this.uploadRequest = null;
    }
    _start() {
        if (!this.options.resumable || this.options.resetBefore) { // disable resumable upload
            this._urlCache(false); // Remove localstorage
        }
        this.fileUrl = this._urlCache(); // Get the file upload address from localstorage
        if (this.fileUrl) { // There is a upload record.
            this._head();
        } else {
            this._post();
        }
    }
    _post() {
        utils.post({
            url: this.options.endpoint,
            data: {
                cataid: this.options.cataid,
                desc: this.options.desc,
                ext: this.options.ext,
                extra: this.options.extra,
                luping: this.options.luping,
                title: this.options.title,
                tag: this.options.tag,
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'Final-Length': this.file.size,
                ts: this.options.ts,
                userid: this.options.userid,
                hash: this.options.hash
            },
            done: (res, textStatus, XHR) => {
                let location = XHR.getResponseHeader('Location');
                if (!location) {
                    return this._emitFail(`Could not get url for file resource. ${textStatus}`);
                }

                this.fileUrl = location;
                this._uploadFile(0, this.file.size - 1);
            },
            fail: (textStatus) => {
                this._emitFail(`Could not post to file resource ${this.options.endpoint}. ${textStatus}`);
            }
        });
    }
    _head() {
        let xhr = new XMLHttpRequest();
        xhr.open('HEAD', this.fileUrl);

        // xhr.setRequestHeader('Cache-Control', 'no-cache');
        xhr.send();
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    let offset = xhr.getResponseHeader('Offset');
                    let bytesWritten = offset ? parseInt(offset, 10) : 0;
                    this._uploadFile(bytesWritten, this.file.size - 1);
                } else {
                    localStorage.removeItem(this.fingerprint(this.file, this.options.title));
                    this._post();
                }
            }
        };
    }
    _uploadFile(range_from, range_to) {
        this.bytesWritten = range_from;

        if (this.bytesWritten === this.file.size) { // Already done!
            if (this.options.resetAfter === true) {
                this._urlCache(false);
            }
            this._emitProgress(range_from, this.file.size);
            this._emitDone();
            return;
        }

        this._urlCache(this.fileUrl);
        this._emitProgress();

        let bytesWrittenAtStart = this.bytesWritten;

        let slice = this.file.slice || this.file.webkitSlice || this.file.mozSlice;
        let blob = slice.call(this.file, range_from, range_to + 1, this.file.type);

        let xhr = new XMLHttpRequest();
        this.uploadRequest = xhr;
        xhr.upload.addEventListener('progress', e => {
            this.bytesWritten = bytesWrittenAtStart + e.loaded;
            if (e && e.lengthComputable) {
                this._emitProgress(range_from + e.loaded, this.file.size);
            }
        });
        xhr.upload.addEventListener('load', () => {
            if (this.options.resetAfter === true) {
                this._urlCache(false);
            }
            this._emitDone();
        });
        xhr.upload.addEventListener('error', () => {
            var msg = xhr.responseText || xhr.status;
            this._emitFail(msg);
        });
        xhr.upload.addEventListener('abort', () => {
            console.log('Stop uploading!');
        });

        xhr.open('PATCH', this.fileUrl);
        xhr.setRequestHeader('Offset', range_from);
        xhr.setRequestHeader('Content-Type', 'application/offset+octet-stream');
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {

                } else {
                    let msg = xhr.responseText || xhr.status;
                    this._emitFail(msg);
                }
            }
        };
        xhr.send(blob);
    }
    _urlCache(url) {
        let fingerPrint = this.options.fingerprint;

        if (url === false) {
            return localStorage.removeItem(fingerPrint);
        }

        if (url) {
            let result = false;
            try {
                result = localStorage.setItem(fingerPrint, url);
            } catch (e) {
                // most likely quota exceeded error
            }

            return result;
        }
        return localStorage.getItem(fingerPrint);
    }

    _emitProgress(loaded, total) {
        this.progress && this.progress(loaded, total);
    }
    _emitDone() {
        this.done && this.done();
    }
    _emitFail(err) {
        this.fail && this.fail(err);
    }

}

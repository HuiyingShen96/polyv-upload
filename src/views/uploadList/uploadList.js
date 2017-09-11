import React, {
    Component
} from 'react';
import PropTypes from 'prop-types';
import './uploadList.scss';
import Select from '../../components/Select/Select';
import Button from '../../components/Button/Button';
import Table from '../../components/Table/Table';
import UploadButton from '../../components/UploadButton/UploadButton';

import TitleTd from './titleTd';
import DescTd from './descTd';

import Utils from '../../components/Utils/Utils';
let utils = new Utils();
import ResumableUpload from '../../components/Utils/ResumableUpload';
let polyv = new ResumableUpload();
// let polyv = null;

let uploadServer = 'http://upload.polyv.net:1080/files/';

export default class UploadList extends Component {
    constructor(props) {
        super(props);

        this.handleUploadBtnChange = this.handleUploadBtnChange.bind(this);
        this.handleTagChange = this.handleTagChange.bind(this);
        this.handleEmptyClick = this.handleEmptyClick.bind(this);
        this.handlePauseClick = this.handlePauseClick.bind(this);
        this.handleUploadClick = this.handleUploadClick.bind(this);
        this.handleSelectCategoryChange = this.handleSelectCategoryChange.bind(this);

        this.state = {
            files: [],
            curIndex: 0,
            uploadStatus: 0, // 上传状态（0:等待 1:就绪 2:执行 3:暂停）

            fileOptions: {
                cataid: 1,
                tag: '',
            },
            speedValue: '0.0 kb/s',
            totalBytesUploaded: 0,
            totalBytesTotal: 0,
        };

        this.uploadProgress = {
            lastSize: 0,
            newSize: 0,
            totalBytesFinished: 0,
        };
    }

    getTbodyData(files) {
        let tbodyData = [];

        function setFileOptions({
            name,
            value,
            index
        }) {
            let files = this.state.files.slice();
            files[index][name] = value;

            this.setState({
                files,
            });
        }

        function deleteFile(fileKey, disabled) {
            if (disabled) {
                return;
            }
            let files = this.state.files.slice();
            let uploadStatus = this.state.uploadStatus;
            let totalBytesTotal = this.state.totalBytesTotal;
            let totalBytesUploaded = this.state.totalBytesUploaded;

            let index = files.findIndex(ele => {
                return ele.key === fileKey;
            });
            let delFileArr = files.splice(index, 1);
            let delFile = delFileArr[0];

            utils.sendMsg({
                type: 'FILE_CANCEL',
                data: delFile
            });

            if (files.length <= this.state.curIndex) {
                uploadStatus = 0;
            }

            totalBytesTotal -= delFile.size;
            totalBytesUploaded -= delFile.bytesUploaded;

            this.setState({
                files,
                uploadStatus,
                totalBytesTotal,
                totalBytesUploaded,
            });
        }

        files.map((file, index) => {
            let uploadStatus = this.state.uploadStatus;
            let type = file.type.replace(/.+\//, ''),
                size = utils.transformSize(file.size);
            let uploading = (file.progress > 0),
                finished = (file.progress >= 100);

            let disabledDelete = this.state.uploadStatus === 2;

            let fileName = (
                    <TitleTd 
                        title={file.title} 
                        uploading={uploading || uploadStatus === 2}
                        index={index} 
                        setFileOptions={setFileOptions.bind(this)} />
                ),
                description = <DescTd 
                    desc={file.desc}
                    uploading={uploading || uploadStatus === 2}
                    index={index}
                    setFileOptions={setFileOptions.bind(this)} />,
                progress = (
                    <div>
                        <p>{size} / {type}</p>
                        <div className='progressBar-wrap'>
                            <div className='progressBar' style={{width: `${file.progress}%`}}></div>
                        </div>
                    </div>
                ),
                deleteBtn = finished ? <i className="fa fa-check" aria-hidden="true"></i> : <i className={'fa fa-trash-o ' + (disabledDelete ? 'disabled' : '')} aria-hidden="true" onClick={deleteFile.bind(this, file.key, disabledDelete)}></i>;
            tbodyData.push({
                fileName,
                description,
                progress,
                deleteBtn
            });
        });
        return tbodyData;
    }
    uploadFile(file, curIndex) {
        function progress(curIndex, loaded, total) {
            if (typeof loaded !== 'number' || typeof total !== 'number') {
                return;
            }

            let files = this.state.files.slice();

            let totalBytesUploaded = this.uploadProgress.totalBytesFinished + loaded;

            this.uploadProgress.newSize = loaded;
            let percentComplete = ((loaded / total) * 100).toFixed(2);
            files[curIndex].progress = parseFloat(percentComplete);
            files[curIndex].bytesUploaded = loaded;

            utils.sendMsg({
                type: 'FILE_PROGRESS',
                data: {
                    file: files[curIndex],
                    bytesUploaded: loaded,
                    bytesTotal: total,
                    totalBytesUploaded: totalBytesUploaded,
                    totalBytesTotal: this.state.totalBytesTotal,
                }
            });

            this.setState({
                files: files,
            });
        }

        function done() {
            let files = this.state.files.slice();
            utils.sendMsg({
                type: 'FILE_COMPLETE',
                data: files[curIndex]
            });
            this.uploadProgress.totalBytesFinished += files[curIndex].size;
            curIndex++;
            let uploadStatus = this.state.uploadStatus;
            if (curIndex < files.length) {
                this.uploadFile(files[curIndex], curIndex);
            } else {
                utils.sendMsg({
                    type: 'QUEUE_COMPLETE',
                    data: {
                        uploadsSuccessful: files,
                        uploadsErrored: [],
                    },
                });
                uploadStatus = 0;
            }

            this.setState({
                uploadStatus,
                files,
                curIndex,
            });
        }

        utils.sendMsg({
            type: 'UPLOAD_START',
            data: file
        });

        let {
            cataid,
            tag
        } = this.state.fileOptions;
        let userData = this.props.userData;

        let options = {
            endpoint: uploadServer,
            resetBefore: false,
            resetAfter: true,

            ts: userData.ts,
            hash: userData.hash,
            userid: userData.userid,
            luping: userData.luping,
            extra: userData.extra,
            cataid: cataid,

            tag: tag,
            title: file.title,
            desc: file.desc,
            ext: file.type.replace(/.+\//, ''),

            progress: progress.bind(this, curIndex),
            done: done.bind(this),
        };
        polyv.upload(file, options);
        // polyv = new ResumableUpload(file, options);
    }

    handleUploadBtnChange(files) {
        let addTime = Date.now();
        let uploadStatus = this.state.uploadStatus;
        let totalBytesTotal = this.state.totalBytesTotal;
        let newFiles = Array.from(files);

        newFiles.forEach(file => {
            file.key = `${addTime}_${file.name}`;
            file.title = file.name.split('.')[0];
            file.desc = '';
            file.progress = 0;
            file.bytesUploaded = 0;

            file.fileName = file.name;
            file.fileType = file.type;
            file.fileSize = file.size;

            utils.sendMsg({
                type: 'FILE_SELECT',
                data: file
            });
            totalBytesTotal += file.size;
        });
        let concatFiles = this.state.files.slice();

        concatFiles = concatFiles.concat(newFiles);

        if (newFiles.length > 0 && uploadStatus === 0) {
            uploadStatus = 1;
        }

        this.setState({
            uploadStatus,
            files: concatFiles,
            totalBytesTotal,
        });
    }
    handleTagChange(e) {
        let fileOptions = Object.assign({}, this.state.fileOptions);
        fileOptions.tag = e.target.value;
        this.setState({
            fileOptions,
        });
    }
    handleEmptyClick() {
        utils.sendMsg({
            type: 'CLEAR_QUEUE',
            data: this.state.files,
        });

        this.setState({
            files: [],
            curIndex: 0,
            uploadStatus: 0,
            totalBytesTotal: 0,
            totalBytesUploaded: 0,
        });
    }
    handlePauseClick() {
        let uploadStatus = this.state.uploadStatus;

        let isPaused = uploadStatus === 3;

        if (isPaused) { // 继续上传
            this.handleUploadClick();
            uploadStatus = 2;
        } else { // 暂停上传
            if (polyv) {
                polyv.stop();
            }
            uploadStatus = 3;
        }
        this.setState({
            uploadStatus,
        });
    }
    handleUploadClick() {
        let {
            files,
            curIndex,
        } = this.state;

        this.speedTimer = setInterval(() => {
            let speedValue = ((this.uploadProgress.newSize - this.uploadProgress.lastSize) / 1024).toFixed(1) + ' kb/s';
            this.uploadProgress.lastSize = this.uploadProgress.newSize;

            this.setState({
                speedValue,
            });
        }, 1000);

        this.setState({
            uploadStatus: 2,
        });
        this.uploadFile(files[curIndex], curIndex);
    }
    handleSelectCategoryChange(value) {
        let fileOptions = Object.assign({}, this.state.fileOptions);
        fileOptions.cataid = value;
        this.setState({
            fileOptions,
        });
    }

    render() {
        let {
            fileOptions,
            uploadStatus,
            files,
            speedValue,
        } = this.state;
        let {
            cataOptions,
        } = this.props;

        if ((uploadStatus === 0 || uploadStatus === 3) && this.speedTimer) {
            clearInterval(this.speedTimer);
            speedValue = '0.0 kb/s';
        }

        let tbodyData = this.getTbodyData(files);
        let tag = fileOptions.tag;

        return (
            <div id='uploadList'>
                <div className="btn-group">
                    <UploadButton 
                        disabled={uploadStatus === 2}
                        value='选择文件' name='selectFiles' multiple={true} className='btn'
                        accept='application/vnd.rn-realmedia-vbr,video/x-matroska,video/quicktime,video/mp4,video/x-flv,video/video/x-matroska,video/*,audio/*'
                        onChange={this.handleUploadBtnChange} />
                    <Select defaultText='选择分类'
                        disabled={uploadStatus > 1}
                        options= {cataOptions}
                        className='btn'
                        onChange={this.handleSelectCategoryChange} />
                    <input className="btn" type="text" name="tag"
                        disabled={uploadStatus > 1}
                        onChange={this.handleTagChange}
                        value={tag}
                        placeholder='标签 用" , "分隔' />
                    <Button value="清空" className="btn" 
                        disabled={uploadStatus === 2}
                        onClick={this.handleEmptyClick} />
                    <Button value={uploadStatus === 3 ? '继续':'暂停'} className="btn" 
                        onClick={this.handlePauseClick} 
                        visible={uploadStatus > 1} />
                    <span style={{display: uploadStatus > 1 ? 'inline' : 'none'}}
                        className="speed">{speedValue}</span>
                    <Button id="uploadFile" value="上传" className="btn upload" 
                        onClick={this.handleUploadClick} 
                        disabled={uploadStatus !== 1} />
                </div>
                <div className="fileList">
                    <Table tbodyData={tbodyData} onTdClick={this.handleTdClick} />
                </div>
            </div>
        );
    }
}
UploadList.speedTimer = null;
UploadList.propTypes = {
    BASE_URL: PropTypes.object,
    userData: PropTypes.object,
    cataOptions: PropTypes.object,
};

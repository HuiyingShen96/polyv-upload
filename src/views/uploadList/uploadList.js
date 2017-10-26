import React, {
    Component
} from 'react';
import PropTypes from 'prop-types';
import './uploadList.scss';
import Select from '../../components/Select/Select';
import Button from '../../components/Button/Button';
import Table from '../../components/Table/Table';
import UploadButton from '../../components/UploadButton/UploadButton';
import Confirm from '../../components/Confirm/Confirm';
import SysInfo from '../../components/SysInfo/SysInfo';

import TitleTd from './titleTd';
import DescTd from './descTd';

import Utils from '../../components/Utils/Utils';
let utils = new Utils();
import ResumableUpload from '../../components/Utils/ResumableUpload';
let polyv = new ResumableUpload();

export default class UploadList extends Component {
    constructor(props) {
        super(props);

        this.handleUploadBtnChange = this.handleUploadBtnChange.bind(this);
        this.handleTagChange = this.handleTagChange.bind(this);
        this.handleLupingChange = this.handleLupingChange.bind(this);
        this.handleEmptyClick = this.handleEmptyClick.bind(this);
        this.handlePauseClick = this.handlePauseClick.bind(this);
        this.handleUploadClick = this.handleUploadClick.bind(this);
        this.handleSelectCategoryChange = this.handleSelectCategoryChange.bind(this);
        this.handleConfirmEmptyClick = this.handleConfirmEmptyClick.bind(this);

        this.state = {
            files: [],
            curIndex: 0,
            uploadStatus: 0, // 上传状态（0:等待 1:就绪 2:执行 3:暂停）

            fileOptions: {
                cataid: -1,
                tag: '',
            },
            speedValue: '0.0 kb/s',
            confirmVisible: false,
            sysInfo: '',
            luping: this.props.luping,
        };

        this.uploadProgress = {
            lastSize: 0, // 用来计算上传速度
            newSize: 0, // 用来计算上传速度
        };
    }

    getTbodyData(files) {
        let tbodyData = [];

        let setFileOptions = function({
            name,
            value,
            index
        }) {
            let files = this.state.files.slice();
            files[index][name] = value;

            this.setState({
                files,
            });
        };

        let deleteFile = function(fileKey, disabled) {
            if (disabled) {
                return;
            }
            let files = this.state.files.slice();
            let uploadStatus = this.state.uploadStatus;

            let index = files.findIndex(ele => {
                return ele.key === fileKey;
            });
            let delFileArr = files.splice(index, 1);
            let delFile = delFileArr[0];

            utils.sendMsg({
                type: 'FILE_CANCEL',
                data: delFile,
                url: window.userData.url
            });

            if (files.length <= this.state.curIndex) {
                uploadStatus = 0;
            }

            this.setState({
                files,
                uploadStatus,
            });
        };

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
        let progress = function(curIndex, percentage) {
            if (typeof percentage !== 'number') {
                return;
            }
            let files = this.state.files.slice();
            files[curIndex].progress = parseFloat((percentage * 100).toFixed(2));
            let file = files[curIndex];

            this.uploadProgress.newSize = Math.round(file.size * percentage);
            utils.sendMsg({
                type: 'FILE_PROGRESS',
                data: {
                    file: files[curIndex],
                    percentage,
                },
                url: window.userData.url
            });

            this.setState({
                files: files,
            });
        };

        let done = function() {
            let files = this.state.files.slice();
            utils.sendMsg({
                type: 'FILE_COMPLETE',
                data: files[curIndex],
                url: window.userData.url
            });
            curIndex++;
            let uploadStatus = this.state.uploadStatus;
            let sysInfo = '';

            if (curIndex < files.length) {
                this.uploadFile(files[curIndex], curIndex);
            } else {
                utils.sendMsg({
                    type: 'QUEUE_COMPLETE',
                    data: {
                        uploadsSuccessful: files,
                        uploadsErrored: [],
                    },
                    url: window.userData.url
                });
                sysInfo = '上传成功！';
                uploadStatus = 0;
            }

            this.setState({
                uploadStatus,
                files,
                curIndex,
                sysInfo,
            });
            if (sysInfo) {
                setTimeout(() => {
                    this.setState({
                        sysInfo: ''
                    });
                }, 2000);
            }
        };

        utils.sendMsg({
            type: 'UPLOAD_START',
            data: file,
            url: window.userData.url
        });

        let {
            cataid,
            tag
        } = this.state.fileOptions;
        cataid = cataid < 0 ? window.userData.cataid || '1' : cataid;

        let userData = window.userData;
        polyv.upload(file, {
            // stsInfo: window.stsInfo,
            url_getStsInfo: this.props.BASE_URL.getStsInfo,
            // 传数据到后台时需要添加在请求头的数据
            ptime: userData.ptime,
            hash: userData.hash,
            sign: userData.sign,
            userid: userData.userid,
            // 需要随视频文件地址传到后台的数据
            cataid,
            desc: file.desc,
            ext: file.type.replace(/.+\//, ''),
            extra: userData.extra,
            luping: this.state.luping,
            title: file.title,
            tag: tag,
            // 回调函数
            progress: progress.bind(this, curIndex),
            done: done.bind(this),
            fail: err => {
                utils.sendMsg({
                    type: 'FILE_FAIL',
                    data: {
                        data: err
                    },
                    url: window.userData.url
                });
            }
        });
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
                data: file,
                url: window.userData.url
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
        let tag = e.target.value;
        fileOptions.tag = tag;
        window.userData.tag = tag;
        this.setState({
            fileOptions,
        });
    }
    handleLupingChange(e) {
        const {
            checked,
            value
        } = e.target;
        let luping = this.state.luping;

        if (checked && value === 'luping') {
            luping = '1';
        } else {
            luping = '0';
        }
        this.setState({
            luping,
        });
    }
    handleEmptyClick() {
        this.setState({
            confirmVisible: true,
        });
    }
    handleConfirmEmptyClick(isConfirmed) {
        if (isConfirmed) {
            utils.sendMsg({
                type: 'CLEAR_QUEUE',
                data: this.state.files,
                url: window.userData.url
            });

            this.setState({
                files: [],
                curIndex: 0,
                uploadStatus: 0,
                totalBytesTotal: 0,
                totalBytesUploaded: 0,
                confirmVisible: false,
            });
        } else {
            this.setState({
                confirmVisible: false,
            });
        }
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
        }, 2000);

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

    componentWillReceiveProps(nextProps) {
        this.setState({
            luping: nextProps.luping
        });
    }
    render() {
        let {
            confirmVisible,
            fileOptions,
            uploadStatus,
            files,
            speedValue,
            sysInfo,
            luping,
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

        let sysInfoVisiable = !!sysInfo;

        let cataid = '';
        if (fileOptions.cataid > -1) {
            cataid = fileOptions.cataid;
        } else if (window.userData) {
            cataid = window.userData.cataid;
        }
        let selectTitleText = cataOptions && cataid && cataOptions[cataid] || '';

        return (
            <div id='uploadList'>
                <div className="btn-group">
                    <UploadButton 
                        disabled={uploadStatus === 2}
                        value='选择文件' name='selectFiles' multiple={true} 
                        className="btn-group-element"
                        accept='video/avi,.avi,.f4v,video/mpeg,.mpg,video/mp4,.mp4,video/x-flv,.flv,video/x-ms-wmv,.wmv,video/quicktime,.mov,video/3gpp,.3gp,.rmvb,video/x-matroska,.mkv,.asf,.264,.ts,.mts,.dat,.vob,audio/mpeg,.mp3,audio/x-wav,.wav,video/x-m4v,.m4v,video/webm,.webm,.mod'
                        onChange={this.handleUploadBtnChange} />
                    <Select text={selectTitleText}
                        disabled={uploadStatus > 1}
                        options= {cataOptions}
                        className="btn-group-element"
                        onChange={this.handleSelectCategoryChange} />
                    <input className="btn-group-element" type="text" name="tag"
                        disabled={uploadStatus > 1}
                        onChange={this.handleTagChange}
                        value={tag}
                        placeholder='标签 用" , "分隔' />
                    <Button value="清空" className="btn-group-element" 
                        disabled={uploadStatus === 2 || files.length < 1}
                        onClick={this.handleEmptyClick} />
                    <Button value={uploadStatus === 3 ? '继续':'暂停'} className="btn-group-element" 
                        onClick={this.handlePauseClick} 
                        visible={uploadStatus > 1} />
                    <span style={{display: uploadStatus === 2 ? 'inline' : 'none'}}
                        className="speed btn-group-element">{speedValue}</span>
                    <span className="btn-group-element">
                        <input type="checkbox" name="luping" id="luping"
                            onChange={this.handleLupingChange} 
                            checked={luping === '1'} value="luping" />
                        <label htmlFor="luping" className="luping">
                            进行视频课件优化处理
                            <span>针对录屏类视频课件，画质更清晰</span>
                        </label>
                    </span>
                    <Button id="uploadFile" value="上传" className="btn-group-element upload" 
                        onClick={this.handleUploadClick} 
                        disabled={uploadStatus !== 1} />
                </div>
                <div className="fileList">
                    <Table tbodyData={tbodyData} onTdClick={this.handleTdClick} />
                </div>
                <Confirm visible={confirmVisible} onClick={this.handleConfirmEmptyClick} confirmInfo="确认清空上传列表？" />
                <SysInfo visible={sysInfoVisiable} sysInfo={sysInfo}  />
            </div>
        );
    }
}
UploadList.speedTimer = null;
UploadList.propTypes = {
    BASE_URL: PropTypes.object,
    cataOptions: PropTypes.object,
};

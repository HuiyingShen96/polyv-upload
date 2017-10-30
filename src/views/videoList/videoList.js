import React, {
    Component
} from 'react';
import PropTypes from 'prop-types';
import './videoList.scss';
// import ListPanel from './listPanel';
import InfoPanel from './infoPanel';
import SearchBar from '../../components/SearchBar/SearchBar';
import Button from '../../components/Button/Button';
import Table from '../../components/Table/Table';
import Utils from '../../components/Utils/Utils';
let utils = new Utils();

export default class VideoList extends Component {
    constructor(props) {
        super(props);

        this.handleSearchClick = this.handleSearchClick.bind(this);
        this.handleReturnClick = this.handleReturnClick.bind(this);
        this.handleRowDataClick = this.handleRowDataClick.bind(this);
        this.handlePageControlClick = this.handlePageControlClick.bind(this);

        this.state = {
            curPageNum: 1, // 当前视频列表的pageNum
            numPerPage: 15,
            searchKeyword: '', // 搜索关键字
            videoList: [], // 当前显示视频列表的数据
            videoListTableData: {
                theadData: {
                    thumbnail: '缩略图',
                    title: '标题',
                    duration: '时长',
                    status: '状态',
                    formatPtime: '创建时间',
                },
                tbodyData: [],
            },
            sysInfo: '',
            pageStatus: {
                pre: false,
                next: false
            },
            infoPanelVisible: !this.props.returnToList, // 当前是否显示视频详细信息
            videoInfo: null, // 当前视频的详细信息
            loading: false, // 是否正在进行fetch请求
            noListData: true,
            editStatus: false,
        };
        this.tableWrapNode = null;
        this.numPerPage = 15;
    }

    getTbodyData(videoList) {
        if (!videoList) {
            return [];
        }
        let tbodyData = [];
        videoList.map(vInfo => {
            tbodyData.push({
                thumbnail: <img src={vInfo.first_image} />,
                title: <div className="titleWrap" title={vInfo.title}>{vInfo.title}</div>,
                duration: vInfo.duration,
                status: utils.transformStatus(vInfo.status),
                formatPtime: vInfo.formatPtime
            });
        });
        return tbodyData;
    }
    processVideoListData(videoListData) {
        let sysInfo = '',
            pageStatus = Object.assign({}, this.state.pageStatus),
            videoListTableData = Object.assign({}, this.state.videoListTableData),
            videoList = videoListData.data;

        if (videoListData.code !== 200) {
            sysInfo = '获取视频列表信息出错！请刷新重试';
            pageStatus = {
                pre: false,
                next: false
            };

            Object.assign(videoListTableData, {
                tbodyData: []
            });
        } else if (!videoList || videoList.length === 0) {
            sysInfo = '没有更多信息！';
            Object.assign(pageStatus, {
                next: false
            });

            Object.assign(videoListTableData, {
                tbodyData: []
            });
        } else {
            let {
                numPerPage,
                curPageNum
            } = this.state;
            let nextPageSatus = false;
            Object.assign(videoListTableData, {
                tbodyData: this.getTbodyData(videoList)
            });
            if (videoListData.total) {
                let totalPages = Math.ceil(parseInt(videoListData.total) / numPerPage);
                nextPageSatus = totalPages > curPageNum;
            } else {
                nextPageSatus = videoList.length >= numPerPage;
            }
            pageStatus = {
                pre: this.state.curPageNum > 1,
                next: nextPageSatus
            };
        }
        this.setState({
            videoListTableData,
            pageStatus,
            sysInfo,
            videoList,
        });
    }
    processVideoInfoData(videoInfoData) {
        let sysInfo = '',
            videoInfo = videoInfoData.data[0];

        if (videoInfoData.status !== 'success') {
            sysInfo = '获取视频信息出错！请刷新重试';
        }

        this.setState({
            sysInfo,
            videoInfo,
        });
    }

    handleSearchClick(keyword) {
        if (!keyword) {
            this.fetchVideoList(1);
        } else {
            // this.fetchVideoByKeyword(1, keyword);
            this.fetchVideoList(1, keyword);
        }

        let infoPanelVisible = false;
        this.setState({
            searchKeyword: keyword,
            infoPanelVisible,
        });
        // this.handleInfoPanelVisibleChange(infoPanelVisible);
    }
    handleReturnClick() {
        if (this.state.searchKeyword === '') {
            return;
        }

        let infoPanelVisible = false;
        this.setState({
            curPageNum: 1,
            searchKeyword: '',
            infoPanelVisible,
        });
        // this.handleInfoPanelVisibleChange(infoPanelVisible);
        this.fetchVideoList(1);
        // this.fetchVideoByKeyword(1, '');
    }
    handlePageControlClick(name) {
        let {
            curPageNum,
            pageStatus
        } = this.state;

        if (name === 'pre') {
            curPageNum--;
            Object.assign(pageStatus, {
                next: true
            });
        } else if (name === 'next') {
            curPageNum++;
            Object.assign(pageStatus, {
                pre: true
            });
        }
        if (this.state.searchKeyword === '') { // 非搜索状态
            this.fetchVideoList(curPageNum);
        } else {
            this.fetchVideoByKeyword(curPageNum, this.state.searchKeyword);
        }
        this.setState({
            pageStatus,
        });
    }
    handleRowDataClick(index) {
        let {
            videoList,
        } = this.state;
        this.fetchVideoInfo(videoList[index].vid);
        let infoPanelVisible = true;
        this.setState({
            infoPanelVisible,
            searchKeyword: '',
        });
        // this.handleInfoPanelVisibleChange(infoPanelVisible);
    }

    fetchVideoList(pageNum, keyword) {
        this.setState({
            loading: true,
            curPageNum: pageNum,
        });
        const userData = window.userData;

        let queryParams = {
            ptime: userData.ptime,
            sign: userData.sign,
            hash: userData.hash,
            // numPerPage: this.numPerPage, // 默认为99
            pageNum: pageNum,
            keyword: keyword || '',
            cataid: userData.cataid,
            compatible: 1,
        };
        let url = this.props.BASE_URL.getVideoList.replace('{userid}', userData.userid);

        utils.getJSON({
            url: url,
            data: queryParams,
            done: data => {
                console.log(data);

                this.processVideoListData(data);

                if (!keyword) {
                    this.setState({
                        loading: false,
                        infoPanelVisible: false,
                    });
                    this.props.onListChange();
                } else {
                    this.setState({
                        loading: false,
                    });
                }
            },
            fail: err => console.log(err)
        });
    }
    fetchVideoByKeyword(pageNum, keyword) {
        this.setState({
            loading: true,
            curPageNum: pageNum,
        });
        let numPerPage = this.state.numPerPage;
        const userData = window.userData;
        let BASE_URL = this.props.BASE_URL;
        let queryParams = {
            method: 'searchByTitle2',
            userid: userData.userid,
            ts: userData.ts,
            sign: userData.sign,
            pageNum,
            numPerPage,
            keyword: keyword,
            tag: userData.tag || '',
            catatree: userData.catatree || '',
        };

        utils.getJSON({
            url: BASE_URL.getVideoList,
            data: queryParams,
            done: data => {
                this.processVideoListData(data);
                this.setState({
                    loading: false,
                });
            },
            fail: err => console.log(err)
        });
    }
    fetchVideoInfo(vid) {
        this.setState({
            loading: true
        });
        let BASE_URL = this.props.BASE_URL;
        // let userData = this.props.userData;
        let userData = window.userData;
        let queryParams = {
            vid: vid,
            userid: userData.userid,
            ptime: userData.ptime,
            sign: userData.sign,
            hash: userData.hash,
            compatible: 1,
        };
        let url = this.props.BASE_URL.getVideoInfo.replace('{userid}', userData.userid);

        utils.getJSON({
            url: url,
            data: queryParams,
            done: data => {
                this.processVideoInfoData(data);
                this.setState({
                    loading: false,
                });
            },
            fail: err => console.log(err)
        });
    }

    componentWillReceiveProps(nextProps) {
        let {
            videoListIsClicked,
        } = nextProps;
        if (videoListIsClicked && window.userData) {
            this.fetchVideoList(1);
        }
    }

    componentDidUpdate() {
        this.tableWrapNode.scrollTop = 0;
    }

    render() {
        let {
            infoPanelVisible,
            videoInfo,
            searchKeyword,
            loading,
            sysInfo,
            videoListTableData,
            pageStatus,
            editStatus,
        } = this.state;
        let {
            // userData,
            BASE_URL,
        } = this.props;

        let infoProps = {
            visible: infoPanelVisible,
            closeInfoPanel: isChange => {
                this.setState({
                    infoPanelVisible: false
                });
                if (isChange) {
                    this.fetchVideoList(1);
                }
            },
            videoInfo,
            BASE_URL,
            editStatus,
        };
        let searchBarProps = {
            searchKeyword,
            onClick: this.handleSearchClick
        };
        let returnBtnProps = {
            value: '返回',
            onClick: this.handleReturnClick,
            visible: searchKeyword ? true : false,
        };

        let videoListTableProps = {
            theadData: videoListTableData.theadData,
            tbodyData: videoListTableData.tbodyData,
            onTrClick: this.handleRowDataClick,
            trClickable: true,
        };
        let preBtnProps = {
            value: '上一页',
            onClick: this.handlePageControlClick.bind(this, 'pre'),
            disabled: !pageStatus.pre,
        };
        let nextBtnProps = {
            value: '下一页',
            onClick: this.handlePageControlClick.bind(this, 'next'),
            disabled: !pageStatus.next,
        };
        return (
            <div id='videoList'>
                <div className="search">
                    <SearchBar {...searchBarProps} />
                    <Button {...returnBtnProps} />
                </div>
                <div className="panel">
                    <div className="loading" style={{display: loading ? 'block' : 'none'}}>
                        <img src="./assets/images/loading.gif" alt="加载中..."/>
                    </div>
                    <div className="videoListSysInfo" style={{display: sysInfo.trim() !== '' ? 'block' : 'none'}}>
                        <p>{sysInfo}</p>
                    </div>
                    <div className="listPanel" style={{display: !infoPanelVisible ? 'block' : 'none'}}>
                        <div className="tableWrap" ref={node => this.tableWrapNode = node}>
                            <Table {...videoListTableProps} />
                        </div>
                        <div id="pageControl" style={{display: !pageStatus.pre && !pageStatus.next ? 'none' : 'block'}}>
                            <Button {...preBtnProps} />
                            <Button {...nextBtnProps} />
                        </div>
                    </div>
                    <InfoPanel {...infoProps} />
                </div>
            </div>
        );
    }
}
// VideoList.tableWrapNode = null;
// VideoList.numPerPage = 15;
VideoList.propTypes = {
    videoListIsClicked: PropTypes.bool,
    BASE_URL: PropTypes.object,
    // userData: PropTypes.object,
};

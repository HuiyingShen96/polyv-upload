import React, {
    Component
} from 'react';
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
                    ptime: '创建时间',
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
            latestPic: [],
        };
    }

    getTbodyData(videoList) {
        if (!videoList) {
            return [];
        }
        let tbodyData = [];
        videoList.map(vInfo => {
            tbodyData.push({
                thumbnail: <img src={vInfo.first_image} alt={vInfo.title}/>,
                title: vInfo.title,
                duration: vInfo.duration,
                status: utils.transformStatus(vInfo.status),
                ptime: vInfo.ptime
            });
        });
        return tbodyData;
    }
    processVideoListData(videoListData) {
        let sysInfo = '',
            pageStatus = Object.assign({}, this.state.pageStatus),
            videoListTableData = Object.assign({}, this.state.videoListTableData),
            videoList = videoListData.data;

        if (videoListData.error !== '0') {
            sysInfo = '获取视频列表信息出错！请刷新重试';
            pageStatus = {
                pre: false,
                next: false
            };

            Object.assign(videoListTableData, {
                tbodyData: []
            });
        } else if (videoList.length === 0) {
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
            videoList
        });
    }
    processVideoInfoData(videoInfoData) {
        let sysInfo = '',
            videoInfo = videoInfoData.data[0];

        if (videoInfoData.error !== '0') {
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
            this.fetchVideoByKeyword(1, keyword);
        }

        this.setState({
            searchKeyword: keyword,
            infoPanelVisible: false
        });
    }
    handleReturnClick() {
        if (this.state.searchKeyword === '') {
            return;
        }
        this.setState({
            curPageNum: 1,
            searchKeyword: '',
            infoPanelVisible: false,
        });
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
            latestPic
        } = this.state;
        if (!latestPic.length) {
            this.fetchLatestPic();
        }
        this.fetchVideoInfo(videoList[index].vid);
        this.setState({
            infoPanelVisible: true,
            searchKeyword: '',
        });
    }

    fetchVideoList(pageNum) {
        this.setState({
            loading: true,
            curPageNum: pageNum,
        });
        let numPerPage = this.state.numPerPage;
        let BASE_URL = this.props.BASE_URL;
        let userData = this.userData;
        let queryParams = {
            method: 'getNewList2',
            userid: userData.userid,
            ts: userData.ts,
            sign: userData.sign,
            pageNum,
            numPerPage,
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
    fetchVideoByKeyword(pageNum, keyword) {
        this.setState({
            loading: true,
            curPageNum: pageNum,
        });
        let numPerPage = this.state.numPerPage;
        const userData = this.userData;
        let BASE_URL = this.props.BASE_URL;
        let queryParams = {
            method: 'searchByTitle2',
            userid: userData.userid,
            ts: userData.ts,
            sign: userData.sign,
            pageNum,
            numPerPage,
            keyword: keyword,
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
        let userData = this.userData;
        let queryParams = {
            method: 'getById2',
            userid: userData.userid,
            ts: userData.ts,
            sign: userData.sign,
            vid,
        };

        utils.getJSON({
            url: BASE_URL.getVideoList,
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
    fetchLatestPic() {
        let BASE_URL = this.props.BASE_URL;
        let userData = this.userData;
        utils.jsonp({
            url: BASE_URL.getLatestPic,
            data: {
                userid: userData.userid
            },
            done: latestPic => {
                this.setState({
                    latestPic
                });
            }
        });
    }

    componentDidMount() {
        utils.addHander(window, 'message', event => {
            let data = event.data;
            console.log(data);
            if (typeof data === 'string') {
                this.userData = JSON.parse(data);
                this.fetchVideoList(1);
            }
            // if (data.source !== 'polyv-upload') {
            //     return;
            // }
            // this.userData = data.userData;
            // this.fetchVideoList(1);
        });
    }
    componentWillReceiveProps(nextProps) {
        this.setState({
            infoPanelVisible: !nextProps.returnToList,
        });
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
            latestPic,
        } = this.state;

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
            latestPic,
            userData: this.userData,
            BASE_URL: this.props.BASE_URL,
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
                        <img src="http://localhost:8088/assets/img/loading.gif" alt="加载中"/>
                    </div>
                    <div className="sysInfo" style={{display: sysInfo.trim() !== '' ? 'block' : 'none'}}>
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
VideoList.userData = null;
VideoList.tableWrapNode = null;

import React, {
    Component
} from 'react';
import PropTypes from 'prop-types';
import Table from '../../components/Table/Table';
import Button from '../../components/Button/Button';

export default class ListPanel extends Component {
    constructor(props) {
        super(props);

        this.state = {
            theadData: {
                thumbnail: '缩略图',
                title: '标题',
                duration: '时长',
                status: '状态',
                ptime: '创建时间',
            },
            tbodyData: [],
            sysInfo: '没有更多信息',
            pageStatus: {
                pre: false,
                next: false
            }
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
                status: this.props.transformStatus(vInfo.status),
                ptime: vInfo.ptime
            });
        });
        return tbodyData;
    }

    componentWillReceiveProps(nextProps) {
        if (!nextProps.videoListData) {
            return;
        }
        let videoListData = nextProps.videoListData;
        if (videoListData.error !== '0') {
            this.setState({
                sysInfo: '获取视频列表信息出错！'
            });
        } else {
            let tbodyData = this.getTbodyData(videoListData.data);
            this.setState({
                tbodyData,
                pageStatus: {
                    pre: false,
                    next: Math.ceil(videoListData.total / this.props.numPerPage) > 1
                }
            });
        }
    }
    render() {
        let style = {
            display: this.props.visible ? 'block' : 'none',
        };
        let {
            theadData,
            tbodyData,
            sysInfo,
            pageStatus,
        } = this.state;
        let {
            onTrClick,
            handlePreClick,
            handleNextClick,
        } = this.props;
        let tableProps = {
            theadData,
            tbodyData,
            onTrClick,
        };
        let preBtnProps = {
            value: '上一页',
            onClick: handlePreClick,
            disabled: !pageStatus.pre,
            style: {}
        };
        let nextBtnProps = {
            value: '下一页',
            onClick: handleNextClick,
            disabled: !pageStatus.next,
            style: {}
        };
        return (
            <div className="listPanel" style={style}>
                <div className="sysInfo" style={{display: tbodyData && tbodyData.length === 0 ? 'block' : 'none'}}>
                    <p>{sysInfo}</p>
                </div>
                <div className="tableWrap">
                    <Table {...tableProps} />
                </div>
                <div id="pageControl">
                    <Button {...preBtnProps} />
                    <Button {...nextBtnProps} />
                </div>
            </div>
        );
    }
}
ListPanel.propTypes = {
    visible: PropTypes.bool,
    videoListData: PropTypes.object,
    transformStatus: PropTypes.func,
    onTrClick: PropTypes.func,
};

ListPanel.defaultProps = {
    visible: true,
    videoListData: null,
    transformStatus: () => {},
    onTrClick: () => {},
};

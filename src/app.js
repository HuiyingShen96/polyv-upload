'use strict';
import React, {
    Component
} from 'react';
import ReactDom from 'react-dom';

import Tabs from './components/Tabs/Tabs';
import TabPanel from './components/Tabs/TabPanel';

import VideoList from './views/videoList/videoList';
import UploadList from './views/uploadList/uploadList';
import Utils from './components/Utils/Utils';
let utils = new Utils();
import './base.scss';

window.userData = {
    component: 'all', // 默认
    cataid: 1, // 默认
    luping: '0', // 默认
};
class UploadModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            BASE_URL: {
                // getVideoList: '//v.polyv.net/uc/services/rest',
                getVideoList: '//api.polyv.net/v2/video/{userid}/list',
                getVideoInfo: '//api.polyv.net/v2/video/{userid}/get-video-msg',
                // getLatestPic: '//v.polyv.net/uc/video/recentFirstImages',
                getLatestPic: '//api.polyv.net/v2/video/{userid}/recentFirstImages',
                getCategory: '//api.polyv.net/v2/cata/{userid}/cata-info',
                // getStsInfo: '//localhost:8088/sts-server/sts.php',
                getStsInfo: '//api.polyv.net/v2/aliyunoss/{userid}/init',
                // postCoverImage: '//my.polyv.net/v2/file/{userid}/coverImage',
                postCoverImage: '//apollo.polyv.net/v2/file/{userid}/coverImage', // test
                coverImage: '//api.polyv.net/v2/video/{userid}/coverImage',
                completeUpload: '//api.polyv.net/v2/aliyunoss/{userid}/completeUpload',
            },
            cataOptions: null,
            videoListIsClicked: false,
            component: 'all',
            luping: 0,
        };
    }

    fetchCategory() {
        let userData = window.userData;
        let url = this.state.BASE_URL.getCategory.replace('{userid}', userData.userid);

        utils.getJSON({
            url: url,
            data: {
                ptime: userData.ptime,
                sign: userData.sign,
                hash: userData.hash,
                cataid: userData.cataid || 1,
                compatible: 1,
            },
            done: res => {
                let data = res.data;
                let options = {};
                if (userData.cataid.toString() === '1') {
                    options[1] = '默认分类';
                }
                console.log(data);

                var minLen = data[0].catatree.match(/,/g).length - 1;
                data.forEach(ele => {
                    let level = ele.catatree.match(/,/g).length - 1 - minLen;
                    let levelStr = '';
                    for (let i = 0, len = level; i < len; i++) {
                        levelStr += '-- ';
                    }

                    options[ele.cataid] = levelStr + ele.cataname;
                });
                window.userData.catatree = window.userData.cataid ? data[0].catatree : '1';

                this.setState({
                    cataOptions: options,
                });
            }
        });
    }
    fetchStsInfo() {
        if (!window.userData.userid) {
            return;
        }
        let userData = window.userData;
        let url = this.state.BASE_URL.getStsInfo.replace('{userid}', userData.userid);
        utils.post({
            url: url,
            data: {
                ptime: userData.ptime,
                sign: userData.sign,

            },
            done: function(res) {
                console.log(res);

                // window.stsInfo.accessKeyId = res.AccessKeyId;
                // window.stsInfo.accessKeySecret = res.AccessKeySecret;
                // window.stsInfo.stsToken = res.SecurityToken;
                // console.log(window.stsInfo);
            },
            fail: function() {
                console.log('获取STS授权信息失败，请刷新重试！');
                return;
            },
        });
    }

    componentDidMount() {
        utils.addHander(window, 'message', event => {
            let dataStr = event.data,
                data = typeof dataStr === 'string' && JSON.parse(dataStr);
            if (!data || data.source !== 'polyv-upload') {
                return;
            }
            delete data.source;

            Object.assign(window.userData, data);
            window.userData.ptime = data.ts;
            console.log(data);

            // this.fetchStsInfo();

            if (data.component && data.component !== 'all') {
                this.setState({
                    component: data.component,
                    videoListIsClicked: data.component === 'videoList',
                    luping: data.luping || 0,
                });
            }

            if (!this.state.cataOptions) {
                this.fetchCategory();
            }
        });
        // setInterval(() => {
        //     this.fetchStsInfo();
        // }, 900 * 1000);
    }

    render() {
        let {
            BASE_URL,
            cataOptions,
            videoListIsClicked,
            component,
            luping,
        } = this.state;

        let publicProps = {
            BASE_URL,
        };
        let uploadListPorps = {
            cataOptions,
            luping,
        };
        let videoListPorps = {
            videoListIsClicked,
            onListChange: () => {
                let videoListIsClicked = false;
                this.setState({
                    videoListIsClicked,
                });
            }
        };
        let tabsProps = {
            defaultActiveIndex: 0,
            onChange: options => {
                this.setState({
                    videoListIsClicked: options.activeIndex === 1
                });
            }
        };

        if (component === 'videoList') {
            return (
                <Tabs {...tabsProps} >
                    <TabPanel order="0" tab={'视频列表'}>
                        <VideoList {...publicProps} {...videoListPorps}/>
                    </TabPanel>
                </Tabs>
            );
        } else if (component === 'uploadList') {
            return (
                <Tabs {...tabsProps} >
                    <TabPanel order="0" tab={'上传列表'}>
                        <UploadList {...publicProps} {...uploadListPorps} />
                    </TabPanel>
                </Tabs>
            );
        } else {
            return (
                <Tabs {...tabsProps} >
                    <TabPanel order="0" tab={'上传列表'}>
                        <UploadList {...publicProps} {...uploadListPorps} />
                    </TabPanel>
                    <TabPanel order="1" tab={'视频列表'}>
                        <VideoList {...publicProps} {...videoListPorps}/>
                    </TabPanel>
                </Tabs>
            );
        }
    }
}

ReactDom.render(<UploadModal />, document.getElementById('polyv-upload'));

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

window.userData = null;

class UploadModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            BASE_URL: {
                getVideoList: '//v.polyv.net/uc/services/rest',
                getLatestPic: '//v.polyv.net/uc/video/recentFirstImages',
                getCategory: '//v.polyv.net/uc/cata/listjson',
            },
            // userData: null,
            cataOptions: null,
            videoListIsClicked: false,
        };
    }

    fetchCategory() {
        let userData = window.userData;
        utils.jsonp({
            url: this.state.BASE_URL.getCategory,
            data: {
                cataid: userData.cataid || 1,
                userid: userData.userid
            },
            done: data => {
                let options = {};
                if (userData.cataid.toString() === '1') {
                    options[1] = '默认分类';
                }
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

    componentDidMount() {
        utils.addHander(window, 'message', event => {
            let dataStr = event.data,
                data = typeof dataStr === 'string' && JSON.parse(dataStr);
            if (!data || data.source !== 'polyv-upload') {
                return;
            }
            window.userData = {
                sign: data.sign,
                userid: data.userid,
                hash: data.hash,
                ts: data.ts,
                url: data.url,
                cataid: data.cataid,
                luping: data.luping,
                extra: data.extra,
            };
            if (!this.state.cataOptions) {
                this.fetchCategory();
            }
            // this.setState({
            //     userData: userData,
            // });
        });
    }

    render() {
        let {
            BASE_URL,
            // userData,
            cataOptions,
            videoListIsClicked,
        } = this.state;

        let publicProps = {
            BASE_URL,
            // userData,
        };
        let uploadListPorps = {
            cataOptions,
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

ReactDom.render(<UploadModal />, document.getElementById('polyv-upload'));

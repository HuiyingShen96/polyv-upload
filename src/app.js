'use strict';
import React, {
    Component
} from 'react';
import ReactDom from 'react-dom';

import Tabs from './components/Tabs/Tabs';
import TabPanel from './components/Tabs/TabPanel';

import VideoList from './views/videoList/videoList';
import UploadList from './views/uploadList/uploadList';

import './base.scss';

class UploadModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            BASE_URL: {
                getVideoList: 'http://v.polyv.net/uc/services/rest',
                getLatestPic: 'http://v.polyv.net/uc/video/recentFirstImages',
                getCategory: 'http://v.polyv.net/uc/cata/listjson',
            },
            returnToList: true,
        };
    }

    render() {
        let {
            BASE_URL,
            returnToList
        } = this.state;

        let publicProps = {
            BASE_URL,
        };
        let videoListPorps = {
            returnToList,
        };
        let tabsProps = {
            defaultActiveIndex: 0,
            onChange: options => {
                this.setState({
                    returnToList: options.activeIndex === 1
                });
            }
        };
        return (
            <Tabs {...tabsProps} >
                <TabPanel order="0" tab={'上传列表'}>
                    <UploadList {...publicProps} />
                </TabPanel>
                <TabPanel order="1" tab={'视频列表'}>
                    <VideoList {...publicProps} {...videoListPorps}/>
                </TabPanel>
            </Tabs>
        );
    }
}

ReactDom.render(<UploadModal />, document.getElementById('polyv-upload'));

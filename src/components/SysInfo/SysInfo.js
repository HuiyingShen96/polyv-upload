import React, {
    Component
} from 'react';
import PropTypes from 'prop-types';
import './sysInfo.scss';

export default class SysInfo extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {
            sysInfo,
            visible,
        } = this.props;

        return (
            <div className="sysInfoWrap" style={{display: visible ? 'block' : 'none'}}>
                <div className="sysInfo">
                    <span>{sysInfo}</span>
                </div>
            </div>
        );
    }
}
SysInfo.propTypes = {
    visible: PropTypes.bool,
    sysInfo: PropTypes.string,
};
SysInfo.defaultProps = {
    visible: false,
    sysInfo: '',
};

import React, {
    Component
} from 'react';
import PropTypes from 'prop-types';
import './confirm.scss';
import Button from '../Button/Button.js';

export default class Confirm extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {
            confirmInfo,
            visible,
            title,
        } = this.props;

        return (
            <div className="confirmWrap" style={{display: visible ? 'block' : 'none'}}>
                <div className="confirm">
                    <div className="confirm-title">
                        <p>{title}</p>
                    </div>
                    <div className="confirm-content">
                        <span>{confirmInfo}</span>
                    </div>
                    <div className="confirm-btn-group">
                        <Button visible={true} defaultValue="确认" onClick={() => this.props.onClick(true)} />
                        <Button visible={true} defaultValue="取消" onClick={() => this.props.onClick(false)} className="cancel" />
                    </div>
                </div>
            </div>
        );
    }
}
Confirm.propTypes = {
    visible: PropTypes.bool,
    confirmInfo: PropTypes.string,
    onClick: PropTypes.func,
    title: PropTypes.string,
};
Confirm.defaultProps = {
    visible: false,
    confirmInfo: '',
    title: '系统提示',
    onClick: () => {}
};

import React from 'react';
import './uploadButton.scss';
import PropTypes from 'prop-types';
import classnames from 'classnames';

export default class UploadButton extends React.Component {
    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(event) {
        if (this.props.disabled) {
            return;
        }
        if (this.props.onChange instanceof Function) {
            this.props.onChange(event.target.files);
        }
    }

    render() {


        let {
            value,
            name,
            theme,
            disabled,
            visible,
            className,
            accept,
            multiple,
        } = this.props;

        let wrapProps = {
            className: classnames('btn-upload', theme, className, {
                'disabled': disabled
            }),
            style: {
                display: visible ? 'inline-block' : 'none'
            },
        };
        let inputProps = {
            disabled: disabled ? 'disabled' : false,
            onChange: this.handleChange,
            type: 'file',
            name: name,
            accept,
            multiple,
        };
        return (
            <a href="javascript:;" {...wrapProps}>
                {value}
                <input {...inputProps}/>
            </a>
        );
    }
}
UploadButton.propTypes = {
    value: PropTypes.string, // 按钮的value
    name: PropTypes.string, // 按钮的name
    theme: PropTypes.oneOf([ // 主题
        'primary',
        'default',
        'info'
    ]),
    onChange: PropTypes.func,
    disabled: PropTypes.bool, // 按钮是否无效
    visible: PropTypes.bool, // 按钮是否可见
    className: PropTypes.string, //按钮自定义样式
    accept: PropTypes.string,
    multiple: PropTypes.bool,
};
UploadButton.defaultProps = {
    value: '',
    name: '',
    theme: 'default',
    onChange: () => {},
    disabled: false,
    visible: true,
    className: '',
    accept: '*/*',
    multiple: true
};

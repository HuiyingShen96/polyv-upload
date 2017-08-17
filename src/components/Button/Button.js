import React from 'react';
import './button.scss';
import PropTypes from 'prop-types';
import classnames from 'classnames';

export default class Button extends React.Component {
    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick(event) {
        if (this.props.disabled) {
            return;
        }
        if (this.props.onClick instanceof Function) {
            this.props.onClick(event);
        }
    }

    render() {
        let {
            disabled,
            visible,
            theme,
            className,
            value,
            defaultValue,
        } = this.props;

        let props = {
            className: classnames('button', theme, className, {
                'disabled': disabled
            }),
            style: {
                display: visible ? 'inline-block' : 'none'
            },
            disabled: disabled ? 'disabled' : false,
            onClick: this.handleClick,
            type: 'button'
        };
        if (defaultValue) {
            return (
                <input {...props} defaultValue={defaultValue}/>
            );
        } else {
            return (
                <input {...props} value={value}/>
            );
        }

    }
}
Button.propTypes = {
    value: PropTypes.string, // 按钮的value
    defaultValue: PropTypes.string, // 与value相比，react组件更新时，该值不存在后续的更新 
    name: PropTypes.string, // 按钮的name
    theme: PropTypes.oneOf([ // 主题
        'primary',
        'default',
        'info'
    ]),
    onClick: PropTypes.func,
    disabled: PropTypes.bool, // 按钮是否无效
    visible: PropTypes.bool, // 按钮是否可见
    className: PropTypes.string, //按钮自定义样式
};
Button.defaultProps = {
    value: '',
    defaultValue: '',
    name: '',
    theme: 'default',
    onClick: () => {},
    disabled: false,
    visible: true,
    className: '',
};

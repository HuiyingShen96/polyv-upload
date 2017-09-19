import React, {
    Component
} from 'react';
import PropTypes from 'prop-types';
import './select.scss';
import classnames from 'classnames';

export default class Select extends Component {
    constructor(props) {
        super(props);

        this.handleTitleClick = this.handleTitleClick.bind(this);
        this.handleContentClick = this.handleContentClick.bind(this);

        this.state = {
            defaultText: this.props.defaultText,
            focus: false,
            value: '',
        };
    }

    handleTitleClick() {
        if (this.state.disabled) {
            return;
        }
        this.setState({
            focus: !this.state.focus
        });
    }
    handleContentClick(value) {
        if (value === '' || this.state.disabled) {
            return;
        }
        this.setState({
            value,
            focus: false,
        });
        this.props.onChange(value);
    }
    getOptions(optionList) {
        let options = [];
        for (let key in optionList) {
            if (optionList.hasOwnProperty(key)) {
                options.push(<option value={key}>{optionList[key]}</option>);
            }
        }
        return options;
    }

    render() {
        const {
            defaultText,
            focus,
            value,
        } = this.state;
        const {
            options,
            theme,
            disabled,
            visible,
            className,
        } = this.props;

        let text = value === '' ? defaultText : options[value].replace(/^(-- )*/g, '');
        let wrapClassName = classnames('btn-select', {
            'hide': !visible,
            'disabled': disabled,
            'focus': focus,
        }, theme, className);

        return (
            <div className={wrapClassName}>
                <div className="title" onClick={this.handleTitleClick}>{text}<i className="fa fa-caret-down" aria-hidden="true"></i></div>
                <div className="content">
                    <ul>
                        {options && Object.keys(options).map((key, index) => { 
                            return (
                                <li onClick={this.handleContentClick.bind(this, key)} key={index}>
                                    {options[key]}
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>
        );
    }
}
Select.propTypes = {
    value: PropTypes.string,
    options: PropTypes.object,
    theme: PropTypes.oneOf([
        'primary',
        'default',
        'info'
    ]),
    onChange: PropTypes.func,
    disabled: PropTypes.bool,
    visible: PropTypes.bool,
    className: PropTypes.string,
};
Select.defaultProps = {
    value: '',
    options: null,
    theme: 'default',
    onChange: () => {},
    disabled: false,
    visible: true,
    className: '',
};

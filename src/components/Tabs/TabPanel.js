import React, {
    Component,
    cloneElement
} from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

export default class TabPanel extends Component {
    render() {
        const {
            classPrefix,
            className,
            isActive,
            children
        } = this.props;

        const classes = classnames({
            [className]: className,
            [`${classPrefix}-panel`]: true,
            [`${classPrefix}-active`]: isActive,
        });

        return (
            <div
                role="tabpanel"
                className={classes}
                aria-hidden={!isActive}>
                {children}
            </div>
        );
    }
}
TabPanel.propTypes = {
    className: PropTypes.string,
    tab: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.node,
    ]).isRequired,
    order: PropTypes.string.isRequired,
    disable: PropTypes.bool,
    isActive: PropTypes.bool,
};

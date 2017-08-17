import React, {
    Component
} from 'react';
import PropTypes from 'prop-types';
import './tabs.scss';
import TabNav from './TabNav';
import TabContent from './TabContent';

export default class Tabs extends Component {
    constructor(props) {
        super(props);

        this.handleTabClick = this.handleTabClick.bind(this);

        const curProps = this.props;

        let activeIndex;
        if ('activeIndex' in curProps) {
            activeIndex = curProps.activeIndex;
        } else if ('defaultActiveIndex' in curProps) {
            activeIndex = curProps.defaultActiveIndex;
        }

        this.state = {
            activeIndex
        };
    }

    componentWillReceiveProps(nextProps) {
        if ('activeIndex' in nextProps) {
            this.setState({
                activeIndex: nextProps.activeIndex
            })
        }
    }

    handleTabClick(activeIndex) {

        // 如果当前 activeIndex 与传入的 activeIndex 不一致，
        // 并且 props 中存在 defaultActiveIndex 时，则更新
        if (this.state.activeIndex !== activeIndex && 'defaultActiveIndex' in this.props) {
            this.setState({
                activeIndex
            })
        }

        this.props.onChange({
            activeIndex

        });
    }

    renderTabNav() {
        const {
            classPrefix,
            children
        } = this.props;
        const props = {
            key: 'tabBar',
            classPrefix,
            onTabClick: this.handleTabClick,
            panels: children,
            activeIndex: this.state.activeIndex
        }

        return (
            <TabNav {...props} />
        );
    }

    renderTabContent() {
        const {
            classPrefix,
            children
        } = this.props;
        const props = {
            key: 'tabContent',
            classPrefix,
            activeIndex: this.state.activeIndex,
            panels: children
        }

        return (
            <TabContent {...props} />
        );
    }

    render() {
        let {
            className
        } = this.props;
        className += ' ui-tabs';

        return (
            <div className={className}>
                {this.renderTabNav()}
                {this.renderTabContent()}
            </div>
        );
    }
}
Tabs.propTypes = {
    className: PropTypes.string,
    classPrefix: PropTypes.string,
    children: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.node),
        PropTypes.node
    ]),
    defaultActiveIndex: PropTypes.number, // 默认激活索引，组件内更新
    activeIndex: PropTypes.number, // 默认激活索引，组件外更新
    onChange: PropTypes.func, // 切换时回调函数
};
Tabs.defaultProps = {
    classPrefix: 'tabs',
    onChange: () => {}
};

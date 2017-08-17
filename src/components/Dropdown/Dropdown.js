import React from 'react';
import PropTypes from 'prop-types';
import './dropdown.scss';

export default class Dropdown extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            visibile: this.props.visibile,
            selected: this.props.selected,
            dataList: this.props.dataList,
        }
    }

    clickHandler() {
        this.setState({
            visible: !this.state.visible
        });
    }

    render() {
        let display = this.state.visible ? 'block' : 'none';
        let dataList = this.props.dataList || [];
        if (typeof dataList === 'object' && !Array.isArray(dataList)) {
            dataList = Object.keys(dataList).map(key => {
                return {
                    name: dataList[key],
                    value: key
                }
            })
        }
        dataList = dataList.map(o => typeof o === 'string' ? {
            name: o,
            value: o
        } : o);
        let selected = this.state.selected;
        let title = dataList.find(o => o.value === selected);
        title = title && title.name || '';

        return (
            <select name={this.props.name} id={this.props.id}>
                {
                    dataList.map((data, index) => {
                        return <option key={index} value={data.value}>{data.name}</option>
                    })
                }
            </select>
        );
    }
}
Dropdown.propTypes = {
    selected: PropTypes.string, // 当前选择的value值
    title: PropTypes.string, // 下拉列表的名称
    dataList: PropTypes.oneOfType([ // 下拉列表的选项列表
        PropTypes.object,
        PropTypes.array
    ]),
    visible: PropTypes.bool,
    name: PropTypes.string,
    id: PropTypes.string
};

Dropdown.defaultProps = {
    visible: false,
    selected: null,
};

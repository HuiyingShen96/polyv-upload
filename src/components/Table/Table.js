import React, {
    Component
} from 'react';
import PropTypes from 'prop-types';
import './table.scss';
import classnames from 'classnames';

export default class Table extends Component {
    constructor(props) {
        super(props);
    }

    get_tHead(theadData) {
        let tHeadList = [];
        for (let key in theadData) {
            if (theadData.hasOwnProperty(key)) {
                tHeadList.push((
                    <th data-name={key} key={key} className={key}>{theadData[key]}</th>
                ));
            }
        }
        return <tr>{tHeadList}</tr>;
    }
    get_tBody(tbodyData) {
        if (!(tbodyData instanceof Array)) {
            return false;
        }
        return tbodyData.map((trInfo, index) => {
            let trHtml = [];
            for (let key in trInfo) {
                if (trInfo.hasOwnProperty(key)) {
                    let className = classnames(key);
                    trHtml.push(<td key={key} className={className}>{trInfo[key]}</td>);
                }
            }
            return (
                <tr 
                    key={index} 
                    onClick={() => this.props.onTrClick(index)}
                    className={this.props.trClickable ? 'clickable' : ''} >
                    {trHtml}
                </tr>
            );
        });
    }

    render() {
        const {
            visible,
            theadData,
            tbodyData,
        } = this.props;

        return (
            <table className='table' style={visible ? null : {display: 'none'}}>
                <thead>
                    {this.get_tHead(theadData)}
                </thead>
                <tbody>
                    {this.get_tBody(tbodyData)}
                </tbody>
            </table>
        );
    }
}
Table.propTypes = {
    visible: PropTypes.bool,
    theadData: PropTypes.object,
    tbodyData: PropTypes.arrayOf(PropTypes.object),
    trClickable: PropTypes.bool,
    onTrClick: PropTypes.func,
};
Table.defaultProps = {
    visible: true,
    theadData: null,
    tbodyData: null,
    trClickable: false,
    onTrClick: () => {},
};

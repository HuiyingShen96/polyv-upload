import React, {
    Component
} from 'react';
import PropTypes from 'prop-types';
import './searchBar.scss';

export default class SearchBar extends Component {
    constructor(props) {
        super(props);

        this.handleTextChange = this.handleTextChange.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);

        this.state = {
            searchKeyword: props.searchKeyword,
        }
    }
    handleTextChange(e) {
        this.setState({
            searchKeyword: e.target.value,
        });
    }
    handleKeyDown(e) {
        if (e.which === 13) {
            this.props.onClick(this.state.searchKeyword.trim());
        }
    }
    componentWillReceiveProps(nextProps) {
        this.setState({
            searchKeyword: nextProps.searchKeyword,
        });
    }
    render() {
        let {
            className,
            style,
            onClick,
        } = this.props;
        let {
            searchKeyword,
        } = this.state;
        className += ' searchBar';

        return (
            <div className={className} style={style}>
    			<input type="text" placeholder="Search for..." className="inputBox" 
	    			onChange={this.handleTextChange} 
	    			value={searchKeyword} 
	    			onKeyPress={this.handleKeyDown} />
    			<input type="submit" value="搜索" className="searchBtn" onClick={() => onClick(searchKeyword.trim())} />
    		</div>
        );
    }
}
SearchBar.propTypes = {
    className: PropTypes.string,
    style: PropTypes.object,
    onClick: PropTypes.func,
    searchKeyword: PropTypes.string,
};
SearchBar.defaultProps = {
    className: '',
    style: {},
    onClick: () => {},
    searchKeyword: '',
};

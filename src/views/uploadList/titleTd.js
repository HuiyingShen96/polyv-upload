import React, {
    Component
} from 'react';
import PropTypes from 'prop-types';

export default class TitleTd extends Component {
    constructor(props) {
        super(props);

        this.handleClick = this.handleClick.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.handleBlur = this.handleBlur.bind(this);

        let {
            title,
        } = this.props;
        this.state = {
            title: title,
            inputBoxVisible: false,
        };
    }
    handleClick() {
        if (this.props.uploading) {
            return;
        }
        this.setState({
            inputBoxVisible: true,
        });
    }
    handleChange(e) {
        this.setState({
            title: e.target.value,
        });
    }
    handleKeyPress(e) {
        if (e.which === 13) {
            e.target.blur();
        }
    }
    handleBlur() {
        this.props.setFileOptions({
            name: 'title',
            value: this.state.title,
            index: this.props.index,
        });
        this.setState({
            inputBoxVisible: false,
        });
    }

    componentDidUpdate() {
        this.state.inputBoxVisible && this.inputBox.focus();
    }
    componentWillReceiveProps(nextProps) {
        this.setState({
            title: nextProps.title,
        });
    }

    render() {
        let {
            inputBoxVisible,
            title,
        } = this.state;
        let {
            uploading,
        } = this.props;
        title = title.replace(/\.\w+$/, '');

        return (
            <div>
                <div style={{display: inputBoxVisible ? 'none': 'block'}}>
                    <div className="fileTitle">{title}</div>
                    <i onClick={this.handleClick} className="fa fa-pencil" aria-hidden="true"
                        style={{visibility: uploading ? 'hidden' : 'visible'}}></i>
                </div>
                <input type='text' value={title} disabled={uploading ? 'disabled' : false}
                    ref={node => {this.inputBox = node;}}
                    style={{display: inputBoxVisible?'inline-block': 'none'}}
                    onChange={this.handleChange} 
                    onBlur={this.handleBlur}
                    onKeyPress={this.handleKeyPress} />
			</div>
        );
    }
}
TitleTd.propTypes = {
    title: PropTypes.string.isRequired,
    index: PropTypes.number.isRequired,
    setFileOptions: PropTypes.func.isRequired,
    uploading: PropTypes.bool.isRequired,
};
TitleTd.defaultProps = {

};

TitleTd.inputBox = null;

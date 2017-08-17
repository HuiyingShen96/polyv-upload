import React, {
    Component
} from 'react';
import PropTypes from 'prop-types';

export default class DescTd extends Component {
    constructor(props) {
        super(props);

        this.handleChange = this.handleChange.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.handleBlur = this.handleBlur.bind(this);

        this.state = {
            desc: this.props.desc,
        };
    }
    handleChange(e) {
        this.setState({
            desc: e.target.value,
        });
    }
    handleKeyPress(e) {
        if (e.which === 13) {
            e.target.blur();
        }
    }
    handleBlur() {
        this.props.setFileOptions({
            name: 'desc',
            value: this.state.desc,
            index: this.props.index,
        });
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            desc: nextProps.desc,
        });
    }

    render() {
        let desc = this.state.desc;

        return (
            <textarea rows='2' placeholder='添加描述' ref={node => this.inputBox = node}
                onChange={this.handleChange}
                onKeyPress={this.handleKeyPress}
                onBlur={this.handleBlur}
                disabled={this.props.uploading} value={desc} />
        );
    }
}
DescTd.propTypes = {
    setFileOptions: PropTypes.func.isRequired,
    desc: PropTypes.string.isRequired,
    uploading: PropTypes.bool.isRequired,
    index: PropTypes.number.isRequired,
};
DescTd.defaultProps = {};

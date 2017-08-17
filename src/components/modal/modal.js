import React from 'react';
import './modal.scss';
import PropTypes from 'prop-types';

export default class Modal extends React.Component {
    static propTypes = {
        width: PropTypes.number,
        height: PropTypes.number,
        closeHandler: PropTypes.func,
        children: PropTypes.element.isRequired,
    };

    static defaultProps = {
        width: 1000,
        height: 600,
    };
    constructor(props) {
        super(props);
        this.state = {
            visible: false,
            width: this.props.width,
            height: this.props.height,
        };

        this.handleCloseClick = this.handleCloseClick.bind(this);
        this._closeModal = this._closeModal.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            visible: nextProps.visible
        });
    }

    handleCloseClick() {
        this._closeModal();
    }
    _closeModal() {
        this.setState({
            visible: false
        });
        if (this.props.modalControl instanceof Function) {
            this.props.modalControl();
        }
    }

    open() {
        this.setState({
            visible: true
        })
    }

    render() {
        let activeName = 'modal';
        if (this.state.visible) {
            activeName = 'modal active';
        }
        let width = this.state.width,
            height = this.state.height,
            modalStyle = {
                width: this.state.width,
                height: this.state.height
            };

        return (
            <div className={activeName} style={{display: this.state.visible ? 'block' : 'none'}} >
                <div className="mainWrap" style={modalStyle}>
                    <div className="header">
                        <div className="close" onClick={this.handleCloseClick}>×</div>
                    </div>
                    <div className="main">
                        {this.props.children}
                    </div>
                </div>
            </div>
        );
    }
}

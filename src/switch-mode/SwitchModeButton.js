import Component from '../base/Component';

export default class SwitchModeButton extends Component {
    init() {
        const { isDayMode } = this.props;

        this.state = { isDayMode };
        this.element.onclick = this.onClick.bind(this);
    }

    onClick() {
        this.state.isDayMode = !this.state.isDayMode;

        this.props.onSwitchMode(this.state.isDayMode);

        this.rerender();
    }

    render() {
        if (this.state.isDayMode) {
            document.body.style.backgroundColor = '#FFFFFF';
            this.element.innerText = 'Switch to Night Mode';
        } else {
            document.body.style.backgroundColor = '#262F3E';
            this.element.innerText = 'Switch to Day Mode';
        }
    }
}

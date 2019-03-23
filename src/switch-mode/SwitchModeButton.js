import Component from '../base/Component';

export default class SwitchModeButton extends Component {
    init() {
        const { isDayMode } = this.props;

        this.state = { isDayMode };
        this.onClick = this.onClick.bind(this);
        this.element.addEventListener('click', this.onClick);
    }

    destroy() {
        this.element.removeEventListener('click', this.onClick);
    }

    onClick() {
        this.state.isDayMode = !this.state.isDayMode;

        this.props.onSwitchMode(this.state.isDayMode);

        this.rerender();
    }

    render() {
        const { isDayMode } = this.state;

        document.body.style.backgroundColor = isDayMode ? '#FFFFFF' : '#262F3E';
        this.element.innerText = isDayMode ? 'Switch to Night Mode' : 'Switch to Day Mode';
    }
}

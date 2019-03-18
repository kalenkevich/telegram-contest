import { animate } from '../utils';
import CanvasComponent from '../base/CanvasComponent';
import AnimationEffects from '../animation/Effects';

export default class ChartGraphic extends CanvasComponent {
    init() {
        const { lineSets } = this.props;

        this.state = { lineSets };
        this.prevState = { lineSets };
    }

    get canAnimate() {
        const result = this.prevState.lineSets !== this.state.lineSets;

        this.prevState.lineSets = this.state.lineSets;

        return result;
    }

    onLineSetsChanged(lineSets) {
        this.state.lineSets = lineSets;

        this.rerender();
    }

    render() {
        super.render();

        if (this.state.isAnimationInProgress) {
            return;
        }

        const { animationType = 'none' } = this.props;
        const withAnimation = this.canAnimate && animationType !== 'none';

        false ? this.renderWithAnimation() : this.renderWithoutAnimation();
    }

    renderWithoutAnimation() {
        const { lineWidth, options: { axis: { xAxisType }, pixelRatio } } = this.props;
        const { lineSets } = this.state;

        this.context.lineWidth = lineWidth * pixelRatio;

        for (let j = 0; j < lineSets[0].lines.length; j++) {
            for (let i = 0; i < lineSets.length; i++) {
                if (lineSets[i].name !== xAxisType) {
                    const line = lineSets[i].lines[j];
                    const path = new Path2D();

                    this.context.strokeStyle = lineSets[i].color;

                    path.moveTo(line.x1, line.y1);
                    path.lineTo(line.x2, line.y2);

                    this.context.stroke(path);
                }
            }
        }
    }

    renderWithAnimation() {
        const {
            lineWidth,
            options: { axis: { xAxisType }, pixelRatio },
            animationType,
            animationDuration,
        } = this.props;

        animate({
            onAnimationStarted: () => this.state.isAnimationInProgress = true,
            onAnimationFinished: () => this.state.isAnimationInProgress = false,
            duration: animationDuration,
            timing: (timeFraction) => {
                const { lineSets } = this.state;
                const progress = AnimationEffects[animationType](timeFraction);

                const newLinesState = [];
                for (let j = 0; j < lineSets[0].lines.length; j++) {
                    for (let i = 0; i < lineSets.length; i++) {
                        if (lineSets[i].name !== xAxisType) {
                            newLinesState.push({
                                line: lineSets[i].lines[j],
                                color: lineSets[i].color,
                                progress,
                            });
                        }
                    }
                }

                this.rerender();

                return newLinesState;
            },
            draw: (linesState) => {
                this.context.lineWidth = lineWidth * pixelRatio;

                (linesState || []).forEach((lineState) => {
                    const { line, color } = lineState;
                    const path = new Path2D();

                    path.moveTo(line.x1 * (1 / lineState.progress), line.y1);
                    path.lineTo(line.x2 * (1 / lineState.progress), line.y2);

                    this.context.strokeStyle = color;
                    this.context.stroke(path);
                });
            },
        });
    }
}

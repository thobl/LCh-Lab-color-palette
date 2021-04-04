import React from 'react'
import { ColorHLC, ColorLAB, HLC_to_CSS, HLC_to_LAB, LAB_to_CSS, LAB_to_HLC } from './Color'
import Circle from './Circle'
import ColorInput from './ColorInput';

interface PaletteProps {
}

interface PaletteState {
  colors: Array<ColorHLC>;
  drawHLC: boolean;
  n_base: number;
  n: number;
  offset: number;
  L: number;
  C: number;
}

// dimensions of the canvas
const w: number = 600;
const h: number = 600;
// max radius of a disk
const r: number = 30;

class Palette extends React.Component<PaletteProps, PaletteState> {
  constructor(props: PaletteProps) {
    super(props);
    this.state = {
      colors: [{ H: 0, L: 100, C: 0 }, { H: 0, L: 30, C: 0 }],
      drawHLC: false,
      n_base: 2,
      n: 8,
      offset: 0.8,
      L: 50,
      C: 90
    };
    const n: number = this.state.n;
    for (let i = 0; i < n; i++) {
      this.state.colors.push({
        H: -180 + (i + this.state.offset) * 360 / n,
        L: this.state.L,
        C: this.state.C
      });
    }
  }

  private x(color: ColorHLC): number {
    if (this.state.drawHLC) {
      const H: number = color.H;
      return (H + 180) / 360 * (w - 2 * r) + r;
    }
    return (HLC_to_LAB(color).a + 128) / 255 * (w - 2 * r) + r;
  }

  private y(color: ColorHLC): number {
    if (this.state.drawHLC) {
      const C: number = color.C;
      return C / 181 * (h - 2 * r) + r;
    }

    return (HLC_to_LAB(color).b + 128) / 255 * (h - 2 * r) + r;
  }

  private r(color: ColorHLC): number {
    const min: number = 10;
    return color.L / 100 * (r - min) + min;
  }

  render(): JSX.Element {
    let id: number = 0;
    const circles = this.state.colors.map((color: ColorHLC): JSX.Element => {
      const css_color: string = HLC_to_CSS(color);
      return (<Circle key={`circle_${id++}`} x={this.x(color)} y={this.y(color)}
        r={this.r(color)} color={css_color} />);
    });

    id = 0;
    const inputs = this.state.colors.map(() => {
      const handler = (colors: Array<ColorHLC>) => {
        this.setState({ colors: colors });
      };
      return (<ColorInput key={`input_${id}`} colors={this.state.colors} id={id++} handler={handler} />);
    });

    return (
      <div style={{ display: 'flex' }}>
        <div>
          <div className="CircleBox" style={{ width: w + 'px', height: h + 'px' }}>
            {circles}
          </div>
          <input name='drawHLC' type='checkbox' checked={this.state.drawHLC} onChange={(e) => this.setState({ ['drawHLC']: e.target.checked })} />
          <label htmlFor='drawHLC'>draw as HLC (LAB otherwise)</label>
        </div>
        <div>
          {inputs}
        </div>
      </div>
    );
  }

}

// min and max are inclusive
function randomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max) + 1;
  return Math.floor(Math.random() * (max - min) + min);
}

export default Palette;

import React from 'react'
import { ColorHLC, ColorLAB, HLC_to_LAB, LAB_to_CSS, LAB_to_HLC } from './Color'
import Circle from './Circle'
import ColorInput from './ColorInput';

interface PaletteProps {
}

interface PaletteState {
  colors: Array<ColorLAB>;
  drawHLC: boolean;
  n_base: number;
  n: number;
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
      colors: [{ L: 100, a: 0, b: 0 }, { L: 30, a: 0, b: 0 }],
      drawHLC: false,
      n_base: 2,
      n: 8
    };
    const n: number = this.state.n;
    for (let i = 0; i < n; i++) {
      const hlc: ColorHLC = {
        H: -180 + (i + 0.8) * 360 / n,
        L: 50,
        C: 90
      }
      this.state.colors.push(
        HLC_to_LAB(hlc)
      );
    }
  }

  private x(color: ColorLAB): number {
    if (this.state.drawHLC) {
      const H: number = LAB_to_HLC(color).H;
      return (H + 180) / 360 * (w - 2 * r) + r;
    }
    return (color.a + 128) / 255 * (w - 2 * r) + r;
  }

  private y(color: ColorLAB): number {
    if (this.state.drawHLC) {
      const C: number = LAB_to_HLC(color).C;
      return C / 181 * (h - 2 * r) + r;
    }

    return (color.b + 128) / 255 * (h - 2 * r) + r;
  }

  private r(color: ColorLAB): number {
    const min: number = 10;
    return color.L / 100 * (r - min) + min;
  }

  render(): JSX.Element {
    let id: number = 0;
    const circles = this.state.colors.map((color: ColorLAB) => {
      const css_color: string = LAB_to_CSS(color);
      return (<Circle key={'cirlce_' + id++} x={this.x(color)} y={this.y(color)}
        r={this.r(color)} color={css_color} />);
    });

    id = 0;
    const inputs = this.state.colors.map(() => {
      const handler = (colors: Array<ColorLAB>) => {
        this.setState({ colors: colors });
      };
      return (<ColorInput key={'input_' + id} colors={this.state.colors} id={id++} handler={handler} />);
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

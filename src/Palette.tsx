import React from 'react'
import { ColorLCh, LCh_to_CSS, LCh_to_Hex, LCh_to_Lab } from './Color'
import Circle from './Circle'
import ColorInput from './ColorInput';

interface PaletteProps {
}

interface PaletteState {
  colors: Array<ColorLCh>;
  drawLCh: boolean;
  colorStroke: boolean;
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
      colors: [],
      drawLCh: false,
      colorStroke: false,
      n_base: 2,
      n: 6,
      // n_base: 10,
      // n: 0,
      offset: 0.33333,
      L: 40,
      C: 60
    };
  }

  private x(color: ColorLCh): number {
    if (this.state.drawLCh) {
      const H: number = color.h;
      return (H + 180) / 360 * (w - 2 * r) + r;
    }
    return (LCh_to_Lab(color).a + 128) / 255 * (w - 2 * r) + r;
  }

  private y(color: ColorLCh): number {
    if (this.state.drawLCh) {
      const C: number = color.C;
      return C / 181 * (h - 2 * r) + r;
    }

    return (LCh_to_Lab(color).b + 128) / 255 * (h - 2 * r) + r;
  }

  private r(color: ColorLCh): number {
    const min: number = 10;
    return color.L / 100 * (r - min) + min;
  }

  componentDidMount() {
    this.initializeColors();
  }

  componentDidUpdate(prevProps: PaletteProps, prevState: PaletteState) {
    if (prevState.n !== this.state.n
      || prevState.n_base !== this.state.n_base
      || prevState.offset !== this.state.offset) {
      this.initializeColors();
    }
    if (prevState.L !== this.state.L) {
      this.setColorPropertyAllExceptBase('L', this.state.L);
    }
    if (prevState.C !== this.state.C) {
      this.setColorPropertyAllExceptBase('C', this.state.C);
    }
  }

  private setColorPropertyAllExceptBase(prop: keyof ColorLCh, value: number) {
    let colors: Array<ColorLCh> = [...this.state.colors];
    for (let i = this.state.n_base; i < colors.length; i++) {
      colors[i][prop] = value;
    }
    this.setState({ ['colors']: colors });
  }

  private initializeColors() {
    let colors: Array<ColorLCh> = [];
    const n_base = this.state.n_base;
    const minL = 20;
    for (let i = n_base; i > 0; i--) {
      colors.push({
        h: -90, L: minL + (i - 1) * (100 - minL) / (n_base - 1), C: 7
      })
    }
    const n: number = this.state.n;
    for (let i = 0; i < n; i++) {
      colors.push({
        h: -180 + (i + this.state.offset) * 360 / n,
        L: this.state.L,
        C: this.state.C
      });
    }
    this.setState({ ['colors']: colors });
  }

  render(): JSX.Element {
    let id: number = 0;
    const circles = this.state.colors.map((color: ColorLCh): JSX.Element => {
      const css_color: string = LCh_to_CSS(color);
      return (<Circle key={`circle_${id++}`} x={this.x(color)} y={this.y(color)}
        r={this.r(color)} color={css_color} colorStroke={this.state.colorStroke} />);
    });

    id = 0;
    const inputs = this.state.colors.map(() => {
      const handler = (colors: Array<ColorLCh>) => {
        this.setState({ colors: colors });
      };
      return (<ColorInput key={`input_${id}`} colors={this.state.colors} id={id++} handler={handler} />);
    });

    const hexOutput = this.state.colors.map((color: ColorLCh): JSX.Element => {
      return (<div>{LCh_to_Hex(color)}</div>);
    });

    return (
      <div style={{ display: 'flex' }}>
        <div>
          <div className='CircleBox' style={{ width: w + 'px', height: h + 'px' }}>
            {circles}
          </div>
          <div className='row'>
            <input type='checkbox' checked={this.state.drawLCh}
              onChange={(e) => this.setState({ ['drawLCh']: e.target.checked })} />
            <span className='Spacer'> </span> draw as LCh (Lab otherwise)
          </div>
          <div className='row'>
            <input type='checkbox' checked={this.state.colorStroke}
              onChange={(e) => this.setState({ ['colorStroke']: e.target.checked })} />
            <span className='Spacer'> </span> color circle border (instead of interior)
          </div>
          <div className='row'>
            <input className='nInput' type='text' value={this.state.n_base}
              onChange={(e) => this.setState({ ['n_base']: parseInt(e.target.value) })} />
            <span className='Spacer'> </span>
            number of base colors
          </div>
          <div className='row'>
            <input className='nInput' type='text' value={this.state.n}
              onChange={(e) => this.setState({ ['n']: parseInt(e.target.value) })} />
            <span className='Spacer'> </span>
            number of colors
          </div>
          <div className='row'>
            <input className='Slider' type='range' min='0' max='100' value={this.state.L}
              onChange={(e) => this.setState({ ['L']: parseFloat(e.target.value) })} />
            <span className='Spacer'> </span>
            L (lightness)
          </div>
          <div className='row'>
            <input className='Slider' type='range' min='0' max='180' value={this.state.C}
              onChange={(e) => this.setState({ ['C']: parseFloat(e.target.value) })} />
            <span className='Spacer'> </span>
           C (chroma)
          </div>
          <div className='row'>
            <input className='Slider' type='range' min='0' max='100' value={100 * this.state.offset}
              onChange={(e) => this.setState({ ['offset']: parseFloat(e.target.value) / 100 })} />
            <span className='Spacer'> </span>
            h-offset (hue)
          </div>
          {hexOutput}
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

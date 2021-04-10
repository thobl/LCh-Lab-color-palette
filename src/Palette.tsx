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
  base_n: number;
  base_L1: number;
  base_L2: number;
  base_C1: number;
  base_C2: number;
  base_h: number;
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
      base_n: 3,
      base_L1: 100,
      base_L2: 0,
      base_C1: 0,
      base_C2: 0,
      base_h: 0,
      n: 6,
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

  componentDidUpdate(_prevProps: PaletteProps, prevState: PaletteState) {
    if (prevState.n !== this.state.n
      || prevState.base_n !== this.state.base_n
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
    for (let i = this.state.base_n; i < colors.length; i++) {
      colors[i][prop] = value;
    }
    this.setState({ 'colors': colors });
  }

  private initializeColors() {
    let colors: Array<ColorLCh> = [];
    const base_n = this.state.base_n;
    const minL = 20;
    for (let i = base_n; i > 0; i--) {
      colors.push({
        h: -90, L: minL + (i - 1) * (100 - minL) / (base_n - 1), C: 7
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
    this.setState({ 'colors': colors });
  }

  render(): JSX.Element {
    const colors = this.state.colors;

    // drawing the circles
    let id: number = 0;
    const circles = colors.map((color: ColorLCh): JSX.Element => {
      const css_color: string = LCh_to_CSS(color);
      return (<Circle key={`circle_${id++}`} x={this.x(color)} y={this.y(color)}
        r={this.r(color)} color={css_color} colorStroke={this.state.colorStroke} />);
    });

    // controls for the individual colors
    id = 0;
    const inputs = colors.map(() => {
      const handler = (colors: Array<ColorLCh>) => {
        this.setState({ 'colors': colors });
      };
      return (<ColorInput key={`input_${id}`} colors={colors} id={id++} handler={handler} />);
    });

    // output as hex (for copying somewhere)
    id = 0;
    const hexOutput = colors.map((color: ColorLCh): JSX.Element => {
      return (<div key={`hexoutput_${id++}`}>{LCh_to_Hex(color)}</div>);
    });

    // function generating controls for global options
    type numberKeys = Exclude<keyof PaletteState, 'colors' | 'drawLCh' | 'colorStroke'>;
    const inputSlider = (prop: numberKeys, min: number, max: number, label: string, factor: number = 1) => (
      <div className='row'>
        <input className='Slider' type='range' min={min} max={max} value={factor * this.state[prop]}
          onChange={(e) => this.setState({ ...this.state, [prop]: parseFloat(e.target.value) / factor })
          } />
        <span className='Spacer'> </span>
        {label}
      </div>
    );
    const inputNumber = (prop: numberKeys, label: string) => (
      <div className='row'>
        <input className='nInput' type='text' value={this.state[prop]}
          onChange={(e) => this.setState({ ...this.state, [prop]: parseFloat(e.target.value) })
          } />
        <span className='Spacer'> </span>
        {label}
      </div>
    );
    const inputBool = (prop: 'drawLCh' | 'colorStroke', label: string) => (
      <div className='row'>
        <input type='checkbox' checked={this.state[prop]}
          onChange={(e) => this.setState({ ...this.state, [prop]: e.target.checked })
          } />
        <span className='Spacer'> </span>
        {label}
      </div>
    );

    return (
      <div style={{ display: 'flex' }}>
        <div>
          <div className='CircleBox' style={{ width: w + 'px', height: h + 'px' }}>
            {circles}
          </div>
          {inputBool('drawLCh', 'draw as LCh (Lab otherwise)')}
          {inputBool('colorStroke', 'color circle border (instead of interior)')}
          {inputNumber('base_n', 'number of base colors')}
          {inputNumber('n', 'number of colors')}
          {inputSlider('L', 0, 100, 'L (lightness)')}
          {inputSlider('C', 0, 180, 'C (chroma)')}
          {inputSlider('offset', 0, 100, 'h-offset (hue)', 100)}
          {hexOutput}
        </div>
        <div>
          {inputs}
        </div>
      </div>
    );
  }

}

export default Palette;

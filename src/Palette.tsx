import React from 'react'
import { ColorLCh, HLC_to_CSS, HLC_to_LAB } from './Color'
import Circle from './Circle'
import ColorInput from './ColorInput';

interface PaletteProps {
}

interface PaletteState {
  colors: Array<ColorLCh>;
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
      colors: [],
      drawHLC: false,
      n_base: 2,
      n: 8,
      offset: 0.8,
      L: 50,
      C: 90
    };
  }

  private x(color: ColorLCh): number {
    if (this.state.drawHLC) {
      const H: number = color.h;
      return (H + 180) / 360 * (w - 2 * r) + r;
    }
    return (HLC_to_LAB(color).a + 128) / 255 * (w - 2 * r) + r;
  }

  private y(color: ColorLCh): number {
    if (this.state.drawHLC) {
      const C: number = color.C;
      return C / 181 * (h - 2 * r) + r;
    }

    return (HLC_to_LAB(color).b + 128) / 255 * (h - 2 * r) + r;
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
      || prevState.offset !== this.state.offset
      || prevState.L !== this.state.L
      || prevState.C !== this.state.C) {
      this.initializeColors();
    }
  }

  private initializeColors() {
    let colors: Array<ColorLCh> = [];
    const n_base = this.state.n_base;
    for (let i = n_base; i > 0; i--) {
      colors.push({
        h: 0, L: 30 + (i - 1) * 70 / (n_base - 1), C: 0
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
      const css_color: string = HLC_to_CSS(color);
      return (<Circle key={`circle_${id++}`} x={this.x(color)} y={this.y(color)}
        r={this.r(color)} color={css_color} />);
    });

    id = 0;
    const inputs = this.state.colors.map(() => {
      const handler = (colors: Array<ColorLCh>) => {
        this.setState({ colors: colors });
      };
      return (<ColorInput key={`input_${id}`} colors={this.state.colors} id={id++} handler={handler} />);
    });

    return (
      <div style={{ display: 'flex' }}>
        <div>
          <div className='CircleBox' style={{ width: w + 'px', height: h + 'px' }}>
            {circles}
          </div>
          <div className='row'>
            <input type='checkbox' checked={this.state.drawHLC}
              onChange={(e) => this.setState({ ['drawHLC']: e.target.checked })} />
            <span className='Spacer'> </span> draw as HLC (LAB otherwise)
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
            <input className='Slider' type='range' min='0' max='100' value={100 * this.state.offset}
              onChange={(e) => this.setState({ ['offset']: parseFloat(e.target.value) / 100 })} />
            <span className='Spacer'> </span>
            H-offset (hue)
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

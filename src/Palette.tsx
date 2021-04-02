import React from 'react'
import { ColorRGB, ColorLAB, RGB_to_LAB, LAB_to_CSS, LAB_to_HLC } from './Color'
import Circle from './Circle'

interface PaletteProps {
  base: ColorRGB;
  color1: ColorRGB;
  n: number;
}

interface PaletteState {
  colors: Array<ColorLAB>
}

// dimensions of the canvas
const w: number = 600;
const h: number = 600;
// max radius of a disk
const r: number = 30;

// drawing mode
const drawHLC = false;

class Palette extends React.Component<PaletteProps, PaletteState> {
  constructor(props: PaletteProps) {
    super(props);
    this.state = { colors: [RGB_to_LAB(props.base), RGB_to_LAB(props.color1)] }
    for (let i = 1; i < props.n; i++) {
      this.state.colors.push({
        L: randomInt(0, 100),
        a: randomInt(-128, 127),
        b: randomInt(-128, 127)
      });
    }
  }

  private x(color: ColorLAB): number {
    if (drawHLC) {
      const H: number = LAB_to_HLC(color).H;
      return (H + 180) / 360 * (w - 2 * r) + r;
    }
    return (color.a + 128) / 255 * (w - 2 * r) + r;
  }

  private y(color: ColorLAB): number {
    if (drawHLC) {
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
    const items = this.state.colors.map((color: ColorLAB) => {
      const rss_color: string = LAB_to_CSS(color);
      return (<Circle key={"circle_" + rss_color} x={this.x(color)} y={this.y(color)} r={this.r(color)} color={rss_color} />);
    });
    return (
      <div className="Canvas" style={{ position: 'relative', border: '1px solid', width: w + 'px', height: h + 'px' }}>
        {items}
      </div>
    );
  }

  async componentDidMount() {
    return;
    for (let i = 0; i < 100; i++) {
      await sleep(40);
      let colors = this.state.colors;
      for (let color of colors) {
        color.L += randomInt(-2, 2);
        color.L = Math.max(0, Math.min(100, color.L))
        color.a += randomInt(-2, 2);
        color.a = Math.max(-128, Math.min(127, color.a))
        color.b += randomInt(-2, 2);
        color.b = Math.max(-128, Math.min(127, color.b))
      }
      this.setState({ colors: colors });
    }
  }
}

// min and max are inclusive
export function randomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max) + 1;
  return Math.floor(Math.random() * (max - min) + min);
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default Palette;

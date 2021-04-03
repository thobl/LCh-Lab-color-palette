import React from 'react'
import { ColorRGB, ColorLAB, RGB_to_LAB, LAB_to_CSS, LAB_to_HLC, CIEDE2000 } from './Color'
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

    this.base_dist = CIEDE2000(this.state.colors[0], this.state.colors[1]);
  }

  private readonly base_dist;

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
    let id = 0;
    const items_circles = this.state.colors.map((color: ColorLAB) => {
      const css_color: string = LAB_to_CSS(color);
      return (<Circle key={"circle_" + id++} x={this.x(color)} y={this.y(color)} r={this.r(color)} color={css_color} />);
    });

    let color_pairs: Array<Array<ColorLAB>> = [];
    for (let color1 of this.state.colors) {
      for (let color2 of this.state.colors) {
        color_pairs.push([color1, color2]);
      }
    }

    const items_pairs = color_pairs.map((colors: Array<ColorLAB>) => {
      const css_color1: string = LAB_to_CSS(colors[0]);
      const css_color2: string = LAB_to_CSS(colors[1]);
      return (
        <div key={id++} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: css_color1, color: css_color2}}>
          {CIEDE2000(colors[0], colors[1]).toFixed(2)}
        </div>
      );
    });

    const repeat: string = 'repeat(' + this.state.colors.length + ', 70px)';
    return (
      <div style={{display: 'flex'}}>
        <div className="Canvas" style={{ position: 'relative', border: '1px solid', width: w + 'px', height: h + 'px' }}>
          {items_circles}
        </div>
        <div style={{ display: 'grid', gridGap: '2px', gridTemplateColumns: repeat, gridTemplateRows: repeat, margin: '10px'}}>
          {items_pairs}
        </div>
      </div>
    );
  }

  async componentDidMount() {
    let colors: Array<ColorLAB> = this.state.colors;

    for (let i = 0; i < 100; i++) {
      await sleep(10);
      let forces: Array<ColorLAB> = new Array(colors.length).fill({ L: 0, a: 0, b: 0 });
      for (let c1 = 2; c1 < colors.length; c1++) {
        forces[c1] = this.forceBase(colors[c1]);
        for (let c2 = 1; c2 < colors.length; c2++) {
          if (c1 === c2) continue;
          forces[c1] = add(forces[c1], this.forcePair(colors[c1], colors[c2]));
        }
      }
      for (let c1 = 2; c1 < colors.length; c1++) {
        colors[c1] = clip(add(colors[c1], forces[c1]));
      }
      this.setState({ colors: colors });
    }
  }

  forceBase(color: ColorLAB): ColorLAB {
    const base: ColorLAB = this.state.colors[0];
    const dist: number = CIEDE2000(base, color);
    const diff: number = Math.abs(dist - this.base_dist);
    const sign: number = Math.sign(dist - this.base_dist);
    const direction: ColorLAB = normalize(sub(base, color));
    const res: ColorLAB = mul(direction, 0.03 * sign * diff ** 2);
    return res;
  }

  forcePair(color: ColorLAB, other: ColorLAB): ColorLAB {
    const dist: number = CIEDE2000(other, color);
    const direction: ColorLAB = normalize(sub(color, other));
    const res: ColorLAB = mul(direction, 1 / (dist ** 0.2));
    return res;
  }
}

function clip(color: ColorLAB): ColorLAB {
  // return color;
  let res: ColorLAB = {
    L: Math.max(0, Math.min(100, color.L)),
    a: Math.max(-128, Math.min(127, color.a)),
    b: Math.max(-128, Math.min(127, color.b))
  };
  return res;
}

function add(col1: ColorLAB, col2: ColorLAB): ColorLAB {
  let res: ColorLAB = {
    L: col1.L + col2.L,
    a: col1.a + col2.a,
    b: col1.b + col2.b
  };
  return res;
}

function sub(col1: ColorLAB, col2: ColorLAB): ColorLAB {
  let res: ColorLAB = {
    L: col1.L - col2.L,
    a: col1.a - col2.a,
    b: col1.b - col2.b
  };
  return res;
}

function mul(color: ColorLAB, factor: number): ColorLAB {
  color.L *= factor;
  color.a *= factor;
  color.b *= factor;
  return color;
}

function normalize(color: ColorLAB): ColorLAB {
  let len = Math.sqrt(color.L ** 2 + color.a ** 2 + color.b ** 2);
  return mul(color, 1 / len);
}

// min and max are inclusive
function randomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max) + 1;
  return Math.floor(Math.random() * (max - min) + min);
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default Palette;

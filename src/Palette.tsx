import React from 'react'
import { ColorLAB, LAB_to_CSS, LAB_to_HLC } from './Color'
import Circle from './Circle'
import ColorInput from './ColorInput';

interface PaletteProps {
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
    this.state = { colors: [] }
    for (let i = 0; i < props.n; i++) {
      this.state.colors.push({
        // L: randomInt(0, 100),
        L: 50,
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
    let id: number = 0;
    const circles = this.state.colors.map((color: ColorLAB) => {
      const css_color: string = LAB_to_CSS(color);
      return (<Circle key={'cirlce_' + id++} x={this.x(color)} y={this.y(color)} 
              r={this.r(color)} color={css_color} />);
    });

    // let color_pairs: Array<Array<ColorLAB>> = [];
    // for (let color1 of this.state.colors) {
    //   for (let color2 of this.state.colors) {
    //     color_pairs.push([color1, color2]);
    //   }
    // }

    // const items_pairs = color_pairs.map((colors: Array<ColorLAB>) => {
    //   const css_color1: string = LAB_to_CSS(colors[0]);
    //   const css_color2: string = LAB_to_CSS(colors[1]);
    //   return (
    //     <div key={id++} style={{
    //       display: 'flex', justifyContent: 'center', alignItems: 'center',
    //       backgroundColor: css_color1, color: css_color2
    //     }}>
    //       {CIEDE2000(colors[0], colors[1]).toFixed(2)}
    //     </div>
    //   );
    // });

    // const repeat: string = 'repeat(' + this.state.colors.length + ', 70px)';
    id = 0;
    const inputs = this.state.colors.map(() => {
      const handler = (colors: Array<ColorLAB>) => {
        this.setState({colors: colors});
      };
      return (<ColorInput key={'input_' + id} colors={this.state.colors} id={id++} handler={handler}/>);
    });

    return (
      <div style={{ display: 'flex' }}>
        <div>
          {inputs}
        </div>
        <div className="Canvas" style={{
          position: 'relative', border: '1px solid', width: w + 'px', height: h + 'px'
        }}>
          {circles}
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

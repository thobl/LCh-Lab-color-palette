import React from 'react'
import { ColorHLC, ColorXYZ, ColorLAB, XYZ_to_LAB, LAB_to_CSS, LAB_to_HLC } from './Color'
import Circle from './Circle'

interface PaletteProps {
  base: ColorXYZ;
  color1: ColorXYZ;
  n: number;
}

interface PaletteState {
  colors: Array<ColorLAB>
}

class Palette extends React.Component<PaletteProps, PaletteState> {
  constructor(props: PaletteProps) {
    super(props);
    this.state = { colors: [XYZ_to_LAB(props.base), XYZ_to_LAB(props.color1)] }
    for (let i = 1; i < props.n; i++) {
      this.state.colors.push({
        L: randomInt(0, 100),
        a: randomInt(-128, 127),
        b: randomInt(-128, 127)
      });
    }
  }

  render(): JSX.Element {
    const items = this.state.colors.map((color: ColorLAB) => {
      const HLC: ColorHLC = LAB_to_HLC(color);
      const rss_color: string = LAB_to_CSS(color);
      return (<Circle key={"circle_" + rss_color}
        x={2 * HLC.H + 360} y={2.5 * HLC.C} r={HLC.L}
        color={LAB_to_CSS(color)} />);
    });
    return (
      <div>
        {items}
      </div>
    );
  }
  
  async componentDidMount() {
    console.log("did mount");
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

import React from 'react'
import { CIEDE2000, ColorLAB, LAB_to_CSS } from './Color';

interface ColorInputProps {
  colors: Array<ColorLAB>;
  id: number;
  handler: (colors: Array<ColorLAB>) => void;
}

export default class ColorInput extends React.Component<ColorInputProps> {
  render(): JSX.Element {
    const id: number = this.props.id;
    // make shallow copies of the color array and of our color
    const colors: Array<ColorLAB> = [...this.props.colors];
    const color: ColorLAB = { ...colors[id] };

    // change function for L, a, and b
    const onChangeFunction = (prop: 'L' | 'a' | 'b') => {
      return (e: React.ChangeEvent<HTMLInputElement>) => {
        color[prop] = parseFloat(e.target.value);
        colors[id] = color;
        this.props.handler(colors);
      }
    }

    let id2: number = 0;
    const preview_boxes = colors.map((color2: ColorLAB) => {
      const css_color1: string = LAB_to_CSS(color);
      const css_color2: string = LAB_to_CSS(color2);
      return (
        <div className='ColorInputPreviewBox' key={id2++} style={{ backgroundColor: css_color1, color: css_color2 }}>
          {CIEDE2000(color, color2).toFixed(2)}
        </div>
      );
    });

    return (
      <div className='ColorInput'>
        <div className='ColorInputPreviewRow' >
          {preview_boxes}
        </div>
        <div className='ColorInputControls'>
          <input className='LABslider' type='range' min='0' max='100' value={color.L} onChange={onChangeFunction('L')} />
          <input className='LABInput' value={color.L} onChange={onChangeFunction('L')} />
          <span className='Spacer'> </span>
          <input className='LABslider' type='range' min='-128' max='127' value={color.a} onChange={onChangeFunction('a')} />
          <input className='LABInput' value={color.a} onChange={onChangeFunction('a')} />
          <span className='Spacer'> </span>
          <input className='LABslider' type='range' min='-128' max='127' value={color.b} onChange={onChangeFunction('b')} />
          <input className='LABInput' value={color.b} onChange={onChangeFunction('b')} />
        </div>
      </div>
    );
  }
}

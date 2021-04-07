import React from 'react'

interface CircleProps {
  x: number;
  y: number;
  r: number;
  color: string;
  colorStroke: boolean;
}

class Circle extends React.Component<CircleProps> {
  public static defaultProps = {
    colorStroke: false
  };
  render(): JSX.Element {
    const bgColor = this.props.colorStroke ? 'white' : this.props.color;
    const strokeColor = this.props.colorStroke ? this.props.color : 'black';
    return (
      <div style={{
        backgroundColor: bgColor,
        left: this.props.x - this.props.r,
        top: this.props.y - this.props.r,
        width: this.props.r * 2,
        height: this.props.r * 2,
        position: 'absolute',
        borderRadius: '50%',
        border: `2px solid ${strokeColor}`
      }}>
      </div>
    )
  }
}

export default Circle;

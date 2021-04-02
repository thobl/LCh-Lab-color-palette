import React from 'react'

interface CircleProps {
  x: number;
  y: number;
  r: number;
  color: string;
}

class Circle extends React.Component<CircleProps> {
  render(): JSX.Element {
    return (
      <div style={{
        backgroundColor: this.props.color,
        left: this.props.x - this.props.r,
        top: this.props.y - this.props.r,
        width: this.props.r * 2,
        height: this.props.r * 2,
        position: 'absolute',
        borderRadius: '50%',
        border: '1px solid'
      }}>
      </div>
    )
  }
}

export default Circle;

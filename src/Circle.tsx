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
        left: this.props.x,
        top: this.props.y,
        width: this.props.r,
        height: this.props.r,
        position: 'relative',
        borderRadius: '50%',
        border: '1px solid'
      }}>
      </div>
    )
  }
}

export default Circle;

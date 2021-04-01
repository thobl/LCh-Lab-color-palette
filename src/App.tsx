import React from 'react';
// import { check_CIEDE2000, check_conversion } from './Color';
import Palette from './Palette'

class App extends React.Component {
  render(): JSX.Element {
    // testing the color distance
    // check_CIEDE2000();
    // check_conversion();
    return (
      <div>
        <div className="Canvas" style={{ border: '1px solid', width: '800px', height: '800px' }}>
          <Palette base={{ x: 0.9, y: 0.9, z: 0.9 }} color1={{ x: 0.9, y: 0.1, z: 0.1 }} n={15} />
        </div>
      </div>
    )
  }
}

export default App;

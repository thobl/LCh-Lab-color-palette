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
          <Palette base={{ R: 253/255, G: 246/255, B: 227/255 }} color1={{ R: 38/255, G: 139/255, B: 210/255 }} n={6} />
      </div>
    )
  }
}

export default App;

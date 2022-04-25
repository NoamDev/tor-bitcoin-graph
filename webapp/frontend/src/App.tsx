import React, { ChangeEvent, useState } from 'react';
import './App.css';
import { getTransactionGraph } from './blockchain/blockchain';
import { BlockchainGraph } from './blockchain/models';
import { GraphComponent } from './components/GraphComponent/GraphComponent';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import {AddressesForm} from './components/AddressesForm/AddressesForm';
import { render } from '@testing-library/react';

type AppProps = {};

type AppState = {
  isLoading: boolean,
  graph: BlockchainGraph|null,
};

class App extends React.Component<AppProps,AppState> {
  
  constructor(props: AppProps) {
    super(props);
    this.state = {
      isLoading: false,
      graph: null
    };
  }

  async buildGraph(addresses: string[]) {
    this.setState({
      isLoading: true
    });
    const g = await getTransactionGraph(addresses);
    this.setState({
      isLoading: false,
      graph: g
    });
  }

  renderByState() {
    if(this.state.isLoading) {
      return (
        <div>Loading</div>
      )
    } else if (this.state.graph!=null) {
      return (<GraphComponent key="graph" graph={this.state.graph}/>);
    } else {
      return (
        <Grid container spacing={2}
        direction="column"
        alignItems="center"
        justifyContent="center"
        mt={2}
        >
            <Grid item xs={1}>
              <AddressesForm onSubmit={this.buildGraph.bind(this)}/>
            </Grid>
        </Grid>
        );
    }
  }
  
  render() {
    return (
      <div className="App">
          {
          this.renderByState()
          }
      </div>
    );
  }
}

export default App;

import React, { ChangeEvent } from 'react';
import './App.css';
import { getTransactionGraph } from './blockchain/blockchain';
import { BlockchainGraph } from './blockchain/models';
import { GraphComponent } from './components/GraphComponent/GraphComponent';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import {AddressesForm} from './components/AddressesForm/AddressesForm';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';

type AppProps = {};

type AppState = {
  isLoading: boolean,
  isError: boolean,
  graph: BlockchainGraph|null,
};

class App extends React.Component<AppProps,AppState> {
  
  constructor(props: AppProps) {
    super(props);
    this.state = {
      isLoading: false,
      isError: false,
      graph: null
    };
  }

  async buildGraph(addresses: string[]) {
    this.setState({
      isLoading: true,
      isError: false,
    });
    try {
      const g = await getTransactionGraph(addresses);
      this.setState({
        isLoading: false,
        isError: false,
        graph: g
      });
    } catch(e) {
      this.setState({
        isLoading: false,
        isError: true
      });
    }
  }
  async readFile(file: File): Promise<string> {
    return new Promise((resolve,reject)=>{
      const fileReader = new FileReader();
      fileReader.onload = (e)=>{
        resolve(fileReader.result! as string);
      };
      fileReader.onerror = (e)=>{
        reject(fileReader.error);
      }
      fileReader.readAsText(file);
    });
  }

  async handleBuildGraphFromFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if(!file) {
      return;
    }
    this.setState({
      isLoading: true
    });
    const content = await this.readFile(file);
    const lines = content.trim().split('\n').map(line=>line.trim());
    const g = await getTransactionGraph(lines);
    this.setState({
      isLoading: false,
      graph: g
    });
  }

  handleNewGraphClicked(){
    this.setState({
      graph: null
    });
  }

  renderByState() {
    if(this.state.isLoading) {
      return (
        <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        mt={2}
        >
          <CircularProgress/>
        </Box>
      )
    } else if (this.state.graph!=null) {
      return (<GraphComponent
               key="graph"
               graph={this.state.graph}
               onNewGraphClicked={this.handleNewGraphClicked.bind(this)}/>);
    } else {
      return (
        <Grid container spacing={2}
        alignItems="center"
        justifyContent="center"
        mt={2}
        >
            <Grid item>
              <AddressesForm onSubmit={this.buildGraph.bind(this)}/>
            </Grid>
            <Divider orientation='vertical' flexItem>OR</Divider>
            <Grid item>
            <label htmlFor="contained-button-file">
              <input accept=".txt,.csv" id="contained-button-file" type="file" onChange={this.handleBuildGraphFromFile.bind(this)} hidden/>
              <Button variant="contained" component="span">
                Build Graph From File
              </Button>
            </label>
            </Grid>
            {this.state.isError && (<Grid item xs={12} textAlign='center'>
              Network problem. Check your connection or try again later.
            </Grid>)}
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

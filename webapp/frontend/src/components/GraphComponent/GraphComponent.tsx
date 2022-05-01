import React from "react";
import { BlockchainGraph, Transaction, Wallet } from "../../blockchain/models";
import cytoshape, { EdgeSingular, NodeSingular } from 'cytoscape';
import CytoscapeComponent from 'react-cytoscapejs';
import yaml from 'js-yaml';
import Grid from "@mui/material/Grid";
import WalletDetails from "../WalletDetails/WalletDetails";
import TransactionDetails from "../TransactionDetails/TransactionDetails";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FindPathComponent from "../FindPathComponent/FindPathComponent";
import AddressList from "../AddressList/AddressList";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";

const fcose = require('cytoscape-fcose');

cytoshape.use(fcose);

type GraphComponentProps = {
    graph: BlockchainGraph,
    onNewGraphClicked?: ()=>void
};

enum SidePanelValue {
    EVENT_DETAILS,
    FIND_PATH,
    ADDRESS_LIST
};

type GraphComponentState = {
    sidePanel: SidePanelValue,
    selectedElement: { type: 'node', details: Wallet}|{type: 'edge', details: Transaction}|null
};

export class GraphComponent extends React.Component<GraphComponentProps,GraphComponentState> {
    cy: cytoscape.Core|null;
    private readonly styling = [
        {
            selector: 'node',
            css: {
                shape: 'ellipse',
                width: 16,
                height: 16
            }
        },
        {
            selector: 'edge',
            css: {
                'curve-style': 'bezier',
                "width": 1,
                'target-arrow-shape': 'vee'
            }
        }
    ];

    constructor(props: GraphComponentProps) {
        super(props);
        this.cy = null;
        this.state = {
            sidePanel: SidePanelValue.EVENT_DETAILS,
            selectedElement: null
        }
    }

    setCy(cy:cytoshape.Core) {
        this.cy = cy;
        this.cy.nodes().on('tap', (e) =>{
            this.setState(
                {
                    sidePanel: SidePanelValue.EVENT_DETAILS,
                    selectedElement: {
                        type: 'node',
                        details: e.target.data().details
                    }
                }
            );
        });
        this.cy.edges().on('tap', (e) =>{
            this.setState(
                {
                    sidePanel: SidePanelValue.EVENT_DETAILS,
                    selectedElement: {
                        type: 'edge',
                        details: e.target.data().details
                    }
                    
                }
            );
        });
    }

    download(content: string, fileName: string, contentType: string) {
        var a = document.createElement("a");
        var file = new Blob([content], {type: contentType});
        a.href = URL.createObjectURL(file);
        a.download = fileName;
        a.click();
    }

    handleDownloadJSON() {
        const graph_json = JSON.stringify(this.props.graph);
        this.download(graph_json, 'graph.json', 'text/plain')
    }

    handleDownloadYAML() {
        const graph_yaml = yaml.dump(this.props.graph, {noRefs: true});
        this.download(graph_yaml, 'graph.yaml', 'text/plain')
    }

    findShortestPath(from:string, to:string){

        const {found, path} = this.cy!.elements().bfs( {
            root: this.cy!.$(`#${from}`),
            visit: (v,e,u,i,depth)=>{
                if(v.id()===to) {
                    return true;
                }
            },
            directed: true
        });
        if(found.empty()) {
            return null;
        } else {
            const edges: EdgeSingular[] = path.edges().toArray();
            const nodes: NodeSingular[] = path.nodes().toArray();
            const result: string[] = [];

            let desired_node: NodeSingular|undefined = found.first();
            let v;
            let e;
            
            while(desired_node) {
                do {
                    v = nodes.pop()!;
                    e = edges.pop();
                } while(v.id() !== desired_node.id());
                result.unshift(v.id());
                if(e) {
                    result.unshift(e.data().details.hash);
                }
                desired_node = e?.source();
            }
            
            return result;
        }
    }

    handleNewGraphClicked() {
        this.props.onNewGraphClicked?.();
    }

    handleSidePanelTabChanged(event:any, value: SidePanelValue) {
        this.setState({
            sidePanel: value
        });
    }

    renderElementDetails() {
        if(!this.state.selectedElement) {
            return (<Box m={2} >Select any node or edge to view details</Box>);
        } else if(this.state.selectedElement.type === 'node') {
                        const wallet = this.state.selectedElement.details;
                        return (<WalletDetails wallet={wallet}/>)
        } else if(this.state.selectedElement.type === 'edge') {
            const tx = this.state.selectedElement.details;
            return (<TransactionDetails tx={tx}/>)
        }
    }
    
    render() {
        const elements = [...this.props.graph.nodes, ...this.props.graph.edges].map(
            el => ({data: el})
        );

        return (
            <Grid container>
                <Grid item m={1}>
                    <Button variant="contained" onClick={this.handleNewGraphClicked.bind(this)}>New Graph</Button>
                </Grid>
                <Grid item m={1}>
                    <Button variant="contained" onClick={this.handleDownloadJSON.bind(this)}>Download JSON</Button>
                </Grid>
                <Grid item m={1}>
                    <Button variant="contained" onClick={this.handleDownloadYAML.bind(this)}>Download YAML</Button>
                </Grid>
                <Grid item container spacing={2} direction="row">
                    <Grid item xs={5}>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <Tabs value={this.state.sidePanel} onChange={this.handleSidePanelTabChanged.bind(this)}>
                                <Tab label="Element Details" />
                                <Tab label="Find Path" />
                                <Tab label="Address List" />
                            </Tabs>
                        </Box>
                        <Box sx={{display: (this.state.sidePanel === SidePanelValue.EVENT_DETAILS? 'initial' : 'none')}}>
                            {this.renderElementDetails()}
                        </Box>
                        <Box sx={{display: (this.state.sidePanel === SidePanelValue.FIND_PATH? 'initial' : 'none')}}>
                            <FindPathComponent
                                addresses={this.props.graph.nodes.map(node=>node.id)}
                                findPath={this.findShortestPath.bind(this)}
                            />
                        </Box>
                        <Box sx={{display: (this.state.sidePanel === SidePanelValue.ADDRESS_LIST? 'initial' : 'none')}}>
                            <AddressList
                                wallets = {this.props.graph.nodes.map(node=>node.details)}
                            />
                        </Box>
                    </Grid>
                    <Grid item xs={6}>
                        <CytoscapeComponent
                            elements={elements}
                            style={ { width: '600px', height: '600px' } }
                            layout= {{name: 'fcose'}}
                            stylesheet={this.styling}
                            cy={this.setCy.bind(this)}
                        />
                    </Grid>
                </Grid>
            </Grid>
        )
    }

}
import React from "react";
import { BlockchainGraph, Transaction, Wallet } from "../../blockchain/models";
import cytoshape from 'cytoscape';
import CytoscapeComponent from 'react-cytoscapejs';
import yaml from 'js-yaml';
import Grid from "@mui/material/Grid";
import WalletDetails from "../WalletDetails/WalletDetails";
import TransactionDetails from "../TransactionDetails/TransactionDetails";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";

type GraphComponentProps = {
    graph: BlockchainGraph,
    onNewGraphClicked?: ()=>void
};

type GraphComponentState = {
    selectedElement: { type: 'node', element: Wallet}|{type: 'edge', element: Transaction}|null
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
            selectedElement: null
        }
    }

    setCy(cy:cytoshape.Core) {
        this.cy = cy;
        this.cy.nodes().on('tap', (e) =>{
            this.setState(
                {
                    selectedElement: {
                        type: 'node',
                        element: e.target.data().details
                    }
                }
            );
        });
        this.cy.edges().on('tap', (e) =>{
            this.setState(
                {
                    selectedElement: {
                        type: 'edge',
                        element: e.target.data().details
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

    find_shortest_path(from:string, to:string){
        const {found, path} = this.cy!.elements().bfs({
            root: `#${from}`,
            visit: (v,e,u,i,depth)=> v.id()===to,
            directed: true
        });
        if(found.empty()) {
            return null;
        } else {
            const result = [];
            for(const element of path.toArray()) {
                if(element.isNode()) {
                    result.push(element.id());
                } else {
                    result.push((element.data().details as Transaction).hash);
                }
            }
            return result;
        }
    }

    handleNewGraphClicked() {
        this.props.onNewGraphClicked?.();
    }

    renderSelectedElement() {
        const selectedElement = this.state.selectedElement;
        if(!selectedElement) {
            return (<Box m={2} >Select any node or edge to view details</Box>);
        } else if(selectedElement.type === 'node') {
            const wallet = selectedElement.element;
            return (<WalletDetails wallet={wallet}/>)
        } else if(selectedElement.type === 'edge') {
            const tx = selectedElement.element;
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
                        {this.renderSelectedElement()}
                    </Grid>
                    <Grid item xs={6}>
                        <CytoscapeComponent
                            elements={elements}
                            style={ { width: '600px', height: '600px' } }
                            layout= {{name: 'cose'}}
                            stylesheet={this.styling}
                            cy={this.setCy.bind(this)}
                        />
                    </Grid>
                </Grid>
            </Grid>
        )
    }

}
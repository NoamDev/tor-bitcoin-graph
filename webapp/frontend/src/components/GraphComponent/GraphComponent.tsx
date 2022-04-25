import React, { useEffect, useState } from "react";
import { BlockchainGraph, BlockchainNode, GraphNode, Transaction, Wallet } from "../../blockchain/models";
import cytoshape from 'cytoscape';
import CytoscapeComponent from 'react-cytoscapejs';
import Grid from "@mui/material/Grid";
import WalletDetails from "../WalletDetails/WalletDetails";

type GraphComponentProps = {
    graph: BlockchainGraph
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
                'curve-style': 'straight',
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
        this.cy.nodes().on('click', (e) =>{
            this.setState(
                {
                    selectedElement: {
                        type: 'node',
                        element: e.target.data().value
                    }
                }
            );
        });
        this.cy.edges().on('click', (e) =>{
            this.setState(
                {
                    selectedElement: {
                        type: 'edge',
                        element: e.target.data().value
                    }
                }
            );
        });
    }

    // componentDidMount() { 
    //     const graph = this.props.graph;
    //     const elements = [...Object.values(graph.nodes), ...graph.edges];
    //     console.log(this.containerRef.current)
    //     console.log(this.cy);
    //     if(!this.cy) {
    //         this.cy = cytoshape({
    //             container: this.containerRef.current,
    //             elements: elements.map(el => ({data:el})),
    //             layout: {
    //             name: "cose"   
    //             },
    //             style: [
    //                 {
    //                     selector: 'node',
    //                     css: {
    //                         'background-color': '#666',
    //                         shape: 'triangle',
    //                         height: 10,
    //                         width: 10
    //                     }
    //                 },
    //                 {
    //                     selector: 'edge',
    //                     css: {
    //                         'line-color': '#ccc',
    //                         'target-arrow-shape': 'triangle'
    //                     }
    //                 }
    //             ],
    //         }); 
    //     }
    //     // this.cy.fit(this.cy.elements())
    // }

    // componentWillUnmount() {
    //     this.cy?.destroy();
    //     this.cy=null;
    // }

    renderSelectedElement() {
        const selectedElement = this.state.selectedElement;
        const satoshi = 0.00000001;
        if(!selectedElement) {
            return (<div></div>);
        } else if(selectedElement.type === 'node') {
            const wallet = selectedElement.element;
            return (<WalletDetails wallet={wallet}/>)
        } else if(selectedElement.type == 'edge') {
            const tx = selectedElement.element;
            return (<Grid container spacing={1} direction="column" m={2}>
                <Grid item>
                    <b>Hash</b>
                </Grid>
                <Grid item>
                    {tx.hash}
                </Grid>
                <Grid item>
                    <b>Amount</b>
                </Grid>
                <Grid item>
                    {(satoshi * tx.amount).toFixed(8)} BTC
                </Grid>
            </Grid>)
        }
    }
    
    render() {
        const elements = [...Object.values(this.props.graph.nodes), ...this.props.graph.edges].map(
            el => ({data: el})
        );

        return (
            <Grid container spacing={2} direction="row">
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
        )
    }

}
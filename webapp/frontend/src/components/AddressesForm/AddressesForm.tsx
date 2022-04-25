import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import React from "react";

type AddressesFormProps = {
    onSubmit?:(addresses: string[])=>void
}
type AddressesFormState = {
    addresses: string[]
}

export class AddressesForm extends React.Component<AddressesFormProps,AddressesFormState> {
    constructor(props: AddressesFormProps) {
        super(props);
        this.state = {addresses: []};
    }

    handleInputChanged(index: number, value: string) {
        const addresses = [...this.state.addresses];
        addresses[index] = value;
        this.setState({addresses: addresses});
    }

    renderTextFields() {
        const inputs =  this.state.addresses.map((x,i)=>(
            <Grid item key={i}>
                <TextField value={x} onChange={(event)=>{this.handleInputChanged(i, event.target.value)}}/>
            </Grid>
        ));
        inputs.push(
            <Grid item key={this.state.addresses.length}>
                <TextField value={''} onChange={(event)=>{this.handleInputChanged(this.state.addresses.length, event.target.value)}}/>
            </Grid>
        )
        return inputs;
    }

    handleBuildGraph() {
        console.log(this.props);
        this.props.onSubmit?.(this.state.addresses);
    }

    render(): React.ReactNode {
        return (
            <Grid container spacing={2} direction="column">
                {this.renderTextFields()}
                <Grid item>
                    <Button variant="contained" onClick={()=>this.handleBuildGraph()}>
                        Build Graph
                    </Button>
                </Grid>
            </Grid>
        );
    }
}
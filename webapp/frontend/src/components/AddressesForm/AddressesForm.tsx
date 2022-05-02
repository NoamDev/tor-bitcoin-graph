import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import React from "react";
import { validate as btc_address_validate, Network} from 'bitcoin-address-validation';

type AddressesFormProps = {
    onSubmit?:(addresses: string[])=>void
}
type AddressesFormState = {
    addresses: string[],
    is_valid: boolean[] 
}

export class AddressesForm extends React.Component<AddressesFormProps,AddressesFormState> {
    constructor(props: AddressesFormProps) {
        super(props);
        this.state = {addresses: [], is_valid: []};
    }

    handleInputChanged(index: number, value: string) {
        const addresses = [...this.state.addresses];
        const is_valid = [...this.state.is_valid];
        addresses[index] = value;
        is_valid[index] = btc_address_validate(value, Network.mainnet) || value === '';
        this.setState({addresses: addresses, is_valid: is_valid});
    }

    isFormValid() {
        return this.state.addresses.length > 0 &&
            !this.state.addresses.map(addr=>addr==='')
                .reduce((a,b)=>a&&b, true)
            this.state.is_valid.reduce((a,b)=>a&&b, true);
    }

    renderTextFields() {
        const inputs =  this.state.addresses.map((x,i)=>(
            <Grid item key={i}>
                <TextField
                    fullWidth
                    value={x}
                    error={!this.state.is_valid[i]}
                    helperText={!this.state.is_valid[i]? 'Invalid address' : ''}
                    onChange={(event)=>{this.handleInputChanged(i, event.target.value)}}
                />
            </Grid>
        ));
        inputs.push(
            <Grid item key={this.state.addresses.length}>
                <TextField
                    fullWidth
                    value={''}
                    onChange={(event)=>{this.handleInputChanged(this.state.addresses.length, event.target.value)}}
                />
            </Grid>
        )
        return inputs;
    }

    handleBuildGraph() {
        this.props.onSubmit?.(this.state.addresses);
    }

    render(): React.ReactNode {
        return (
            <Grid container spacing={2} direction="column" sx={{width:400}}>
                <Grid item>
                    Enter a list of Bitcoin addresses:
                </Grid>
                {this.renderTextFields()}
                <Grid item>
                    <Button disabled={!this.isFormValid()} variant="contained" onClick={()=>this.handleBuildGraph()}>
                        Build Graph
                    </Button>
                </Grid>
            </Grid>
        );
    }
}
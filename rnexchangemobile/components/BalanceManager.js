import React, {Component} from "react";
import {
    Text,
    SafeAreaView,
} from "react-native";

export default class BalanceManager extends Component {
    state = {balance:1000,currency:"USD"};
    render() {
        return (
            <SafeAreaView style={{flexDirection: "column",flex: 1,marginBottom:10}}>
                <Text>Balance Value</Text>
                <Text>{this.state.balance} {this.state.currency}</Text>
            </SafeAreaView>
        );
    }
}
import React, {Component} from "react";
import {
    Text,
    SafeAreaView,
    View,
    TouchableOpacity,
    StyleSheet,
    Alert,
    Image,
    Modal,
    Pressable,
    ScrollView
} from "react-native";
import axios from 'axios';
import CurrencyPicker from "react-native-currency-picker";
import NumericInput from "@wwdrew/react-native-numeric-textinput";
import AsyncStorage from '@react-native-async-storage/async-storage';


export default class CurrencyConverter extends Component {
    constructor(props) {
        super(props);
        this.state = { wallet:[["USD",1000.00]], base_currency:"USD", requested_code:"EUR", current_rate:0.0, exchange_value:0.0, last_exchange:0, historyVisible:false, history:[] };
    }

    async resetDB() {
        await AsyncStorage.setItem('@HISTORY', JSON.stringify([]));
    }

    componentDidMount() {
        currencyPickerRef.open();
        // currencyPickerRefBase.open();
        this.resetDB();
        this.getConversionRate(this.state.base_currency, {"code":"EUR"});
    }

    getConversionRate(base_currency, data) {
        let url = 'http://data.fixer.io/api/latest?access_key=23f5a530ee162ae53b99166196ab932e&base=' + base_currency + '&symbols=' + data.code;

        axios({
            method:'GET',
            url: url,
          }).then(async (response) => {
              console.log(response);
            for (let key in response.data.rates) {
                let value = response.data.rates[key];
                this.setState({current_rate:value,requested_code:data.code});
            }
          }).catch(async (error) => {
            this.throwError("Eric did something wrong, or the api key is now invalid.");
          });
          
        this.forceUpdate();
    }

    setCurrencyValue(value) {
        let converted_value = this.state.current_rate * value;
        this.setState({exchange_value:value,last_exchange:converted_value});
    }

    setBaseCurrency(value) {
        this.setState({base_currency:value.code});
        this.getConversionRate(value.code,{'code':this.state.requested_code});
    }

    confirmConvert() {
        let transaction = this.state.exchange_value.toFixed(2) + " " + this.state.base_currency + " TO " + this.state.requested_code + " AT " + this.state.current_rate.toFixed(2) + " FOR " + this.state.last_exchange.toFixed(2);
        Alert.alert(
            "CONFIRM CONVERSION",
            "CONVERT " + transaction + "?",
            [
              {
                text: "CANCEL",
                onPress: () => console.log("Cancel Pressed"),
                style: "cancel"
              },
              { text: "CONFIRM", onPress: () => this.convertCurrency(transaction) }
            ]
        );
    }

    throwError(message){
        Alert.alert(
            "SOMETHING WENT WRONG",
            message,
            [
              { text: "OK", onPress: () => console.log("Error Confirmed") }
            ]
        );
    }

    convertCurrency(transaction) {
        let temp_wallet = this.state.wallet;
        let funds_available = false;
        let wallet_contained_xfer = false;
        let amt = this.state.current_rate*this.state.exchange_value;
        for (let x = 0; x < temp_wallet.length; x++) {
            if(temp_wallet[x][0]==this.state.base_currency && this.state.exchange_value<=temp_wallet[x][1]) {
                funds_available = true;
                temp_wallet[x][1]-=this.state.exchange_value;
            }
            if(temp_wallet[x][0]==this.state.requested_code) {
                wallet_contained_xfer = true;
                temp_wallet[x][1]+=amt;
            }
        }
        if (!wallet_contained_xfer && funds_available) {
            temp_wallet.push([this.state.requested_code,amt])
        }
        if(funds_available) {
            this.setState({wallet:temp_wallet});
            this.saveTransaction(transaction,temp_wallet);
        } else {
            this.throwError("You tried to convert more funds than you have available.");
        }
        
        this.forceUpdate();
    }

    async saveTransaction(transaction,wallet) {
        let value = await AsyncStorage.getItem('@HISTORY');
        let newHistory = JSON.parse(value);
        let d = new Date().toLocaleString();
        if (value !== null) {
            newHistory.push({transaction,d,wallet});
            await AsyncStorage.setItem('@HISTORY', JSON.stringify(newHistory));
        } else {
            await AsyncStorage.setItem('@HISTORY', JSON.stringify([{transaction,d,wallet}]))
        }
    }

    async showHistory() {
        let value = await AsyncStorage.getItem('@HISTORY');
        if (value !== null) {
            this.setState({historyVisible:true,history:JSON.parse(value)});
        } else {
            this.setState({historyVisible:true,history:[]});
        }
    }

    hideHistory () {
        this.setState({historyVisible:false});
    }

    render() {
        var code = this.state.requested_code;
        return (
            <SafeAreaView style={styles.sacontainer}>

                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={this.state.historyVisible}
                    onRequestClose={() => {
                        this.setState({historyVisible:false});
                    }}>
                    <SafeAreaView style={{backgroundColor:"#c9ffd8", width:"100%", height:"100%", marginTop:10}}>
                        <ScrollView style={{backgroundColor:"#c9ffd8", width:"100%", height:"100%", margin:10}}>
                            <Text style={styles.txtTitle}>History:</Text>
                            <TouchableOpacity style={styles.historyLogo} onPress={()=>this.hideHistory()}>
                                <Image
                                    style={styles.cancelLogo}
                                    source={require('../icons/history-logo.png')}/>
                            </TouchableOpacity>
                            {this.state.history.map((obj)=>{
                                return (
                                    <View style={{marginTop:10}}>
                                        <Text style={styles.historyTxt}>{obj.transaction}</Text>
                                        <Text style={styles.historyTxt}>{obj.d}</Text>
                                            <View style={{flexDirection:'column', marginLeft:10}}>
                                                {obj.wallet.map((currency)=>{
                                                    return (
                                                        <Text style={styles.walletHistory}>{currency[0]} {currency[1].toFixed(2)}</Text>
                                                    );
                                                })}
                                            </View>
                                    </View>
                                );
                            })}
                        </ScrollView>               
                    </SafeAreaView>
                </Modal>

                <Text style={styles.txtTitle}>Wallet</Text>
                <TouchableOpacity style={styles.historyLogo} onPress={()=>this.showHistory()}>
                    <Image
                        style={styles.historyLogo}
                        source={require('../icons/history-logo.png')}/>
                </TouchableOpacity>
                {this.state.wallet.map((prop, key) => {
                    return (
                        <View style={{flexDirection:'row', alignItems:"stretch"}}>
                            <Text style={styles.txtBalanceCode}>{prop[0]}</Text>
                            <Text style={styles.txtBalance}>{prop[1].toFixed(2)}</Text>
                        </View>
                    );
                })}
                <Text style={styles.txt}>Convert from:</Text>
                <View style={styles.rowCtnr}>
                    <CurrencyPicker
                        currencyPickerRefBase={(ref2) => {currencyPickerRefBase = ref2}}
                        enable={true} darkMode={true}
                        currencyCode={this.state.base_currency}
                        showFlag={true} showCurrencyName={true} showCurrencyCode={true}
                        onSelectCurrency={(data) => this.setBaseCurrency(data)}
                        onOpen={() => {console.log("Open")}}
                        onClose={() => {console.log("Close")}}
                        showNativeSymbol={true} showSymbol={false}
                        title={"Currency"}
                        searchPlaceholder={"Search"}
                        showCloseButton={true}
                        showModalTitle={true}/>
                        {this.state.wallet.map((prop, key) => {
                            if(this.state.base_currency == prop[0]){
                                return (
                                    <Text style={{flex:1, fontSize:16,}}>{prop[1].toFixed(2)} Available</Text>
                                );
                            }
                        })}
                </View>
                <Text style={styles.txt}>Convert to:</Text>
                <View style={styles.rowCtnr}>
                    <CurrencyPicker
                        currencyPickerRef={(ref) => {currencyPickerRef = ref}}
                        enable={true} darkMode={true}
                        currencyCode={this.state.requested_code}
                        showFlag={true} showCurrencyName={true} showCurrencyCode={true}
                        onSelectCurrency={(data) => this.getConversionRate(this.state.base_currency, data)}
                        onOpen={() => {console.log("Open")}}
                        onClose={() => {console.log("Close")}}
                        showNativeSymbol={true} showSymbol={false}
                        title={"Currency"}
                        searchPlaceholder={"Search"}
                        showCloseButton={true}
                        showModalTitle={true}/>
                        {this.state.wallet.map((prop, key) => {
                            if(this.state.requested_code == prop[0]){
                                return (
                                    <Text style={{flex:1, fontSize:16,}}>{prop[1].toFixed(2)} Available</Text>
                                );
                            }
                        })}
                </View>
                <Text style={styles.txt}>Rate: {this.state.current_rate}</Text>
                <View style={{flexDirection:"row"}}>
                    <Text style={styles.txt}>Convert Amount:</Text>
                    <NumericInput
                        style={styles.input}
                        type='currency'
                        locale='en-US'
                        currency={this.state.base_currency}
                        value={this.state.exchange_value}
                        onUpdate={(value) => this.setCurrencyValue(value)}/>     
                </View>
                <View style={{flexDirection:"row"}}>
                    <Text style={styles.txt}>Converted Value:</Text>
                    <NumericInput
                        style={styles.input}
                        type='currency'
                        locale='en-US'
                        currency={this.state.requested_code}
                        value={this.state.last_exchange}
                        onUpdate={()=>{console.log("lol")}}/>
                </View>
                <Pressable style={styles.button} onPress={()=>this.confirmConvert()}>
                    <Text style={styles.text}>CONVERT</Text>
                </Pressable>

            </SafeAreaView>
        );
    }
}

const styles = StyleSheet.create({
    sacontainer: {
        flexDirection: "column",
        flex:1,
        margin:10,
        height:"100%",
    },
    txtCountryName: {
        marginLeft: 10
    },
    txtCurrencyCode: {
        marginLeft: 10,
        fontWeight: "600"
    },
    txt:{
        fontSize:16,
        margin: 10
    },
    rowCtnr: {
        flexDirection:"row",
        margin:10,
        flex:1
    },
    txtBalanceCode:{
        margin:15,
        fontSize:18,
        fontWeight:'bold',
        color:"#000FFF",
        justifyContent:'flex-start',
        flex:1
    },
    txtBalance:{
        margin:15,
        fontSize:18,
        fontWeight:'bold',
        color:"#000FFF",
        textAlign:"right",
        alignSelf:'flex-end',
        justifyContent:'flex-end',
        flex:1
    },
    txtTitle:{
        fontSize:18,
        fontWeight:'bold',
        margin:10,
    },
    cancelLogo:{
        position:'absolute',
        top:5,
        right:35,
        width:30,
        height:30
    },
    historyLogo:{
        position:'absolute',
        top:5,
        right:15,
        width:30,
        height:30,
    },
    historyTxt:{
        marginLeft:10
    },
    button: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 4,
        elevation: 3,
        backgroundColor: 'teal',
        marginTop:10,
    },
    text: {
        fontSize: 16,
        lineHeight: 21,
        fontWeight: 'bold',
        letterSpacing: 0.25,
        color: 'white',
    },
    input:{
        margin:5,
        borderWidth:0.5,
        borderRadius:5,
        borderColor:'aquamarine',
        flex:1,
        fontWeight:"bold",
        backgroundColor:"lightblue",
        color:'teal'
    },
    walletHistory:{
        margin:2.5,
    }
});
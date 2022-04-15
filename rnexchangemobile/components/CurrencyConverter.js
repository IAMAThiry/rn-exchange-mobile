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
    Pressable
} from "react-native";
import FIXER_API_KEY from '../utils/const';
import CurrencyPicker from "react-native-currency-picker";
import NumericInput from "@wwdrew/react-native-numeric-textinput";
import AsyncStorage from '@react-native-async-storage/async-storage';


export default class CurrencyConverter extends Component {
    constructor(props) {
        super(props);
        this.state = { wallet:[["EUR",1000.00]], base_currency:"EUR", requested_code:"USD", current_rate:0.0, exchange_value:0.0, last_exchange:0, historyVisible:false, history:[] };
    }

    async resetDB() {
        await AsyncStorage.setItem('@HISTORY', JSON.stringify([]));
    }

    componentDidMount() {
        currencyPickerRef.open();
        // currencyPickerRefBase.open();
        // this.resetDB();
    }

    getConversionRate(data) {

        console.log("in conversion rate");
        console.log(data);
        console.log(this.state.base_currency);
        console.log(data.code);

        let url = 'http://data.fixer.io/api/latest?access_key=23f5a530ee162ae53b99166196ab932e&base=' + this.state.base_currency + '&symbols=' + data.code;

        // axios({
        //     method:'GET',
        //     url: url,
        //   }).then(async (response) => {
        //     console.log("response");
        //     console.log(response.data);
        //     for (let key in response.data.rates) {
        //         console.log(key);
        //         let value = response.data.rates[key];
        //         console.log("hererererer");
        //         console.log(value);
        //         this.setState({current_rate:value,requested_code:data.code});
        //     }
        //   }).catch(async (error) => {
        //     console.log("error");
        //     console.log(error);
        //   });

        // var fakeresponsedata = {
        //     "success": true,
        //     "timestamp": 1649957824,
        //     "base": "EUR",
        //     "date": "2022-04-14",
        //     "rates": {
        //         "USD": 1.082403
        //     }
        // }

        var currentrateEUtoUS = 1.08083;

        this.setState({current_rate:currentrateEUtoUS,requested_code:data.code});
    }

    setCurrencyValue(value) {
        let converted_value = this.state.current_rate * value;
        this.setState({exchange_value:value,last_exchange:converted_value});
    }

    setBaseCurrency(value) {
        this.setState({base_currency:value.code});
    }

    confirmConvert() {
        let transaction = this.state.exchange_value + " " + this.state.base_currency + " TO " + this.state.requested_code + " AT " + this.state.current_rate + " FOR " + this.state.last_exchange.toFixed(2);
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

    convertCurrency(transaction) {
        let temp_wallet = this.state.wallet;
        let funds_available = false;
        let wallet_contained_xfer = false;
        for (let x = 0; x < temp_wallet.length; x++) {
            if(temp_wallet[x][0]==this.state.base_currency && this.state.exchange_value<=temp_wallet[x][1]) {
                funds_available = true;
                temp_wallet[x][1]-=this.state.exchange_value;
            }
            if(temp_wallet[x][0]==this.state.requested_code) {
                wallet_contained_xfer = true;
                temp_wallet[x][1]+=this.state.current_rate*this.state.exchange_value;
            }
        }
        if (!wallet_contained_xfer) {
            temp_wallet.push([this.state.requested_code,this.state.current_rate*this.state.exchange_value])
        }
        if(funds_available) {
            this.saveTransaction(transaction);
            this.setState({wallet:temp_wallet});
        } else {
            //TODO warning
            console.log("WARNED");
        }
    }

    async saveTransaction(transaction) {
        let value = await AsyncStorage.getItem('@HISTORY');
        if (value !== null) {
            let newHistory = JSON.parse(value);
            newHistory.push(transaction+" @"+new Date().toLocaleString());
            await AsyncStorage.setItem('@HISTORY', JSON.stringify(newHistory));
        } else {
            await AsyncStorage.setItem('@HISTORY', JSON.stringify([transaction+" @"+new Date().toLocaleString()]))
        }
    }

    async showHistory() {
        console.log("h");
        let value = await AsyncStorage.getItem('@HISTORY');
        if (value !== null) {
            console.log("HISTORY");
            console.log(value);
            this.setState({historyVisible:true,history:JSON.parse(value)});
        } else {
            this.setState({historyVisible:true,history:[]});
            //TODO: alertt they dont have history
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
                        Alert.alert("Modal has been closed.");
                        this.setState({historyVisible});
                    }}
                    >
                    <SafeAreaView style={{backgroundColor:"#FFFFFF", width:"100%", height:"100%", marginTop:10}}>
                        <Text style={styles.txt}>History:</Text>
                        <TouchableOpacity style={styles.historyLogo} onPress={()=>this.hideHistory()}>
                            <Image
                                style={styles.cancelLogo}
                                source={require('../icons/cancel.png')}/>
                        </TouchableOpacity>
                        {this.state.history.map(name=>{
                            return (
                                <Text style={styles.historyTxt}>{name}</Text>
                            );
                        })}                        
                    </SafeAreaView>
                    </Modal>

                <Text style={styles.txt}>Balance(s)</Text>
                <TouchableOpacity style={styles.historyLogo} onPress={()=>this.showHistory()}>
                    <Image
                        style={styles.historyLogo}
                        source={require('../icons/history-icon.png')}/>
                </TouchableOpacity>
                {this.state.wallet.map((prop, key) => {
                    return (
                        <Text style={styles.txtBalance}>{prop[1]} {prop[0]}</Text>
                    );
                })}
                <Text style={styles.txt}>Convert from:</Text>
                <View style={{flexDirection:"row", margin:10}}>
                    <CurrencyPicker
                        currencyPickerRefBase={(ref2) => {currencyPickerRefBase = ref2}}
                        enable={true} darkMode={true}
                        currencyCode={this.state.base_currency}
                        showFlag={true}
                        showCurrencyName={true}
                        showCurrencyCode={true}
                        onSelectCurrency={(data) => this.setBaseCurrency(data)}
                        onOpen={() => {console.log("Open")}}
                        onClose={() => {console.log("Close")}}
                        showNativeSymbol={true}
                        showSymbol={false}
                        containerStyle={{
                            container: {},
                            flagWidth: 25,
                            currencyCodeStyle: {},
                            currencyNameStyle: {},
                            symbolStyle: {},
                            symbolNativeStyle: {}
                        }}
                        modalStyle={{
                            container: {},
                            searchStyle: {},
                            tileStyle: {},
                            itemStyle: {
                                itemContainer: {},
                                flagWidth: 25,
                                currencyCodeStyle: {},
                                currencyNameStyle: {},
                                symbolStyle: {},
                                symbolNativeStyle: {}
                            }
                        }}
                        title={"Currency"}
                        searchPlaceholder={"Search"}
                        showCloseButton={true}
                        showModalTitle={true}
                        />
                        {this.state.wallet.map((prop, key) => {
                            if(this.state.base_currency == prop[0]){
                                return (
                                    <Text style={{flex:1, fontSize:16,}}>{prop[1]} Available</Text>
                                );
                            }
                        })}
                </View>
                <Text style={styles.txt}>Convert to:</Text>
                <View style={styles.rowCtnr}>
                    <CurrencyPicker
                        currencyPickerRef={(ref) => {currencyPickerRef = ref}}
                        enable={true}
                        darkMode={true}
                        currencyCode={this.state.requested_code}
                        showFlag={true}
                        showCurrencyName={true}
                        showCurrencyCode={true}
                        onSelectCurrency={(data) => this.getConversionRate(data)}
                        onOpen={() => {console.log("Open")}}
                        onClose={() => {console.log("Close")}}
                        showNativeSymbol={true}
                        showSymbol={false}
                        containerStyle={{
                            container: {},
                            flagWidth: 25,
                            currencyCodeStyle: {},
                            currencyNameStyle: {},
                            symbolStyle: {},
                            symbolNativeStyle: {}
                        }}
                        modalStyle={{
                            container: {},
                            searchStyle: {},
                            tileStyle: {},
                            itemStyle: {
                                itemContainer: {},
                                flagWidth: 25,
                                currencyCodeStyle: {},
                                currencyNameStyle: {},
                                symbolStyle: {},
                                symbolNativeStyle: {}
                            }
                        }}
                        title={"Currency"}
                        searchPlaceholder={"Search"}
                        showCloseButton={true}
                        showModalTitle={true}
                        />
                </View>
                <Text style={styles.txt}>Rate: {this.state.current_rate}</Text>
                <View style={{flexDirection:"row"}}>
                    <Text style={styles.txt}>Convert Amount:</Text>
                    <NumericInput
                        style={{margin:5,borderWidth:1,borderRadius:5,flex:1}}
                        type='currency'
                        locale='en-US'
                        currency={this.state.requested_code}
                        value={this.state.exchange_value}
                        onUpdate={(value) => this.setCurrencyValue(value)}/>     
                </View>
                <View style={{flexDirection:"row"}}>
                    <Text style={styles.txt}>Converted Value:</Text>
                    <NumericInput
                        style={{margin:5,borderWidth:1,borderRadius:5,flex:1}}
                        type='currency'
                        locale='en-US'
                        currency={code}
                        value={this.state.last_exchange}/>     
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
        height:"100%"
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
        margin:10
    },
    txtBalance:{
        margin:10,
        fontSize:16,
    },
    txtTitle:{
        fontSize:16,
    },
    cancelLogo:{
        position:'absolute',
        top:15,
        right:15,
        width:30,
        height:30
    },
    historyLogo:{
        position:'absolute',
        top:5,
        right:15,
        width:30,
        height:30
    },
    historyTxt:{
        margin:5,
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
});
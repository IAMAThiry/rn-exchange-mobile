import CurrencyPicker from "react-native-currency-picker";
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

const CurrencyPickerComponent = () => {
    return (
        // <View style={styles.container}>
            <CurrencyPicker
                currencyPickerRefBase={(ref2) => {currencyPickerRefBase = ref2}}
                enable={true} darkMode={true}
                currencyCode={this.props.base_currency}
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
                showModalTitle={true}/>
        //  </View>
    );
}
export default CurrencyPickerComponent;
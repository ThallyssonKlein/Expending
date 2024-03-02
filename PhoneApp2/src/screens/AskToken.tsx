import React, { useState } from "react";
import { View, Text, Button, TextInput, Alert, StyleSheet } from "react-native";
import api, { validateToken } from '../api'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getCurrentSalary } from "./utils";

type IProps = {
    navigation: NativeStackNavigationProp<any, any, any>;
};

export default function AskToken({ navigation } : IProps) {
    const [buttonDisabled, setButtonDisabled] = useState(false)
    const [token, setToken] = useState('')
    
    async function handleSetToken (): Promise<void> {
        if (token.length === 0) {
          Alert.alert('Error', 'Please enter your token')
          return
        }

        setButtonDisabled(true)
    
        const isTokenValid = await validateToken(token)
    
        if (isTokenValid) {
          void AsyncStorage.setItem('@PhoneApp/token', token)
          api.setHeader('token', token)
          console.log("chamou getCurrentSalary")
          void getCurrentSalary(navigation)
        } else {
          setButtonDisabled(false)
          Alert.alert('Error', 'Invalid token')
          return
        }
      }

      return (
        <View style={{flex: 1, padding: 20}}>
            <View style={{flex: 1, justifyContent: "center"}}>
                <Text style={styles.text}>Enter your token</Text>
                <TextInput style={styles.textInput} placeholder="Token" onChangeText={(token: string) => { setToken(token) }} placeholderTextColor="black"/>
            </View>
            <Button title="OK" onPress={handleSetToken} disabled={buttonDisabled}/>
        </View>
      )
}

const styles = StyleSheet.create({
    text: {
        color: "black",
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 20
    },
    textInput: {
        borderWidth: 1,
        borderColor: 'black',
        borderRadius: 5,
        marginVertical: 5,
        color: 'black',
        padding: 10,
        marginBottom: 30
    }
})
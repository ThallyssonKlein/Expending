import React, { useEffect } from "react";
import { View, Text } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage'
import api, { validateToken} from "../api";
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getCurrentSalary } from "./utils";

type IProps = {
    navigation: NativeStackNavigationProp<any, any, any>;
};

export default function Loading({ navigation } : IProps) {
    async function getToken(): Promise<string | null> {
        try {
          const value = await AsyncStorage.getItem('@PhoneApp/token')
          return value
        } catch (e) {
          // error reading value
          console.error(e)
          return null
        }
      }
    
      useEffect(() => {
        void (async () => {
          const token = await getToken()
    
          if (!token) {
            navigation.navigate("AskToken")
            return
          }
    
          api.setHeader('token', token)
          const isTokenValid = await validateToken(token)
    
          if (isTokenValid) {
            api.setHeader('token', token)
            await getCurrentSalary(navigation)
          } else {
            navigation.navigate("AskToken")
          }
        })()
      }, [])
    
    return (
        <View style={{ flex: 1}}>
            <Text>Loading...</Text>
        </View>
    )
}
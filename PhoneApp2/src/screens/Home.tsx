import React from "react"
import { View, StyleSheet } from "react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import BottomSheet from '../components/BottomSheet'
import SalaryUsage from '../components/salary_usage'

export default function Home () {
    return (
        <GestureHandlerRootView style={styles.gestureHandler}>
            <View style={{ margin: 20, flex: 10 }}>
                <SalaryUsage />
            </View>
            <BottomSheet />
        </GestureHandlerRootView>
    )
}

const styles = StyleSheet.create({
    gestureHandler: {
      flex: 1,
      backgroundColor: '#f5faff',
      justifyContent: 'flex-start'
    },
    button: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: '#4a90e2',
      alignItems: 'center',
      justifyContent: 'center'
    },
    buttonText: {
      color: 'white'
    },
    picker: {
      borderWidth: 1,
      borderColor: '#4a90e2',
      borderRadius: 5,
      marginVertical: 5,
      color: 'black',
      flex: 1
    }
  })
  
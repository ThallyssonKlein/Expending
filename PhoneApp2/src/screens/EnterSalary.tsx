import React, { useState } from "react"
import { TextInput, View, Text, Alert, Button } from "react-native"
import { createSalary } from "../api"
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from "./types";

type EnterSalaryScreenNavigationProp = NativeStackScreenProps<
  RootStackParamList,
  'EnterSalary'
>;

type Props = {
    navigation: EnterSalaryScreenNavigationProp;
};
  
export default function EnterSalary({ navigation: { navigation } } : Props) {
    const [salary, setSalary] = useState('')
    const [vouncher, setVouncher] = useState('')

    function handleEnterSalary (): void {
        // if is empty string or not a number
        if ((salary.length === 0) || (vouncher.length === 0)) {
          Alert.alert('Error', 'Please enter your salary and vouncher')
          return
        }
    
        // try to convert salary and vouncher into numbers and alert if it goes wrong
        const salaryNumber = Number(salary)
        const vouncherNumber = Number(vouncher)
        if (isNaN(salaryNumber) || isNaN(vouncherNumber)) {
          Alert.alert('Error', 'Please enter a valid number')
          return
        }
    
        // call the api to createSalary
    
        void createSalary(salaryNumber, vouncherNumber)
        navigation.navigate("Home")
    }
    
    return (
        <View style={{flex: 1}}>
            <Text>Enter your salary and vouncher</Text>
            <TextInput placeholder="Salary" onChangeText={(salary: string) => { setSalary(salary) }} />
            <TextInput placeholder="Meal Vouncher" onChangeText={(vouncher: string) => { setVouncher(vouncher) }}/>
            <Button title="OK" onPress={handleEnterSalary}/>
        </View>
    )
}
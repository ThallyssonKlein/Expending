/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useState } from 'react';
import {
  Button as RnButton,
  View,
  TextInput,
} from 'react-native';

interface Props {
  disabled: boolean
  title: string,
  onPress: () => void
}

function Button({ disabled, title, onPress }: Props){
  return <View style={{marginBottom: 20}}>
    <RnButton disabled={disabled} title={title} onPress={onPress}/>
  </View>
}

import { create } from 'apisauce'

// define the api
const api = create({
  baseURL: 'https://my-expending-project.rj.r.appspot.com',
})


function App(): JSX.Element {
  const [energyDrinkDisabled, setEnergyDrinkDisabled] = useState(false)
  const [sweetDisabled, setSweetDisabled] = useState(false)
  const [friedPastryDisabled, setFriedPastryDisabled] = useState(false)
  const [deliveryDisabled, setDeliveryDisabled] = useState(false)
  const [text, setText] = useState("")

  async function energyDrink() {
    setEnergyDrinkDisabled(true)
    await api.post('/energy_drink')
    setEnergyDrinkDisabled(false)
  }
  async function sweet() {
    setSweetDisabled(true)
    console.log(text)
    await api.post('/unecessary_sweet', {value : Number(text)})
    setSweetDisabled(false)
  }
  async function friedPastry() {
    setFriedPastryDisabled(true)
    await api.post('/unecessary_fried_pastry')
    setFriedPastryDisabled(false)
  }
  async function delivery() {
    setDeliveryDisabled(true)
    await api.post('/unecessary_delivery', {value : Number(text)})
    setDeliveryDisabled(false)
  }

  return (
        <View style={{ padding: 30}}>
          <Button disabled={energyDrinkDisabled} title="Energy Drink" onPress={energyDrink}/>
          <Button disabled={sweetDisabled} title="Sweet" onPress={sweet}/>
          <Button disabled={friedPastryDisabled} title="Fried Pastry" onPress={friedPastry}/>
          <Button disabled={deliveryDisabled} title="Delivery" onPress={delivery}/>

          <TextInput style={{marginTop: 20, backgroundColor: "white", color: "black"}} keyboardType='numeric' value={text} onChangeText={text => setText(text)}/>
        </View>
  );
}

export default App;

import React from 'react'
import { View, StyleSheet, Button, TextInput, Switch, ScrollView } from 'react-native'
import Input from './Input'
import DatePicker from 'react-native-date-picker'
import { Picker } from '@react-native-picker/picker'
import { IConfig } from '../../../model/IConfig'

interface IProps {
    selectedOption: IConfig,
    setSelectedOption: (value: IConfig | undefined) => void,
    options: IConfig[],
}

export default function OptionOptions({ selectedOption, setSelectedOption, options }: IProps) {
    function onSelect (value: any): void {
        setSelectedOption(
          options.find(option => option.Name === value)
        )
    }
    
    return <View style={{ flex: 2 }}>
            <View style={{ marginBottom: 40 }}>
                <View style={styles.pickerContainer}>
                    <Picker
                    selectedValue={selectedOption?.Name}
                    onValueChange={itemValue => { onSelect(itemValue) } }
                    style={styles.picker}
                    dropdownIconColor="black"
                    >
                    {options.map(option => (
                        <Picker.Item key={option.Name} label={option.NameInApp} value={option.Name} />
                    ))}
                    </Picker>
                </View>
            {selectedOption != null && <Input option={selectedOption} value={value} setValue={setValue} isEnabled={isEnabled} setEnabled={setEnabled} />}
            <TextInput
                placeholder="Reason"
                value={reason}
                onChangeText={text => { setReason(text) }}
                style={styles.textInput}
                placeholderTextColor="black"
            />
            {
                selectedOption.CanUseMealsCard &&
                <Switch
                trackColor={{ false: '#767577', true: '#81b0ff' }}
                thumbColor={props.isEnabled ? '#f5dd4b' : '#f4f3f4'}
                ios_backgroundColor="#3e3e3e"
                onValueChange={(value) => { onSwitch(value) }}
                value={props.isEnabled}/>
            }
            {selectedOption.CustomName &&
                <TextInput
                    placeholder="Custom Name"
                    value={customName}
                    onChangeText={text => { setCustomName(text) }}
                    style={styles.textInput}
                    placeholderTextColor="black"
                />
                }
            <DatePicker
                mode="date"
                textColor="black"
                date={date}
                onDateChange={setDate} />
            </View>
            <Button
            onPress={() => {
                void onPressButton()
            }}
            disabled={disabledButton}
            title="SALVAR"
            />
        </View>
}

const styles = StyleSheet.create({
    bottomSheetContent: {
      flex: 1, // Adicionado
      padding: 16,
      backgroundColor: '#e6f2ff',
      justifyContent: 'space-between' // Adicionado
    },
    bottomSheetButton: {
      backgroundColor: '#4a90e2',
      padding: 10,
      alignItems: 'center',
      borderRadius: 5,
      marginTop: 10 // Adicionado para dar um espaço entre os componentes
    },
    // bottomSheetButtonText: {
    //   color: 'white',
    //   backgroundColor: '#4a90e2',
    // },
    picker: {
      borderWidth: 1,
      borderColor: '#4a90e2',
      borderRadius: 5,
      marginVertical: 5,
      color: 'black'
    },
    pickerContainer: {
      borderWidth: 1,
      borderColor: '#4a90e2',
      borderRadius: 5,
      marginVertical: 5
    },
    textInput: {
      marginVertical: 10,
      color: 'black',
      borderWidth: 1,
      borderColor: '#4a90e2',
      borderRadius: 5,
      padding: 10
    }
  })
  
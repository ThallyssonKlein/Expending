import { Picker } from '@react-native-picker/picker'
import React from 'react'
import { StyleSheet } from 'react-native'

export default function BigCategory(): JSX.Element {
    return <Picker
                onValueChange={(itemValue: any) => { setSelectedMode(itemValue) }}
                style={styles.picker}
                selectedValue={selectedMode}
                dropdownIconColor="black"
            >
                <Picker.Item key={'compulsions'} label={'Compulsions'} value={'compulsions'} />
                <Picker.Item key={'lifecost'} label={'Life Cost'} value={'lifecost'} />
                <Picker.Item key={'additional_expenses'} label={'Additional Expenses'} value={'additional_expenses'} />
            </Picker>
}

const styles = StyleSheet.create({
    picker: {
      borderWidth: 1,
      borderColor: '#4a90e2',
      borderRadius: 5,
      marginVertical: 5,
      color: 'black'
    },
})
  
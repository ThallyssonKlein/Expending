import { StyleSheet, TextInput, View, Switch } from 'react-native';
import { IOption } from '../api'
import { useState, useEffect } from 'react'

interface IProps {
  option: IOption;
  value: string;
  setValue: (value: string) => void
}

export default function Input(props: IProps) {
    const option = props.option
    const [isEnabled, setEnabled] = useState(option.defaultValue ? true : false);

    function onSwitch(switchValue: boolean){
      setEnabled(switchValue)
      if (switchValue == true) {
        props.setValue(option.defaultValue + '')
      } else {
        props.setValue('');
      }
    }

    useEffect(() => {
      setEnabled(option.defaultValue ? true : false)
    }, [props.option])

    return (
        <View style={styles.textInputContainer}>
          <TextInput
            placeholder="Digite algo..."
            value={props.value}
            onChangeText={text => props.setValue(text)}
            style={styles.textInput}
            placeholderTextColor="black"
            editable={!isEnabled}
          />
          {
            option.defaultValue ? 
            <Switch
              trackColor={{false: '#767577', true: '#81b0ff'}}
              thumbColor={isEnabled ? '#f5dd4b' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
              onValueChange={(value) => onSwitch(value)}
              value={isEnabled}/>
            : null
          }
      </View>
    )
}

const styles = StyleSheet.create({
  textInputContainer: {
    flexDirection: 'row'
  },
  textInput: {
    marginVertical: 10,
    color: 'black', 
    borderWidth: 1,
    borderColor: '#4a90e2', 
    borderRadius: 5,
    padding: 10,
    flex: 1,
  },
})
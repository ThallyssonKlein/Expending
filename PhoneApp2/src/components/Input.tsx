import { StyleSheet, TextInput, View, Switch, Text } from 'react-native';
import { IOption } from '../api'
import { useEffect } from 'react'

interface IProps {
  option: IOption;
  value: string;
  isEnabled: boolean;
  setValue: (value: string) => void
  setEnabled: (value: boolean) => void
}

export default function Input(props: IProps) {
    const option = props.option

    function onSwitch(switchValue: boolean){
      props.setEnabled(switchValue)
      if (switchValue == true) {
        props.setValue(option.defaultValue + '')
      } else {
        props.setValue('');
      }
    }

    useEffect(() => {
      props.setEnabled(option.defaultValue ? true : false)
    }, [props.option])

    return (
        <View style={styles.textInputContainer}>
          <TextInput
            placeholder="Digite algo..."
            value={props.value}
            onChangeText={text => props.setValue(text)}
            style={styles.textInput}
            placeholderTextColor="black"
            editable={!props.isEnabled}
          />
          {
            option.defaultValue ? 
            <View style={{flexDirection: 'row'}}>
              <Text style={{color: 'black', alignSelf: 'center', marginLeft: 10}}>Default</Text>
              <Switch
                trackColor={{false: '#767577', true: '#81b0ff'}}
                thumbColor={props.isEnabled ? '#f5dd4b' : '#f4f3f4'}
                ios_backgroundColor="#3e3e3e"
                onValueChange={(value) => onSwitch(value)}
                value={props.isEnabled}/>

            </View>
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
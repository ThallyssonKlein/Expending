// TODO - Add traceability
import { View, Text, StyleSheet, Alert, Button, TextInput } from 'react-native'
import BottomSheet from '@gorhom/bottom-sheet'
import React, { useState, useEffect, useRef } from 'react'
import { getOptions as getOptionsApi, post } from '../api'
import { type IConfig, type IConfigPlusValues } from '../model/IConfig'
import { Picker } from '@react-native-picker/picker'
import Input from './Input'
import Animated from 'react-native-reanimated'
import DatePicker from 'react-native-date-picker'
import { format } from 'date-fns'
// import * as Sentry from '@sentry/react-native'
// import { type Transaction } from '@sentry/types'

// TODO - Is this component being used?
const CustomBackground = (props: any): JSX.Element => {
  const containerStyle = {
    ...props.style,
    backgroundColor: '#e6f2ff'
  }

  return <Animated.View pointerEvents="none" style={containerStyle} />
}

export default function BottomSheetComponent (): JSX.Element {
  const bottomSheetRef = useRef(null)
  const [snapPoints, setSnapPoints] = useState(['45%', '70%'])
  const [canRenderBottomSheet, setCanRenderBottomSheet] = useState(false)

  const [selectedMode, setSelectedMode] = useState('compulsions')

  const [options, setOptions] = useState<IConfig[]>([])
  const [selectedOption, setSelectedOption] = useState<IConfig>()

  const [value, setValue] = useState<string>('0')

  const [disabledButton, setDisabledButton] = useState<boolean>()
  const [isEnabled, setEnabled] = useState<boolean>((selectedOption?.DefaultValue) !== 0)

  const [date, setDate] = useState(new Date())

  const [reason, setReason] = useState('')

  const [customName, setCustomName] = useState('')

  useEffect(() => {
    void (async () => {
      const response = await getOptions()
      const defaultOption = findDefaultOptionForEachMode(response, selectedMode)
      setOptions(response)
      setSelectedOption(defaultOption)
    })()
  }, [])

  useEffect(() => {
    if (options.length > 0 && selectedOption != null && selectedOption !== undefined) {
      setCanRenderBottomSheet(true)
      setEnabled((selectedOption?.DefaultValue) !== 0)
      setValue(((selectedOption?.DefaultValue) != null) ? selectedOption?.DefaultValue + '' : '0')
    }
  }, [options, selectedOption])

  useEffect(() => {
    void (async () => {
      const response = await getOptions()
      const defaultOption = findDefaultOptionForEachMode(response, selectedMode)
      setOptions(response)
      setSelectedOption(defaultOption)
      console.log('selectedMode', selectedMode)
      if (selectedMode === 'additional_expenses' || selectedMode === 'lifecost') {
        setSnapPoints(['55%', '80%'])
      } else {
        setSnapPoints(['45%', '70%'])
      }
    })()
  }, [selectedMode])

  function findDefaultOptionForEachMode (data: IConfig[], mode: string): IConfig | undefined {
    return data.find((item: IConfig) => {
      if (mode === 'compulsions' && item.Name === 'unecessary_delivery') {
        return item
      } else if (mode === 'lifecost' && item.Name === 'psicologa_1') {
        return item
      } else if (item.Name === 'additional_expenses_default') {
        return item
      }
      return undefined
    })
  }

  async function getOptions (): Promise<IConfig[]> {
    // const transaction = Sentry.startTransaction({ name: 'app-get-options' })

    const response = await getOptionsApi(selectedMode)

    if (response.length === 0) {
      Alert.alert('Erro ao buscar opções para o select')
      // transaction.finish()
      return []
    } else {
      // transaction.setData(`response-${counter}`, response)
      const defaultOption = findDefaultOptionForEachMode(response, selectedMode)

      if (defaultOption !== undefined) {
        // transaction.finish()
        return response
      } else {
        Alert.alert('Erro ao buscar opções para o select')
        // transaction.finish()
        return []
      }
    }
  }

  function onSelect (value: any): void {
    setSelectedOption(
      options.find(option => option.Name === value)
    )
  }

  async function onPressButton (secondCall: boolean = false): Promise<void> {
    // just for typscript
    if (selectedOption == null) return

    // validate if value is not empty
    if (value === '') {
      Alert.alert('Erro', 'O valor não pode ser vazio')
      return
    }

    if (value === '0' && !secondCall) {
      Alert.alert(
        'Salvar valor 0',
        'Voce realmente quer salvar o valor 0?',
        [
          {
            text: 'Cancelar',
            onPress: () => { console.log('Cancel Pressed') },
            style: 'cancel'
          },
          { text: 'OK', onPress: () => { void onPressButton(true) } }
        ],
        { cancelable: false }
      )
      return
    }

    // TODO - Why not use float from the beginning?
    let body: IConfigPlusValues = {
      id: selectedOption.id,
      Value: parseFloat(value),
      Date: format(date, 'yyyy-MM-dd'),
      CanUseMealsCard: selectedOption.CanUseMealsCard,
      Name: selectedOption.Name,
      NameInApp: selectedOption.NameInApp,
      Category: selectedOption.Category,
      Subcategory: selectedOption.Subcategory,
      CustomName: selectedOption.CustomName,
      DefaultValue: selectedOption.DefaultValue,
      DefaultName: selectedOption.DefaultName
    }

    if (reason !== '') {
      body = {
        ...body,
        Reason: reason
      }
    }

    if (selectedOption.CustomName) {
      if (customName.length === 0) {
        Alert.alert('Erro', 'O nome customizado não pode ser vazio')
        return
      } else {
        body = {
          ...body,
          CustomNameValue: customName
        }
      }
    }

    setDisabledButton(true)
    const response: boolean = await post(body)
    setDisabledButton(false)

    if (!response) {
      Alert.alert('Erro', 'Não foi possível salvar o item')
      await Promise.resolve()
    }

    // TODO - Validate if it is really null in the cases without default value
    if (selectedOption.Name == null) {
      setValue('')
    } else {
      if (!isEnabled) {
        setValue('')
      }
    }
  }

  return <BottomSheet
          ref={bottomSheetRef}
          index={0}
          snapPoints={snapPoints}
          backgroundComponent={CustomBackground}>
          <View style={styles.bottomSheetContent}>
            <View style={{ maxHeight: 200, flex: 0.3 }}>
              <Picker
                onValueChange={(itemValue: any) => { setSelectedMode(itemValue) }}
                style={styles.picker}
                selectedValue={selectedMode}
                dropdownIconColor="black"
              >
                <Picker.Item key={'compulsions'} label={'Compulsions'} value={'compulsions'} />
                <Picker.Item key={'lifecost'} label={'Life Cost'} value={'lifecost'} />
                <Picker.Item key={'additional_expenses'} label={'Additional Expenses'} value={'additional_expenses'} />
              </Picker>

              {!canRenderBottomSheet && <Text style={{ marginLeft: 20, marginTop: 20, color: 'black' }}>Loading...</Text>}
            </View>

            {canRenderBottomSheet && (selectedOption !== null && selectedOption !== undefined) &&
              <View style={{ flex: 2 }}>
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
          </View>
        </BottomSheet>
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

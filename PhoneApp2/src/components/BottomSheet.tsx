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
import * as Sentry from '@sentry/react-native'

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
  const snapPoints = ['35%', '60%']
  const [canRenderBottomSheet, setCanRenderBottomSheet] = useState(false)

  const [selectedMode, setSelectedMode] = useState('compulsions')

  const [options, setOptions] = useState<IConfig[]>([])
  const [selectedOption, setSelectedOption] = useState<IConfig>()

  const [value, setValue] = useState<string>('0')

  const [disabledButton, setDisabledButton] = useState<boolean>(false)
  const [isEnabled, setEnabled] = useState<boolean>(false)

  const [date, setDate] = useState(new Date())

  const [reason, setReason] = useState('')

  const [customName, setCustomName] = useState('')

  useEffect(() => {
    void getOptions()
  }, [])

  useEffect(() => {
    if (options.length > 0 && selectedOption != null) {
      setCanRenderBottomSheet(true)
      setEnabled(selectedOption?.DefaultValue != null)
      setValue(((selectedOption?.DefaultValue) != null) ? selectedOption?.DefaultValue + '' : '0')
    }
  }, [options, selectedOption])

  function onChangeMode (mode: string): void {
    setSelectedMode(mode)
    // void getOptions()
  }

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

  async function getOptions (counter = 0, transactionFromPastFunction = null): Promise<void> {
    const transaction = transactionFromPastFunction ?? Sentry.startTransaction({ name: 'app-get-options' })
    transaction.setData('counter', counter)

    if (counter > 1) {
      Alert.alert('Erro ao buscar opções para o select')
      transaction.finish()
      return
    }

    const response = await getOptionsApi(selectedMode)

    if (response.length > 0) {
      transaction.setData(`response-${counter}`, response)

      const defaultOption = findDefaultOptionForEachMode(response, selectedMode)

      if (defaultOption !== undefined) {
        setOptions(response)
        setSelectedOption(defaultOption)
        transaction.finish()
      } else {
        setTimeout(() => {
          void getOptions(counter + 1)
        }, 3000)
      }
    }
  }

  function onSelect (value: any): void {
    setSelectedOption(
      options.find(option => option.Name === value)
    )
  }

  async function onPressButton (): Promise<void> {
    // just for typscript
    if (selectedOption == null) return

    // validate if value is not empty
    if (value === '') {
      Alert.alert('Erro', 'O valor não pode ser vazio')
      return
    }

    // TODO - Why not use float from the beginning?
    let body: IConfigPlusValues = {
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
          <View style={{ maxHeight: 200 }}>
            <Picker
              onValueChange={(itemValue: any) => { onChangeMode(itemValue) }}
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

            {canRenderBottomSheet &&
              <View>
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
                  <TextInput
                      placeholder="Custom Name"
                      value={customName}
                      onChangeText={text => { setCustomName(text) }}
                      style={styles.textInput}
                      placeholderTextColor="black"
                  />

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
    padding: 10,
    flex: 1
  }
})

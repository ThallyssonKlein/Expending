// TODO - Add traceability
import { View, Text, StyleSheet, Alert, Button } from 'react-native'
import BottomSheet from '@gorhom/bottom-sheet'
import React, { useState, useEffect, useRef } from 'react'
import { getOptions as getOptionsApi, post, type IBodyPostInput } from '../api'
import type IOption from '../model/IOption'
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
  const [canRenderBottomSheet, setCanRenderBottomSheet] = useState(false);

  const [selectedMode, setSelectedMode] = useState('compulsions')

  const [options, setOptions] = useState<IOption[]>([])
  const [selectedOption, setSelectedOption] = useState<IOption>()

  const [value, setValue] = useState<string>('0')

  const [disabledButton, setDisabledButton] = useState<boolean>(false)
  const [isEnabled, setEnabled] = useState<boolean>(false)

  const [date, setDate] = useState(new Date())

  useEffect(() => {
    void getOptions()
  }, [selectedMode])

  useEffect(() => {
    void getOptions()
  }, [])
  useEffect(() => {
    if (options.length > 0 && selectedOption != null) {
      setCanRenderBottomSheet(true)
      setEnabled(selectedOption?.defaultValue != null)
      setValue(((selectedOption?.defaultValue) != null) ? selectedOption?.defaultValue + '' : '0')
    }
  }, [options, selectedOption])

  function findDefaultOptionForEachMode (data: IOption[], mode: string): IOption | undefined {
    return data.find((item: IOption) => {
      if (mode === 'compulsions' && item.path === '/unecessary_delivery') {
        return item
      } else if (mode === 'lifecost' && item.path === '/food') {
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
        setOptions(options)
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
      options.find(option => option.path === value)
    )
  }

  async function onPressButton (): Promise<void> {
    // just for typscript
    if (selectedOption == null) return

    // TODO - Why not use float from the beginning?
    let body: IBodyPostInput = { value: parseFloat(value) }

    const formattedDate = format(date, 'yyyy-MM-dd')
    if (date.toDateString() !== new Date().toDateString()) {
      body = { ...body, date: formattedDate }
    }

    setDisabledButton(true)
    const response: boolean = await post(selectedOption.path, body)
    setDisabledButton(false)

    if (!response) {
      Alert.alert('Erro', 'Não foi possível salvar o item')
      await Promise.resolve()
    }

    // TODO - Validate if it is really null in the cases without default value
    if (selectedOption.defaultValue == null) {
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
            <Picker
                  selectedValue={selectedMode}
                  onValueChange={(itemValue: any) => { setSelectedMode(itemValue) }}
                  style={styles.picker}
                  dropdownIconColor="black" // Cor da seta e do texto
                >
                  <Picker.Item key={'compulsions'} label={'Compulsions'} value={'compulsions'} />
                  <Picker.Item key={'lifecost'} label={'Life Cost'} value={'lifecost'} />
                  <Picker.Item key={'additional_expenses'} label={'Additional Expenses'} value={'additional_expenses'} />
            </Picker>

            {
              !canRenderBottomSheet
                ? <Text style={{ color: 'black' }}>Loading...</Text>

                : <View>
                <View>
                  <View style={styles.pickerContainer}>
                      <Picker
                        selectedValue={selectedOption?.path}
                        onValueChange={itemValue => { onSelect(itemValue) } }
                        style={styles.picker}
                        dropdownIconColor="black" // Cor da seta e do texto
                      >
                        {options.map(option => (
                          <Picker.Item key={option.path} label={option.nameInApp} value={option.path} />
                        ))}
                      </Picker>
                  </View>
                  {selectedOption != null && <Input option={selectedOption} value={value} setValue={setValue} isEnabled={isEnabled} setEnabled={setEnabled} />}
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
                    title="SALVAR" />
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
  }
})

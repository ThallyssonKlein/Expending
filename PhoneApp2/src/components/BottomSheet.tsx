import { View, Text, StyleSheet, Alert, Button } from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import { useState, useEffect, useRef } from 'react';
import { IOption, getOptions as getOptionsApi, post } from '../api';
import { Picker } from '@react-native-picker/picker';
import Input from './Input'
import Animated from 'react-native-reanimated';
import DatePicker from 'react-native-date-picker'
import { format } from 'date-fns';
import * as Sentry from "@sentry/react-native";

const CustomBackground = (props: any) => {
  const containerStyle = {
    ...props.style,
    backgroundColor: '#e6f2ff'
  };

  return <Animated.View pointerEvents="none" style={containerStyle} />;
};

interface IBody {
  value: number,
  date?: string
}

interface IProps {
  selectedMode: string
}

export default function BottomSheetComponent(props: IProps) {
  const [options, setOptions] = useState<IOption[]>([]);
  const bottomSheetRef = useRef(null);
  const snapPoints = ['35%', '60%'];
  const [selectedOption, setSelectedOption] = useState<IOption>();
  const [value, setValue] = useState<string>(selectedOption ? (selectedOption.defaultValue ? selectedOption.defaultValue + '' : '') : '')
  const [disabledButton, setDisabledButton] = useState<boolean>(false);
  const [isEnabled, setEnabled] = useState<boolean>(selectedOption ? (selectedOption.defaultValue ? true : false) : false);
  const [date, setDate] = useState(new Date())

  useEffect(() => {
    getOptions()
  }, [props.selectedMode])

  function getOptions() {
    getOptionsApi(props.selectedMode).then(data => {
      if (data) {
        console.log(data)
        //Sentry.captureMessage(data.toString())
        setOptions(data);
        const defaultOption = data.find((item: IOption) => {
          if (props.selectedMode === 'compulsions' && item.path === '/unecessary_delivery') {
            return item
          } else if (item.path === '/food') {
            return item
          }
        })
        if (defaultOption) {
          refresh(defaultOption)
        } else {
          Alert.alert('Opção padrão não encontrada!')
        }
      }
    }).catch(_ => {
      Alert.alert('Erro ao buscar opções')
    })
  }

  useEffect(() => {
    getOptions()
  },[]);

  function onSelect(value: any) {
    const option = options.find(option => option.path === value);
    if (option) {
      refresh(option)
    }
  }

  function refresh(option: IOption) {
    setSelectedOption(option)
    setEnabled(option ? (option.defaultValue ? true : false) : false)
    setValue(option?.defaultValue ? option?.defaultValue + '' : '')
  }

  async function onPressButton() {
    const formattedDate = format(date, 'yyyy-MM-dd');
    if (!value) {
      Alert.alert('Erro', 'Preencha o valor!')
      return
    }

    if (selectedOption?.path && value) {
      let body: IBody = { value: parseFloat(value) }
      if (date.toDateString() !== new Date().toDateString()) {
        body = { ...body, date: formattedDate }
      }
      setDisabledButton(true)
      const response = await post(selectedOption?.path, body)
      setDisabledButton(false)

      if (!response) {
        Alert.alert('Erro', 'Não foi possível salvar o item')
        return
      }

      if (!selectedOption.defaultValue) {
        setValue('')
      } else {
        if (!isEnabled) {
          setValue('')
        }
      }
    }
  }

  if (options.length > 0 && selectedOption) {
    return (
      <BottomSheet
          ref={bottomSheetRef}
          index={0}
          snapPoints={snapPoints}
          backgroundComponent={CustomBackground}>
        <View style={styles.bottomSheetContent}>
          <View>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={selectedOption.path}
                  onValueChange={itemValue => onSelect(itemValue)}
                  style={styles.picker}
                  dropdownIconColor="black" // Cor da seta e do texto
                >
                  {
                    options.map(option => (
                      <Picker.Item key={option.path} label={option.nameInApp} value={option.path} />
                    ))
                  }
                </Picker>

              </View>
              {selectedOption && <Input option={selectedOption} value={value} setValue={setValue} isEnabled={isEnabled} setEnabled={setEnabled}/>}
              <DatePicker
                  mode="date"
                  textColor="black"
                  date={date}
                  onDateChange={setDate}
                />
          </View>
          <Button
              onPress={() => onPressButton()}
              disabled={disabledButton}
              title="SALVAR"/>
          </View>
      </BottomSheet>  
    );
  }

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      backgroundComponent={CustomBackground}>
      <View style={styles.bottomSheetContent}>
        <Text style={{ color: "black"}}>Loading...</Text>
      </View>
    </BottomSheet>
  );
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
    marginTop: 10, // Adicionado para dar um espaço entre os componentes
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
    color: "black"
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#4a90e2',
    borderRadius: 5,
    marginVertical: 5,
  },
});

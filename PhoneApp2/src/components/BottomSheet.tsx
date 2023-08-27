import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import { useState, useEffect, useRef } from 'react';
import { IOption, getOptions, post } from '../api';
import { Picker } from '@react-native-picker/picker';
import Input from './Input'
import Animated from 'react-native-reanimated';

const CustomBackground = (props: any) => {
  const containerStyle = {
    ...props.style,
    backgroundColor: '#e6f2ff'
  };

  return <Animated.View pointerEvents="none" style={containerStyle} />;
};

export default function BottomSheetComponent() {
  const [options, setOptions] = useState<IOption[]>([]);
  const bottomSheetRef = useRef(null);
  const snapPoints = ['25%', '50%'];
  const [selectedOption, setSelectedOption] = useState<IOption>();
  const [value, setValue] = useState<string>(selectedOption ? (selectedOption.defaultValue ? selectedOption.defaultValue + '' : '') : '')

  const retry = (fn: any, retries = 3, delay = 469000) => {
    return new Promise((resolve, reject) => {
        const attempt = () => {
            fn()
                .then(resolve)
                .catch((err: any) => {
                    if (retries === 0) {
                        reject(err);
                    } else {
                        setTimeout(() => {
                            retries--;
                            attempt();
                        }, delay);
                    }
                });
        };
        attempt();
    });
  };

  useEffect(() => {
    retry(getOptions, 3).then((data: any) => {
      if (data) {
        setOptions(data);
        setSelectedOption(data.find(item => item.path === '/unecessary_delivery'))
      }
    }).catch(error => {
        console.error("Falhou após 3 tentativas", error);
    });  
  },[]);

  function onSelect(value: any) {
    const option = options.find(option => option.path === value);
    setSelectedOption(option)
    setValue(option?.defaultValue ? option?.defaultValue + '' : '')
  }

  function onPressButton() {
    if (selectedOption?.path && value) {
      post(selectedOption?.path, { value: parseInt(value) })
    }
  }

  if (options.length > 0 && selectedOption) {
    console.log(options)
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
              {selectedOption && <Input option={selectedOption} value={value} setValue={setValue} />}
          </View>
          <TouchableOpacity
              style={styles.bottomSheetButton}
              onPress={() => onPressButton()}
              disabled={!selectedOption}>
              <Text style={styles.bottomSheetButtonText}>Botão</Text>
          </TouchableOpacity>
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
  bottomSheetButtonText: {
    color: 'white',
  },
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

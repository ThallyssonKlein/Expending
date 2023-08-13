import React, { useRef, useState } from 'react';
import { View, TouchableOpacity, Text, TextInput, StyleSheet } from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import { Picker } from '@react-native-picker/picker';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

const CustomBackground = (props) => {
  const containerStyle = {
    ...props.style,
    backgroundColor: '#e6f2ff', // BottomSheet - Azul Claro
  };

  return <Animated.View pointerEvents="none" style={containerStyle} />;
};

export default function MyScreen() {
  const bottomSheetRef = useRef(null);
  const [selectedValue, setSelectedValue] = useState('option1');

  const snapPoints = ['25%', '50%'];

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.buttonContainer}>
        {['A', 'B', 'C', 'D'].map((button, index) => (
          <TouchableOpacity key={index} style={styles.button}>
            <Text style={styles.buttonText}>{button}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        backgroundComponent={CustomBackground}
      >
        <View style={styles.bottomSheetContent}>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedValue}
              onValueChange={(itemValue) => setSelectedValue(itemValue)}
              style={{ color: 'black' }} // Cor do texto (e possivelmente da seta) - Preto
            >
              <Picker.Item label="Opção 1" value="option1" />
              <Picker.Item label="Opção 2" value="option2" />
            </Picker>
          </View>
          <TextInput placeholder="Digite algo"
                    style={styles.textInput}
                    placeholderTextColor="black"/>
          <TouchableOpacity
            style={styles.bottomSheetButton}
            onPress={() => console.log('Botão pressionado')}
          >
            <Text style={styles.bottomSheetButtonText}>Botão</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5faff', // Fundo Principal - Azul Claro Suave
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingTop: 10,
  },
  button: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4a90e2', // Botões (Topo) - Azul Médio
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white', // Texto nos Botões (Topo) - Branco
  },
  bottomSheetContent: {
    padding: 16,
    backgroundColor: '#e6f2ff', // BottomSheet - Azul Claro (um pouco mais escuro que o fundo principal)
  },
  bottomSheetButton: {
    backgroundColor: '#4a90e2', // Botão no BottomSheet - Azul Médio
    padding: 10,
    alignItems: 'center',
    borderRadius: 5,
  },
  bottomSheetButtonText: {
    color: 'white', // Texto no Botão do BottomSheet - Branco
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#4a90e2', // Cor da borda - Azul Médio
    borderRadius: 5,
    marginVertical: 5,
    backgroundColor: '#f0f4f7', // Cor de fundo do contêiner do Picker
  },
  textInput: {
    marginVertical: 10,
    color: 'black', // Cor do texto do TextInput - Preto
    borderWidth: 1,
    borderColor: '#4a90e2', // Cor da borda - Azul Médio
    borderRadius: 5,
    padding: 10, // Preenchimento do TextInput
  },
});

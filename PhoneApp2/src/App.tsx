import { View, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet from './components/BottomSheet';
import { Picker } from '@react-native-picker/picker';
import { useState } from 'react';

export default function MyScreen() {
  const [selectedMode, setSelectedMode] = useState("compulsions");

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.buttonContainer}>
        {/* {['B', 'C'].map((button, index) => (
          <TouchableOpacity key={index} style={styles.button}>
            <Text style={styles.buttonText}>{button}</Text>
          </TouchableOpacity>
        ))} */}
        <Picker
            selectedValue={selectedMode}
            onValueChange={(itemValue: any) => setSelectedMode(itemValue)}
            style={styles.picker}
            dropdownIconColor="black" // Cor da seta e do texto
          >
            <Picker.Item key={'compulsions'} label={'Compulsions'} value={'compulsions'} />
            <Picker.Item key={'lifecost'} label={'Life Cost'} value={'lifecost'} />
        </Picker>
      </View>
      <BottomSheet selectedMode={selectedMode}/>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5faff'
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
    backgroundColor: '#4a90e2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white'
  },
  picker: {
    borderWidth: 1,
    borderColor: '#4a90e2',
    borderRadius: 5,
    marginVertical: 5,
    color: "black",
    flex: 1
  }
});

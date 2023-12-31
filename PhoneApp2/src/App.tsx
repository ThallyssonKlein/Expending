import { View, StyleSheet, Alert } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import BottomSheet from './components/BottomSheet'
import React, { useEffect, useState } from 'react'
import SalaryUsage from './components/salary_usage'
import * as Sentry from '@sentry/react-native'
import { getCurrentSalary as getCurrentSalaryFromApi, createSalary } from './api'
import Dialog from 'react-native-dialog'

Sentry.init({
  dsn: 'https://9511c52db9eb90e0c8ca6797e6c84c92@o4505779172737024.ingest.sentry.io/4506039201103872',
  // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
  // We recommend adjusting this value in production.
  tracesSampleRate: 1.0
})

function App (): JSX.Element {
  const [dialogVisible, setDialogVisible] = useState(false)
  const [salary, setSalary] = useState('')
  const [vouncher, setVouncher] = useState('')

  async function getCurrentSalary (): Promise<void> {
    const response = await getCurrentSalaryFromApi()

    if (response == null) {
      setDialogVisible(true)
    }
  }

  useEffect(() => {
    void getCurrentSalary()
  }, [])

  function handleEnterSalary (): void {
    // if is empty string or not a number
    if ((salary.length === 0) || (vouncher.length === 0)) {
      Alert.alert('Error', 'Please enter your salary and vouncher')
      return
    }

    // try to convert salary and vouncher into numbers and alert if it goes wrong
    const salaryNumber = Number(salary)
    const vouncherNumber = Number(vouncher)
    if (isNaN(salaryNumber) || isNaN(vouncherNumber)) {
      Alert.alert('Error', 'Please enter a valid number')
      return
    }

    // call the api to createSalary

    void createSalary(salaryNumber, vouncherNumber)
  }

  return (
    <GestureHandlerRootView style={styles.gestureHandler}>
      <View style={{ flex: 1 }}>
      </View>
      <View style={{ margin: 20, flex: 10 }}>
            {dialogVisible &&
                  <Dialog.Container visible={dialogVisible}>
                      <Dialog.Title>Enter your salary and vouncher</Dialog.Title>
                      <Dialog.Input label="Salary" onChangeText={(salary: string) => { setSalary(salary) }} />
                      <Dialog.Input label="Meal Vouncher" onChangeText={(vouncher: string) => { setVouncher(vouncher) }}/>
                      <Dialog.Button label="OK" onPress={handleEnterSalary} />
                  </Dialog.Container>
            }
            <SalaryUsage />
      </View>
      <BottomSheet />
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  gestureHandler: {
    flex: 1,
    backgroundColor: '#f5faff',
    justifyContent: 'flex-start'
  },
  button: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4a90e2',
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonText: {
    color: 'white'
  },
  picker: {
    borderWidth: 1,
    borderColor: '#4a90e2',
    borderRadius: 5,
    marginVertical: 5,
    color: 'black',
    flex: 1
  }
})

export default Sentry.wrap(App)

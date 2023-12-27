import { View, StyleSheet } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import BottomSheet from './components/BottomSheet'
import React from 'react'
import SalaryUsage from './components/salary_usage'
import * as Sentry from '@sentry/react-native'

Sentry.init({
  dsn: 'https://9511c52db9eb90e0c8ca6797e6c84c92@o4505779172737024.ingest.sentry.io/4506039201103872',
  // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
  // We recommend adjusting this value in production.
  tracesSampleRate: 1.0
})

function App (): JSX.Element {
  return (
    <GestureHandlerRootView style={styles.gestureHandler}>
      <View style={{ flex: 1 }}>
      </View>
      <View style={{ margin: 20, flex: 10 }}>
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

import React from 'react'
// import * as Sentry from '@sentry/react-native'
import { NavigationContainer } from '@react-navigation/native';

import Home from './screens/Home';
import Loading from './screens/Loading';
import AskToken from './screens/AskToken';
import EnterSalary from './screens/EnterSalary';

// Sentry.init({
//   dsn: 'https://9511c52db9eb90e0c8ca6797e6c84c92@o4505779172737024.ingest.sentry.io/4506039201103872',
//   // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
//   // We recommend adjusting this value in production.
//   tracesSampleRate: 1.0
// })

import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

function App () {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Loading">
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Loading" component={Loading} />
        <Stack.Screen name="AskToken" component={AskToken} />
        <Stack.Screen name="EnterSalary" component={EnterSalary} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}


export default App
// export default Sentry.wrap(App)

import { getCurrentSalary as getCurrentSalaryFromApi } from '../api';
import { NativeStackNavigationProp } from "@react-navigation/native-stack"

export async function getCurrentSalary(navigation: NativeStackNavigationProp<any, any, any>): Promise<void> {
    const response = await getCurrentSalaryFromApi()

    if (response == null) {
        navigation.navigate("EnterSalary")
    } else {
        navigation.navigate("Home")
    }
}

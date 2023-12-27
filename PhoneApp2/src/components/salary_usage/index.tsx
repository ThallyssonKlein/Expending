import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet } from 'react-native'
// import * as Progress from 'react-native-progress';
import Dialog from 'react-native-dialog'

import { getSalaryDetails, type SalaryUsageDetails } from '../../api'

const SalaryUsage = ({
  whatWillBeLeft,
  whatWillBeLeftWithoutCompulsions,
  currentSalaryUsePercentage,
  dialogVisible
}: SalaryUsageDetails) => {
  const [salary, setSalary] = useState('0')

  const handleEnterSalary = (salary: string): void => {

  }

  return (
    <View style={styles.container}>
       {dialogVisible && 
            <Dialog.Container visible={dialogVisible}>
                <Dialog.Title>Enter your salary</Dialog.Title>
                <Dialog.Input label="Salary" onChangeText={(salary: string) => { setSalary(salary) }}
                ></Dialog.Input>
                <Dialog.Button label="OK" onPress={handleEnterSalary} />
            </Dialog.Container>
       }
        <View style={styles.row}>
            <Text style={styles.title}>Detalhes do salário</Text>
        </View>
        <View style={styles.row}>
            <Text style={styles.detailName}>O que vai sobrar: </Text>
            <Text style={[styles.detailValue, { color: 'green' }]}>{whatWillBeLeft || 'Loading...'}</Text>
        </View>
        <View style={styles.row}>
            <Text style={styles.detailName}>Sem compulsões: </Text>
            <Text style={[styles.detailValue, { color: 'green' }]}>{whatWillBeLeftWithoutCompulsions && whatWillBeLeft
              ? whatWillBeLeftWithoutCompulsions + ' (' + (whatWillBeLeftWithoutCompulsions - whatWillBeLeft).toFixed(2) + ')'
              : 'Loading...'}</Text>
        </View>
        <View style={styles.row}>
            <Text style={styles.detailName}>Quantos % já foi do salário: </Text>
            <Text style={[styles.detailValue, { color: 'red' }]}>{currentSalaryUsePercentage ? currentSalaryUsePercentage + '%' : 'Loading...'}</Text>
        </View>
        {/* <View style={styles.row}>
          <Progress.Bar progress={0.3} width={200} />
        </View> */}
    </View>
  )
}

const SalaryUsageWrapper = () => {
  const [salaryUsageDetailsState, setSalaryUsageDetailsState] = useState<SalaryUsageDetails>({})
  const [dialogVisible, setDialogVisible] = useState(false)

  useEffect(() => {
    void getSalaryDetails().then(salaryDetails => {
      if (salaryDetails != null) {
        setSalaryUsageDetailsState(salaryDetails)
      } else {
        setDialogVisible(true)
      }
    })
  }, [])

  return <SalaryUsage {...salaryUsageDetailsState, dialogVisible}/>
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#e6f2ff',
    borderRadius: 10,
    padding: 10,
    flexDirection: 'column'
  },
  row: {
    flexDirection: 'row',
    margin: 20
  },
  detailName: {
    fontSize: 17,
    color: 'black'
  },
  detailValue: {
    fontSize: 17,
    fontWeight: 'bold'
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black'
  }
})

export default SalaryUsageWrapper

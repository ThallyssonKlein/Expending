import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
// import * as Progress from 'react-native-progress';

import { getSalaryDetails, SalaryUsageDetails } from '../../api'

const SalaryUsage = ({
    whatWillBeLeft,
    whatWillBeLeftWithoutCompulsions,
    currentSalaryUsePercentage,
}: SalaryUsageDetails) => {
  return (
    <View style={styles.container}>
        <View style={styles.row}>
            <Text style={styles.title}>Detalhes do salário</Text>
        </View>
        <View style={styles.row}>
            <Text style={styles.detailName}>O que vai sobrar: </Text>
            <Text style={[styles.detailValue, { color: 'green'}]}>{whatWillBeLeft ? whatWillBeLeft : 'Loading...'}</Text>
        </View>
        <View style={styles.row}>
            <Text style={styles.detailName}>Sem compulsões: </Text>
            <Text style={[styles.detailValue, { color: 'green'}]}>{whatWillBeLeftWithoutCompulsions && whatWillBeLeft ? 
                        whatWillBeLeftWithoutCompulsions + ' (' + (whatWillBeLeftWithoutCompulsions -  whatWillBeLeft).toFixed(2) + ')' : 'Loading...'}</Text>
        </View>
        <View style={styles.row}>
            <Text style={styles.detailName}>Quantos % já foi do salário: </Text>
            <Text style={[styles.detailValue, { color: 'red' }]}>{currentSalaryUsePercentage ? currentSalaryUsePercentage + '%' : 'Loading...'}</Text>
        </View>
        {/* <View style={styles.row}>
          <Progress.Bar progress={0.3} width={200} />
        </View> */}
    </View>
  );
};

const SalaryUsageWrapper = () => {
    const [salaryUsageDetailsState, setSalaryUsageDetailsState] = useState<SalaryUsageDetails>({})

    useEffect(() => {
        getSalaryDetails().then((salaryUsageDetails) => {
            if (salaryUsageDetails) setSalaryUsageDetailsState(salaryUsageDetails)
        })
    }, []);

    return <SalaryUsage {...salaryUsageDetailsState}/>
}


const styles = StyleSheet.create({
  container: {
    backgroundColor: '#e6f2ff',
    borderRadius: 10,
    padding: 10,
    flexDirection: 'column',
  },
  row: {
    flexDirection: 'row',
    margin: 20
  },
  detailName: {
    fontSize: 17,
    color: 'black',
  },
  detailValue: {
    fontSize: 17,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
  }
});

export default SalaryUsageWrapper;
import React from 'react'
import { View, StyleSheet } from 'react-native'
import PieChart from 'react-native-pie-chart'

interface Props {
  series: number[]
  sliceColor: string[]
}

const SalaryUsage = ({ series, sliceColor }: Props): JSX.Element => {
  const widthAndHeight = 250

  return (
    <View style={styles.container}>
      <PieChart
        widthAndHeight={widthAndHeight}
        series={series}
        sliceColor={sliceColor}
        coverRadius={0.45}
        coverFill={'#FFF'}
      />
    </View>
  )
}

const SalaryUsageWrapper = (): JSX.Element => {
  const series = [123, 321, 123, 789, 537]
  const sliceColor = ['#fbd203', '#ffb300', '#ff9100', '#ff6c00', '#ff3c00']

  return <SalaryUsage series={series} sliceColor={sliceColor} />
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center'
  }
})

export default SalaryUsageWrapper

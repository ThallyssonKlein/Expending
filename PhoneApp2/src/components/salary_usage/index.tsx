import React, { useEffect, useState } from 'react'
import { View, StyleSheet, Text } from 'react-native'
import PieChart from 'react-native-pie-chart'
import { type SalaryUsageDetails, getSalaryDetails } from '../../api'

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
  const [detailsLoaded, setDetailsLoaded] = useState(false)
  const [series, setSeries] = useState<number[]>([])
  // const series = [123, 321, 123, 789, 537]
  const sliceColor = ['#fbd203', '#ffb300', '#ff9100', '#ff6c00', '#ff3c00']

  useEffect(() => {
    void (async () => {
      const salaryDetails: SalaryUsageDetails = await getSalaryDetails()

      if (salaryDetails == null) {
        return
      }
      setSeries([salaryDetails.lifeCostTotal, salaryDetails.extrasTotal, salaryDetails.compulsionsTotal])
      setDetailsLoaded(true)
    })()
  }, [])

  if (!detailsLoaded) {
    return <Text>Loading...</Text>
  } else {
    return <SalaryUsage series={series} sliceColor={sliceColor} />
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center'
  }
})

export default SalaryUsageWrapper

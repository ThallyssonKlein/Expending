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
  const total: number = series.reduce((a, b) => a + b, 0)

  // create also a legend for the pie chart
  // add also the percentage on the legend
  return (
    <View style={styles.container}>
      <PieChart
        widthAndHeight={widthAndHeight}
        series={series}
        sliceColor={sliceColor}
        coverRadius={0.45}
        coverFill={'#FFF'}
      />
      <View style={{ flexDirection: 'row', marginTop: 10 }}>
        <View style={{ width: 10, height: 10, backgroundColor: sliceColor[0], marginRight: 5 }} />
        <Text style={{ color: 'black' }}>Salary rest {series[0].toFixed(2)} ({((series[0] / total) * 100).toFixed(2)}%)</Text>
      </View>
      <View style={{ flexDirection: 'row', marginTop: 10 }}>
        <View style={{ width: 10, height: 10, backgroundColor: sliceColor[1], marginRight: 5 }} />
        <Text style={{ color: 'black' }}>Meal vouncher rest {series[1].toFixed(2)} ({((series[1] / total) * 100).toFixed(2)}%)</Text>
      </View>
      <View style={{ flexDirection: 'row', marginTop: 10 }}>
        <View style={{ width: 10, height: 10, backgroundColor: sliceColor[2], marginRight: 5 }} />
        <Text style={{ color: 'black' }}>Life cost total {series[2].toFixed(2)} ({((series[2] / total) * 100).toFixed(2)}%)</Text>
      </View>
      <View style={{ flexDirection: 'row', marginTop: 10 }}>
        <View style={{ width: 10, height: 10, backgroundColor: sliceColor[3], marginRight: 5 }} />
        <Text style={{ color: 'black' }}>Extras total {series[3].toFixed(2)} ({((series[3] / total) * 100).toFixed(2)}%)</Text>
      </View>
      <View style={{ flexDirection: 'row', marginTop: 10 }}>
        <View style={{ width: 10, height: 10, backgroundColor: sliceColor[4], marginRight: 5 }} />
        <Text style={{ color: 'black' }}>Compulsions total {series[4].toFixed(2)} ({((series[4] / total) * 100).toFixed(2)}%)</Text>
      </View>
    </View>
  )
}

const SalaryUsageWrapper = (): JSX.Element => {
  const [detailsLoaded, setDetailsLoaded] = useState(false)
  const [showAmountsOnly, setShowAmountsOnly] = useState(false)
  const [series, setSeries] = useState<number[]>([])
  const sliceColor = ['#fbd203', '#ffb300', '#ff9100', '#ff6c00', '#ff3c00']
  const [salaryDetails, setSalaryDetails] = useState<SalaryUsageDetails>()

  useEffect(() => {
    void (async () => {
      const salaryDetails: SalaryUsageDetails | null = await getSalaryDetails()

      if (salaryDetails === null) {
        console.log('Deu o return')
        return
      }

      if (salaryDetails.compulsionsTotal < 0 ||
                  salaryDetails.extrasTotal < 0 ||
                  salaryDetails.lifeCostTotal < 0 ||
                  salaryDetails.mealVouncherRest < 0 || salaryDetails.salaryRest < 0) {
        console.log('Deu o return')
        setShowAmountsOnly(true)
        setSalaryDetails(salaryDetails)
        return
      }

      setSeries([salaryDetails.salaryRest,
        salaryDetails.mealVouncherRest,
        salaryDetails.lifeCostTotal,
        salaryDetails.extrasTotal,
        salaryDetails.compulsionsTotal])
      setDetailsLoaded(true)
    })()
  }, [])

  if (showAmountsOnly) {
    return <View>
          <Text style={{ color: 'black' }}>Salary Rest: { salaryDetails?.salaryRest.toFixed(2) }</Text>
          <Text style={{ color: 'black' }}>Meal Vouncher Rest: { salaryDetails?.mealVouncherRest.toFixed(2) }</Text>
      </View>
  }

  if (!detailsLoaded) {
    return <View>
      <Text>Loading...</Text>
    </View>
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

"use client"

import { useState, useEffect } from "react"
import Navbar from "./Navbar"
import { Bar, Pie } from "react-chartjs-2"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from "chart.js"
import "./DataAnalysis.css"

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement)

function DataAnalysis() {
  const [analyticsData, setAnalyticsData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonth())

  // Get current month in YYYY-MM format
  function getCurrentMonth() {
    const date = new Date()
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
  }

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/admin/analytics")
        if (!response.ok) {
          throw new Error("Failed to fetch analytics data")
        }
        const data = await response.json()
        setAnalyticsData(data)
        setLoading(false)
      } catch (err) {
        setError(err.message)
        setLoading(false)
      }
    }

    fetchAnalyticsData()
  }, [])

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="data-analysis-container">
          <h1>Loading analytics data...</h1>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <Navbar />
        <div className="data-analysis-container">
          <h1>Error: {error}</h1>
        </div>
      </div>
    )
  }

  // Prepare chart data
  const prepareMonthlyChartData = (data, label) => {
    if (!data || data.length === 0) return null

    return {
      labels: data.map((item) => {
        const [year, month] = item.month.split("-")
        return `${getMonthName(Number.parseInt(month))} ${year}`
      }),
      datasets: [
        {
          label: label,
          data: data.map((item) => item.total_amount),
          backgroundColor: "rgba(54, 162, 235, 0.6)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 1,
        },
      ],
    }
  }

  const prepareItemChartData = (data, label, colorIndex = 0) => {
    if (!data || data.length === 0) return null

    const backgroundColors = [
      "rgba(54, 162, 235, 0.6)",
      "rgba(255, 99, 132, 0.6)",
      "rgba(75, 192, 192, 0.6)",
      "rgba(255, 206, 86, 0.6)",
      "rgba(153, 102, 255, 0.6)",
      "rgba(255, 159, 64, 0.6)",
    ]

    const borderColors = [
      "rgba(54, 162, 235, 1)",
      "rgba(255, 99, 132, 1)",
      "rgba(75, 192, 192, 1)",
      "rgba(255, 206, 86, 1)",
      "rgba(153, 102, 255, 1)",
      "rgba(255, 159, 64, 1)",
    ]

    return {
      labels: data.map((item) => {
        const nameKey = Object.keys(item).find((key) => key.includes("name"))
        return item[nameKey]
      }),
      datasets: [
        {
          label: label,
          data: data.map((item) => item.total_amount),
          backgroundColor: backgroundColors[colorIndex % backgroundColors.length],
          borderColor: borderColors[colorIndex % borderColors.length],
          borderWidth: 1,
        },
      ],
    }
  }

  const preparePieChartData = (data) => {
    if (!data || data.length === 0) return null

    const backgroundColors = [
      "rgba(54, 162, 235, 0.6)",
      "rgba(255, 99, 132, 0.6)",
      "rgba(75, 192, 192, 0.6)",
      "rgba(255, 206, 86, 0.6)",
      "rgba(153, 102, 255, 0.6)",
      "rgba(255, 159, 64, 0.6)",
    ]

    const borderColors = [
      "rgba(54, 162, 235, 1)",
      "rgba(255, 99, 132, 1)",
      "rgba(75, 192, 192, 1)",
      "rgba(255, 206, 86, 1)",
      "rgba(153, 102, 255, 1)",
      "rgba(255, 159, 64, 1)",
    ]

    return {
      labels: data.map((item) =>
        item.purchase_type === "Shop" && item.purchase_id === 0 ? "Deposits" : item.purchase_type,
      ),
      datasets: [
        {
          data: data.map((item) => item.total_amount),
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          borderWidth: 1,
        },
      ],
    }
  }

  // Helper function to get month name
  function getMonthName(monthNumber) {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ]
    return months[monthNumber - 1]
  }

  // Calculate total sales for current month
  const getCurrentMonthSales = (data) => {
    if (!data) return 0
    const currentMonthData = data.find((item) => item.month === currentMonth)
    return currentMonthData ? currentMonthData.total_amount : 0
  }

  // Chart options
  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Amount (₹)",
        },
      },
    },
  }

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Overall Sales Distribution",
      },
    },
  }

  // Prepare chart data
  const shopMonthlyData = prepareMonthlyChartData(analyticsData.shopMonthlySales, "Shop Monthly Sales")
  const shopProductData = prepareItemChartData(analyticsData.shopProductSales, "Shop Product Sales", 1)
  const foodMonthlyData = prepareMonthlyChartData(analyticsData.foodMonthlySales, "Food Monthly Sales")
  const foodItemData = prepareItemChartData(analyticsData.foodItemSales, "Food Item Sales", 2)
  const movieMonthlyData = prepareMonthlyChartData(analyticsData.movieMonthlySales, "Movie Monthly Sales")
  const movieData = prepareItemChartData(analyticsData.movieSales, "Movie Sales", 3)
  const depositData = prepareMonthlyChartData(analyticsData.depositFunds, "Deposit Funds")
  const pieData = preparePieChartData(analyticsData.overallSales)

  return (
    <div>
      <Navbar />
      <div className="data-analysis-container">
        <h1 className="main-title">Data Analysis Dashboard</h1>

        <div className="analysis-section">
          <h2>Shop Products Analysis</h2>
          <div className="chart-container">
            <div className="chart">
              <h3>Monthly Shop Sales</h3>
              {shopMonthlyData ? <Bar data={shopMonthlyData} options={barOptions} /> : <p>No data available</p>}
              <h3>
                Total Shop Sales in {getMonthName(Number.parseInt(currentMonth.split("-")[1]))}: ₹
                {getCurrentMonthSales(analyticsData.shopMonthlySales)}
              </h3>
            </div>
            <div className="chart">
              <h3>Sales by Product</h3>
              {shopProductData ? <Bar data={shopProductData} options={barOptions} /> : <p>No data available</p>}
            </div>
          </div>
        </div>

        <div className="analysis-section">
          <h2>Food Products Analysis</h2>
          <div className="chart-container">
            <div className="chart">
              <h3>Monthly Food Sales</h3>
              {foodMonthlyData ? <Bar data={foodMonthlyData} options={barOptions} /> : <p>No data available</p>}
              <h3>
                Total Food Sales in {getMonthName(Number.parseInt(currentMonth.split("-")[1]))}: ₹
                {getCurrentMonthSales(analyticsData.foodMonthlySales)}
              </h3>
            </div>
            <div className="chart">
              <h3>Sales by Food Item</h3>
              {foodItemData ? <Bar data={foodItemData} options={barOptions} /> : <p>No data available</p>}
            </div>
          </div>
        </div>

        <div className="analysis-section">
          <h2>Movie Tickets Analysis</h2>
          <div className="chart-container">
            <div className="chart">
              <h3>Monthly Movie Sales</h3>
              {movieMonthlyData ? <Bar data={movieMonthlyData} options={barOptions} /> : <p>No data available</p>}
              <h3>
                Total Movie Sales in {getMonthName(Number.parseInt(currentMonth.split("-")[1]))}: ₹
                {getCurrentMonthSales(analyticsData.movieMonthlySales)}
              </h3>
            </div>
            <div className="chart">
              <h3>Sales by Movie</h3>
              {movieData ? <Bar data={movieData} options={barOptions} /> : <p>No data available</p>}
            </div>
          </div>
        </div>

        <div className="analysis-section">
          <h2>Deposit Funds Analysis</h2>
          <div className="chart-container">
            <div className="chart">
              <h3>Monthly Deposits</h3>
              {depositData ? <Bar data={depositData} options={barOptions} /> : <p>No data available</p>}
              <h3>
                Total Deposits in {getMonthName(Number.parseInt(currentMonth.split("-")[1]))}: ₹
                {getCurrentMonthSales(analyticsData.depositFunds)}
              </h3>
            </div>
          </div>
        </div>

        <div className="analysis-section">
          <h2>Overall Sales Distribution</h2>
          <div className="chart-container pie-chart-container">
            <div className="chart pie-chart">
              {pieData ? <Pie data={pieData} options={pieOptions} /> : <p>No data available</p>}
            </div>
            <div className="summary">
              <h3>Summary</h3>
              {analyticsData.overallSales.map((item, index) => (
                <p key={index}>
                  {item.purchase_type === "Shop" && item.purchase_id === 0 ? "Deposits" : item.purchase_type}: ₹
                  {item.total_amount}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DataAnalysis


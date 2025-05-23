"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { db } from "@/lib/db"
import type { ReadmissionTrend } from "@/types"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts"

export function ReadmissionTrendChart() {
  const [data, setData] = useState<ReadmissionTrend[] | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const trend = await db.getReadmissionTrend()
        setData(trend)
      } catch (error) {
        console.error("Error fetching readmission trend:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return <Card className="h-96 animate-pulse bg-gray-100" />
  }

  if (!data) {
    return <div>Error loading readmission trend</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Readmission Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip
                formatter={(value) => [`${value} patients`, "Readmissions"]}
                contentStyle={{ backgroundColor: "white", borderRadius: "8px", border: "1px solid #e2e8f0" }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#ec4899"
                strokeWidth={2}
                dot={{ r: 4, fill: "#ec4899", strokeWidth: 2, stroke: "white" }}
                activeDot={{ r: 6, fill: "#ec4899", strokeWidth: 2, stroke: "white" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

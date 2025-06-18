'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

// Mock data for the chart
const mockData = [
  { date: '2024-01-01', inbound: 120, outbound: 80, net: 40 },
  { date: '2024-01-02', inbound: 150, outbound: 90, net: 60 },
  { date: '2024-01-03', inbound: 100, outbound: 110, net: -10 },
  { date: '2024-01-04', inbound: 180, outbound: 95, net: 85 },
  { date: '2024-01-05', inbound: 130, outbound: 120, net: 10 },
  { date: '2024-01-06', inbound: 160, outbound: 85, net: 75 },
  { date: '2024-01-07', inbound: 140, outbound: 100, net: 40 },
]

export function StockHistoryChart() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Stock Movement Trends</CardTitle>
            <CardDescription>Track inbound and outbound inventory flows</CardDescription>
          </div>
          <Select defaultValue="7d">
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={mockData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            />
            <YAxis />
            <Tooltip 
              labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
              })}
              formatter={(value, name) => [value, name === 'inbound' ? 'Inbound' : name === 'outbound' ? 'Outbound' : 'Net Change']}
            />
            <Line 
              type="monotone" 
              dataKey="inbound" 
              stroke="#10b981" 
              strokeWidth={2}
              name="inbound"
            />
            <Line 
              type="monotone" 
              dataKey="outbound" 
              stroke="#ef4444" 
              strokeWidth={2}
              name="outbound"
            />
            <Line 
              type="monotone" 
              dataKey="net" 
              stroke="#3b82f6" 
              strokeWidth={2}
              strokeDasharray="5 5"
              name="net"
            />
          </LineChart>
        </ResponsiveContainer>
        
        <div className="flex items-center justify-center gap-6 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Inbound</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Outbound</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-blue-500 border-dashed border-blue-500"></div>
            <span>Net Change</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

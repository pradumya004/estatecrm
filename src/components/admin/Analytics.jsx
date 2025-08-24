// src/components/admin/Analytics.jsx
import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Home,
  DollarSign,
  Target,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  PieChart,
  LineChart,
  Activity,
  Zap,
  Award,
  Clock,
  MapPin,
  Phone,
  Mail,
  Star,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  const [isLoading, setIsLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState({
    overview: {
      totalRevenue: 45678900,
      revenueGrowth: 23.1,
      totalLeads: 2847,
      leadsGrowth: 12.5,
      conversionRate: 18.4,
      conversionGrowth: 4.2,
      avgDealSize: 1605000,
      dealSizeGrowth: 8.7
    },
    chartData: {
      revenue: [2.1, 2.8, 3.2, 2.9, 3.8, 4.1, 4.5, 3.9, 4.2, 4.8, 5.1, 4.9],
      leads: [180, 220, 190, 250, 280, 320, 290, 310, 340, 380, 420, 390],
      conversion: [15.2, 16.8, 14.9, 17.3, 18.1, 19.2, 17.8, 18.9, 19.8, 20.1, 18.4, 19.6]
    },
    topPerformers: [
      { id: 1, name: 'Rajesh Kumar', deals: 23, revenue: 12500000, growth: 15.2, avatar: '👨‍💼' },
      { id: 2, name: 'Priya Sharma', deals: 19, revenue: 9800000, growth: 8.7, avatar: '👩‍💼' },
      { id: 3, name: 'Amit Patel', deals: 17, revenue: 8900000, growth: 12.1, avatar: '👨‍💼' },
      { id: 4, name: 'Sneha Singh', deals: 15, revenue: 7200000, growth: 22.3, avatar: '👩‍💼' },
      { id: 5, name: 'Rohit Verma', deals: 14, revenue: 6800000, growth: 5.4, avatar: '👨‍💼' }
    ],
    propertyTypes: [
      { type: 'Residential', value: 45, count: 124, color: 'from-blue-500 to-blue-600' },
      { type: 'Commercial', value: 30, count: 89, color: 'from-green-500 to-green-600' },
      { type: 'Industrial', value: 15, count: 34, color: 'from-purple-500 to-purple-600' },
      { type: 'Land', value: 10, count: 28, color: 'from-orange-500 to-orange-600' }
    ],
    leadSources: [
      { source: 'Website', percentage: 35, leads: 997, color: 'bg-blue-500' },
      { source: 'Referral', percentage: 28, leads: 798, color: 'bg-green-500' },
      { source: 'Social Media', percentage: 20, leads: 569, color: 'bg-purple-500' },
      { source: 'Google Ads', percentage: 12, leads: 342, color: 'bg-yellow-500' },
      { source: 'Others', percentage: 5, leads: 142, color: 'bg-gray-500' }
    ],
    recentDeals: [
      { id: 1, property: 'Luxury Apartment - Bandra', agent: 'Rajesh Kumar', amount: 4500000, date: '2024-01-15', client: 'Sarah Johnson' },
      { id: 2, property: 'Commercial Space - Andheri', agent: 'Priya Sharma', amount: 8900000, date: '2024-01-14', client: 'Tech Solutions Ltd' },
      { id: 3, property: 'Villa - Juhu', agent: 'Amit Patel', amount: 12000000, date: '2024-01-13', client: 'Arun Kapoor' },
      { id: 4, property: 'Office Space - BKC', agent: 'Sneha Singh', amount: 6700000, date: '2024-01-12', client: 'Digital Corp' },
      { id: 5, property: 'Retail Shop - Linking Road', agent: 'Rohit Verma', amount: 3400000, date: '2024-01-11', client: 'Fashion Hub' }
    ]
  });

  useEffect(() => {
    // Simulate data loading based on time range
    setIsLoading(true);
    setTimeout(() => {
      // Here you would typically fetch data from API
      setIsLoading(false);
    }, 800);
  }, [timeRange]);

  const MetricCard = ({ title, value, change, icon: Icon, color, prefix = '', suffix = '', trend }) => (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 group">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-r ${color} group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className={`flex items-center text-sm font-medium ${
          trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'
        }`}>
          {trend === 'up' ? <ArrowUpRight className="w-4 h-4 mr-1" /> : 
           trend === 'down' ? <ArrowDownRight className="w-4 h-4 mr-1" /> : null}
          {Math.abs(change)}%
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-2xl font-bold text-gray-900">
          {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
        </p>
        <p className="text-gray-600 text-sm">{title}</p>
      </div>
    </div>
  );

  const ChartContainer = ({ title, children, actions }) => (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {actions && <div className="flex items-center space-x-2">{actions}</div>}
      </div>
      {children}
    </div>
  );

  const SimpleChart = ({ data, type = 'bar', height = 200 }) => (
    <div className={`flex items-end justify-between space-x-2`} style={{ height: `${height}px` }}>
      {data.map((value, index) => {
        const normalizedHeight = (value / Math.max(...data)) * (height - 40);
        return (
          <div key={index} className="flex flex-col items-center">
            <div
              className="w-8 bg-gradient-to-t from-blue-500 to-purple-500 rounded-t-lg transition-all duration-500 hover:from-purple-500 hover:to-blue-500"
              style={{ height: `${normalizedHeight}px` }}
            />
            <span className="text-xs text-gray-500 mt-2">
              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][index]}
            </span>
          </div>
        );
      })}
    </div>
  );

  const PerformerCard = ({ performer, rank }) => (
    <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
      <div className="flex-shrink-0">
        <div className="relative">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-lg">
            {performer.avatar}
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-xs font-bold text-gray-900">
            {rank}
          </div>
        </div>
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900">{performer.name}</p>
        <div className="flex items-center space-x-4 mt-1">
          <span className="text-xs text-gray-600">{performer.deals} deals</span>
          <span className="text-xs text-gray-600">₹{(performer.revenue / 100000).toFixed(1)}L</span>
          <span className={`text-xs font-medium ${performer.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
            +{performer.growth}%
          </span>
        </div>
      </div>
      
      <div className="flex-shrink-0">
        {rank <= 3 && (
          <div className="text-lg">
            {rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}
          </div>
        )}
      </div>
    </div>
  );

  const DealCard = ({ deal }) => (
    <div className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:shadow-md transition-all duration-200">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
          <DollarSign className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="font-semibold text-gray-900 text-sm">{deal.property}</p>
          <p className="text-xs text-gray-600">by {deal.agent}</p>
          <p className="text-xs text-gray-500">{deal.client}</p>
        </div>
      </div>
      
      <div className="text-right">
        <p className="font-bold text-green-600">₹{(deal.amount / 100000).toFixed(1)}L</p>
        <p className="text-xs text-gray-500">{new Date(deal.date).toLocaleDateString()}</p>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Comprehensive insights into your business performance</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          
          <button className="flex items-center px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </button>
          
          <button className="flex items-center px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
          
          <button 
            onClick={() => setIsLoading(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Revenue"
          value={Math.round(analyticsData.overview.totalRevenue / 100000)}
          change={analyticsData.overview.revenueGrowth}
          trend="up"
          icon={DollarSign}
          color="from-green-500 to-emerald-500"
          prefix="₹"
          suffix="L"
        />
        <MetricCard
          title="Total Leads"
          value={analyticsData.overview.totalLeads}
          change={analyticsData.overview.leadsGrowth}
          trend="up"
          icon={Users}
          color="from-blue-500 to-blue-600"
        />
        <MetricCard
          title="Conversion Rate"
          value={analyticsData.overview.conversionRate}
          change={analyticsData.overview.conversionGrowth}
          trend="up"
          icon={Target}
          color="from-purple-500 to-purple-600"
          suffix="%"
        />
        <MetricCard
          title="Avg Deal Size"
          value={Math.round(analyticsData.overview.avgDealSize / 100000)}
          change={analyticsData.overview.dealSizeGrowth}
          trend="up"
          icon={Award}
          color="from-orange-500 to-orange-600"
          prefix="₹"
          suffix="L"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Trend */}
        <ChartContainer
          title="Revenue Trend"
          actions={
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1"
            >
              <option value="revenue">Revenue</option>
              <option value="leads">Leads</option>
              <option value="conversion">Conversion</option>
            </select>
          }
        >
          <SimpleChart 
            data={analyticsData.chartData[selectedMetric]} 
            height={250}
          />
        </ChartContainer>

        {/* Property Distribution */}
        <ChartContainer title="Property Type Distribution">
          <div className="space-y-4">
            {analyticsData.propertyTypes.map((type, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded bg-gradient-to-r ${type.color}`}></div>
                  <span className="text-sm font-medium text-gray-900">{type.type}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">{type.count} properties</span>
                  <span className="text-sm font-bold text-gray-900">{type.value}%</span>
                </div>
              </div>
            ))}
          </div>
        </ChartContainer>
      </div>

      {/* Lead Sources & Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Lead Sources */}
        <ChartContainer title="Lead Sources">
          <div className="space-y-3">
            {analyticsData.leadSources.map((source, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">{source.source}</span>
                  <span className="text-sm text-gray-600">{source.leads} leads ({source.percentage}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${source.color} transition-all duration-500`}
                    style={{ width: `${source.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </ChartContainer>

        {/* Top Performers */}
        <ChartContainer title="Top Performing Agents">
          <div className="space-y-3">
            {analyticsData.topPerformers.map((performer, index) => (
              <PerformerCard key={performer.id} performer={performer} rank={index + 1} />
            ))}
          </div>
        </ChartContainer>
      </div>

      {/* Recent Deals */}
      <ChartContainer title="Recent Deals">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {analyticsData.recentDeals.map((deal) => (
            <DealCard key={deal.id} deal={deal} />
          ))}
        </div>
      </ChartContainer>
    </div>
  );
};

export default Analytics;
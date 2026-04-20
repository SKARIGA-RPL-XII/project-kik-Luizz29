import { useEffect, useState } from "react";
import { Page } from "components/shared/Page";
import { Card, Avatar, Button } from "components/ui";
import { 
  UsersIcon, 
  AcademicCapIcon, 
  CheckCircleIcon, 
  ClockIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from "@heroicons/react/24/outline";
import Chart from "react-apexcharts";
import { API_URL } from "utils/config";

export default function Home() {
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    fetch(`${API_URL}/admin/dashboard-stats`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setStatsData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching dashboard stats:", err);
        setLoading(false);
      });
  }, []);

  // Chart options for performance visualization
  const chartOptions = {
    chart: {
      type: 'area',
      toolbar: { show: false },
      fontFamily: 'Inter, sans-serif',
    },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 2 },
    xaxis: {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
      labels: { style: { colors: '#64748b' } }
    },
    yaxis: { labels: { style: { colors: '#64748b' } } },
    grid: { borderColor: '#e2e8f0', strokeDashArray: 4 },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.45,
        opacityTo: 0.05,
        stops: [20, 100, 100, 100]
      }
    },
    colors: ['#3b82f6'],
  };

  const chartSeries = [{
    name: 'Exams Completed',
    data: [310, 400, 280, 510, 420, 109, 100]
  }];

  const stats = [
    { 
      name: 'Total Students', 
      value: statsData?.stats?.total_students ?? '...', 
      trend: '+12.5%', 
      trendUp: true, 
      icon: UsersIcon, 
      color: 'text-blue-600', 
      bg: 'bg-blue-50' 
    },
    { 
      name: 'Active Exams', 
      value: statsData?.stats?.active_exams ?? '...', 
      trend: '+2', 
      trendUp: true, 
      icon: AcademicCapIcon, 
      color: 'text-purple-600', 
      bg: 'bg-purple-50' 
    },
    { 
      name: 'Total Subjects', 
      value: statsData?.stats?.total_subjects ?? '...', 
      trend: '+18%', 
      trendUp: true, 
      icon: CheckCircleIcon, 
      color: 'text-green-600', 
      bg: 'bg-green-50' 
    },
    { 
      name: 'Total Teachers', 
      value: statsData?.stats?.total_teachers ?? '...', 
      trend: '0%', 
      trendUp: true, 
      icon: ClockIcon, 
      color: 'text-orange-600', 
      bg: 'bg-orange-50' 
    },
  ];

  const recentResults = statsData?.recent_results || [];

  return (
    <Page title="Dashboard">
      <div className="transition-content w-full px-(--margin-x) pt-5 lg:pt-8 space-y-6 pb-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-dark-50">
              Welcome back, Admin! 👋
            </h2>
            <p className="text-gray-500 dark:text-dark-300 mt-1">
              Here&apos;s what&apos;s happening with your exams today.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="hidden sm:flex">
              Download Report
            </Button>
            <Button variant="primary" size="sm">
              Create New Exam
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.name} className="p-5 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div className={`p-2.5 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium ${stat.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.trendUp ? <ArrowUpIcon className="h-3 w-3" /> : <ArrowDownIcon className="h-3 w-3" />}
                  {stat.trend}
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-500 dark:text-dark-300">{stat.name}</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-dark-50 mt-1">
                  {loading ? '...' : stat.value}
                </h3>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart */}
          <Card className="lg:col-span-2 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-50">Performance Overview</h3>
                <p className="text-sm text-gray-500 dark:text-dark-300">Exam completion rate over time</p>
              </div>
              <select className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2 dark:bg-dark-600 dark:border-dark-500 dark:text-white">
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
              </select>
            </div>
            <div className="h-80 w-full">
              <Chart options={chartOptions} series={chartSeries} type="area" height="100%" />
            </div>
          </Card>

          {/* Quick Stats/Activity */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-50">Recent Results</h3>
              <Button variant="ghost" size="xs">View All</Button>
            </div>
            <div className="space-y-5">
              {recentResults.length > 0 ? (
                recentResults.map((result) => (
                  <div key={result.id} className="flex items-center gap-4">
                    <Avatar name={result.student_nm} size="sm" className="bg-gray-100" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-dark-50 truncate">
                        {result.student_nm}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-dark-300 truncate">
                        {result.exam_nm}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${result.score >= 70 ? 'text-green-600' : 'text-red-600'}`}>
                        {result.score}%
                      </p>
                      <p className="text-[10px] text-gray-400 dark:text-dark-400">
                        {result.date}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-gray-500 italic">No recent results found</div>
              )}
            </div>
            <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800/30">
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-blue-500 rounded-full text-white mt-0.5">
                  <AcademicCapIcon className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100">Quick Tip</h4>
                  <p className="text-xs text-blue-700 dark:text-blue-200 mt-1 leading-relaxed">
                    Students who take practice exams score 25% higher on average.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

      </div>
    </Page>
  );
}

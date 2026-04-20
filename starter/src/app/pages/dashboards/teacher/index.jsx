import { useEffect, useState } from "react";
import { Page } from "components/shared/Page";
import { Card, Avatar, Button } from "components/ui";
import { 
  AcademicCapIcon, 
  BookOpenIcon,
  DocumentTextIcon,
  ClockIcon
} from "@heroicons/react/24/outline";
import { API_URL } from "utils/config";
import { useAuthContext } from "app/contexts/auth/context";

export default function TeacherHome() {
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthContext();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    fetch(`${API_URL}/teacher/dashboard-stats`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setStatsData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching teacher dashboard stats:", err);
        setLoading(false);
      });
  }, []);

  const stats = [
    { 
      name: 'Assigned Exams', 
      value: statsData?.stats?.total_assigned_exams ?? '0', 
      icon: AcademicCapIcon, 
      color: 'text-blue-600', 
      bg: 'bg-blue-50' 
    },
    { 
      name: 'Total Bank Soal', 
      value: statsData?.stats?.total_question_banks ?? '0', 
      icon: BookOpenIcon, 
      color: 'text-green-600', 
      bg: 'bg-green-50' 
    },
    { 
      name: 'Total Questions', 
      value: statsData?.stats?.total_questions ?? '0', 
      icon: DocumentTextIcon, 
      color: 'text-purple-600', 
      bg: 'bg-purple-50' 
    },
  ];

  return (
    <Page title="Teacher Dashboard">
      <div className="transition-content w-full px-(--margin-x) pt-5 lg:pt-8 space-y-6 pb-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-dark-50">
              Welcome back, {user?.name || 'Teacher'}! 
            </h2>
            <p className="text-gray-500 dark:text-dark-300 mt-1">
              Pantau progres ujian dan aktivitas siswa Anda hari ini.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="primary" size="sm">
              Kelola Bank Soal
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map((stat) => (
            <Card key={stat.name} className="p-5 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div className={`p-2.5 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
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
          {/* Recent Activity */}
          <Card className="lg:col-span-2 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-50">Aktivitas Terakhir</h3>
              <Button variant="ghost" size="xs">Lihat Semua</Button>
            </div>
            <div className="space-y-4">
              {statsData?.recent_activity?.length > 0 ? (
                statsData.recent_activity.map((act) => (
                  <div key={act.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors">
                    <div className="p-2 bg-gray-100 dark:bg-dark-600 rounded-lg">
                      <ClockIcon className="h-5 w-5 text-gray-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-dark-50">
                        {act.action} <span className="text-blue-600 font-semibold">{act.entity}</span>
                      </p>
                      <p className="text-xs text-gray-400">{act.timestamp}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-gray-500 italic">Belum ada aktivitas baru</div>
              )}
            </div>
          </Card>

          {/* Quick Actions / Teacher Profile */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-50 mb-4">Profil Pengajar</h3>
            <div className="flex flex-col items-center text-center p-4">
              <Avatar name={user?.name} size="xl" className="mb-4 bg-primary text-white" />
              <h4 className="font-bold text-lg">{user?.name}</h4>
              <p className="text-sm text-gray-500 mb-6">{user?.role?.rolenm || 'Guru'}</p>
              
            </div>
          </Card>
        </div>

      </div>
    </Page>
  );
}

import { useEffect, useState } from "react";
import { Button, Spinner, Card, Badge } from "components/ui";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "app/contexts/auth/context";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import dayjs from "../../../utils/dayjs";
import { 
    AcademicCapIcon, 
    ArrowRightOnRectangleIcon, 
    ClockIcon, 
    CalendarDaysIcon,
    ClipboardDocumentCheckIcon,
    PlayIcon,
    DocumentMagnifyingGlassIcon,
    InformationCircleIcon
} from "@heroicons/react/24/outline";

import { API_URL } from '../../../utils/config';

export default function StudentDashboardPage() {
    const [parent] = useAutoAnimate();
    const [loading, setLoading] = useState(true);
    const [exams, setExams] = useState([]);
    const navigate = useNavigate();
    const { logout, user } = useAuthContext();

    const token = localStorage.getItem("authToken");

    const fetchDashboard = async () => {
        try {
            const res = await fetch(`${API_URL}/student/dashboard`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const json = await res.json();
            setExams(json.exams ?? []);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-white dark:bg-dark-900">
                <div className="flex flex-col items-center gap-4">
                    <Spinner size={40} className="text-primary" />
                    <p className="text-sm font-medium text-slate-500 dark:text-dark-300">Memuat dashboard...</p>
                </div>
            </div>
        );
    }

    const active = exams.filter(e => e.status === "active");
    const ready = exams.filter(e => e.status === "ready" || e.status === "scheduled");
    const finished = exams.filter(e => e.status === "finished");

    const pendingCount = active.length + ready.length;
    const finishedCount = finished.length;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-dark-900 pb-20 transition-colors duration-300">
            {/* HEADER SECTION */}
            <div className="bg-white dark:bg-dark-800 border-b border-slate-200 dark:border-dark-700 shadow-sm">
                <div className="max-w-6xl mx-auto px-6 py-10 md:py-16">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div className="flex items-center gap-5">
                            <div className="h-14 w-14 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-sm">
                                <AcademicCapIcon className="h-8 w-8" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-dark-50">
                                    Halo, {user?.name || "Siswa"}!
                                </h1>
                                <p className="text-sm text-slate-500 dark:text-dark-300 mt-1 font-medium">
                                    Selamat datang kembali di pusat ujian Anda.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-8">
                            <div className="flex gap-8 pr-8 border-r border-slate-200 dark:border-dark-700">
                                <div className="text-center">
                                    <p className="text-[10px] font-bold text-slate-400 dark:text-dark-400 uppercase tracking-widest mb-1">Selesai</p>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-dark-50">{finishedCount}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-[10px] font-bold text-slate-400 dark:text-dark-400 uppercase tracking-widest mb-1">Menunggu</p>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-dark-50">{pendingCount}</p>
                                </div>
                            </div>
                            <Button 
                                variant="outlined" 
                                color="error" 
                                className="rounded-xl px-5 py-2.5 font-bold text-xs uppercase tracking-widest flex items-center gap-2 border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-900/20"
                                onClick={logout}
                            >
                                <ArrowRightOnRectangleIcon className="h-4 w-4" />
                                Keluar
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* CONTENT SECTION */}
            <div className="max-w-6xl mx-auto px-6 py-12 space-y-12" ref={parent}>
                
                {/* ACTIVE EXAMS */}
                {active.length > 0 && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
                            <h2 className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em]">Ujian Sedang Berlangsung</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {active.map(exam => (
                                <ExamCard 
                                    key={exam.id} 
                                    exam={exam} 
                                    status="active" 
                                    onClick={() => navigate(`/student/exam/${exam.id}`)}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* UPCOMING EXAMS */}
                {ready.length > 0 && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="h-2 w-2 rounded-full bg-slate-400 dark:bg-dark-400"></div>
                            <h2 className="text-xs font-bold text-slate-500 dark:text-dark-300 uppercase tracking-[0.2em]">Jadwal Ujian</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {ready.map(exam => (
                                <ExamCard 
                                    key={exam.id} 
                                    exam={exam} 
                                    status="ready" 
                                    onClick={() => navigate(`/student/exam/${exam.id}`)}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* FINISHED EXAMS */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-slate-300 dark:bg-dark-500"></div>
                        <h2 className="text-xs font-bold text-slate-400 dark:text-dark-400 uppercase tracking-[0.2em]">Riwayat Ujian</h2>
                    </div>
                    {finished.length === 0 ? (
                        <div className="p-16 border-2 border-dashed border-slate-200 dark:border-dark-700 bg-white dark:bg-dark-800 flex flex-col items-center gap-4 rounded-3xl">
                            <div className="p-4 rounded-full bg-slate-50 dark:bg-dark-900 text-slate-300 dark:text-dark-600">
                                <ClipboardDocumentCheckIcon className="h-10 w-10" />
                            </div>
                            <p className="text-sm font-medium text-slate-400 dark:text-dark-400">Belum ada riwayat ujian pengerjaan.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {finished.map(exam => (
                                <ExamCard 
                                    key={exam.id} 
                                    exam={exam} 
                                    status="finished" 
                                    onClick={() => navigate(`/student/exam/${exam.id}/result`)}
                                />
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}

function ExamCard({ exam, status, onClick }) {
    const isFinished = status === "finished";
    const isActive = status === "active";
    
    return (
        <Card 
            onClick={onClick}
            skin="shadow"
            className={`p-6 transition-all duration-300 rounded-3xl cursor-pointer flex flex-col justify-between min-h-[200px] border border-transparent hover:scale-[1.02] active:scale-95
                ${isActive ? 'bg-indigo-600 dark:bg-indigo-600 shadow-lg shadow-indigo-500/20' : 'bg-white dark:bg-dark-800 border-slate-100 dark:border-dark-700 hover:border-indigo-200 dark:hover:border-indigo-500/50'}
            `}
        >
            <div className="space-y-4">
                <div className="flex items-start justify-between">
                    <Badge 
                        variant="flat" 
                        color={isActive ? 'flat' : isFinished ? 'success' : 'flat'}
                        className={`font-bold text-[9px] uppercase tracking-widest px-3 py-1 rounded-lg
                            ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-dark-700 text-slate-500 dark:text-dark-300'}
                        `}
                    >
                        {status === 'active' ? 'Sedang Berjalan' : status === 'finished' ? 'Selesai' : 'Mendatang'}
                    </Badge>
                </div>

                <div className="space-y-1">
                    <h3 className={`text-lg font-bold leading-tight ${isActive ? 'text-white' : 'text-slate-900 dark:text-dark-50'}`}>
                        {exam.title}
                    </h3>
                    <p className={`text-xs line-clamp-2 ${isActive ? 'text-indigo-100' : 'text-slate-500 dark:text-dark-300'}`}>
                        {exam.description || "Ujian evaluasi capaian belajar siswa."}
                    </p>
                </div>
            </div>

            <div className="pt-6 space-y-4">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                        <CalendarDaysIcon className={`h-4 w-4 ${isActive ? 'text-indigo-200' : 'text-slate-400 dark:text-dark-400'}`} />
                        <span className={`text-xs font-bold ${isActive ? 'text-white' : 'text-slate-600 dark:text-dark-100'}`}>
                            {dayjs.utc(exam.start_time).tz("Asia/Jakarta").format("DD MMM")}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <ClockIcon className={`h-4 w-4 ${isActive ? 'text-indigo-200' : 'text-slate-400 dark:text-dark-400'}`} />
                        <span className={`text-xs font-bold ${isActive ? 'text-white' : 'text-slate-600 dark:text-dark-100'}`}>
                            {exam.duration} Menit
                        </span>
                    </div>
                </div>

                <div className={`flex items-center justify-between py-2.5 px-4 rounded-xl transition-all font-bold text-xs uppercase tracking-widest
                    ${isActive ? 'bg-white text-indigo-600 shadow-sm' : 'bg-slate-50 dark:bg-dark-900 text-slate-400 dark:text-dark-400 group-hover:bg-indigo-600 dark:group-hover:bg-indigo-500 group-hover:text-white'}
                `}>
                    <span>
                        {isActive ? 'Mulai Sekarang' : isFinished ? 'Hasil Ujian' : 'Lihat Detail'}
                    </span>
                    {isActive ? <PlayIcon className="h-4 w-4 animate-pulse" /> : isFinished ? <DocumentMagnifyingGlassIcon className="h-4 w-4" /> : <InformationCircleIcon className="h-4 w-4" />}
                </div>
            </div>
        </Card>
    );
}

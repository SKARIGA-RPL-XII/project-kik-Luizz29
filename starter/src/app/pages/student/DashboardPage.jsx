import { useEffect, useState } from "react"
import { Button, Spinner } from "components/ui"
import { useNavigate } from "react-router-dom"
import dayjs from "../../../utils/dayjs"

import { API_URL } from '../../../utils/config';

export default function StudentDashboardPage() {
    const [loading, setLoading] = useState(true)
    const [exams, setExams] = useState([])
    const navigate = useNavigate()

    const token = localStorage.getItem("authToken")

    const fetchDashboard = async () => {
        try {
            const res = await fetch(`${API_URL}/student/dashboard`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            const json = await res.json()
            setExams(json.exams ?? [])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchDashboard()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <Spinner size={32} className="text-slate-400" />
            </div>
        )
    }

    const active = exams.filter(e => e.status === "active")
    const ready = exams.filter(e => e.status === "ready")
    const finished = exams.filter(e => e.status === "finished")

    const pendingCount = active.length + ready.length
    const finishedCount = finished.length

    return (
        <div className="bg-[#fcfcfc] min-h-screen pb-20 font-sans text-slate-900 border-t border-slate-200">
            {/* HEADER */}
            <div className="bg-white border-b border-slate-200 px-6 py-10 md:py-14">
                <div className="max-w-5xl mx-auto w-full flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div className="flex flex-col gap-2.5">
                        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                            Dashboard Ujian
                        </h1>
                        <p className="text-slate-500 text-sm max-w-md leading-relaxed">
                            Pantau jadwal serta laporan hasil evaluasi Anda secara aktual.
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-8">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Selesai</span>
                            <span className="text-3xl font-light text-slate-900 tracking-tighter">{finishedCount}</span>
                        </div>
                        <div className="w-px h-10 bg-slate-200"></div>
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Menunggu</span>
                            <span className="text-3xl font-light text-slate-900 tracking-tighter">{pendingCount}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="max-w-5xl mx-auto w-full px-6 pt-12 flex flex-col gap-16 relative z-20">

                {/* ACTIVE EXAMS */}
                {active.length > 0 && (
                    <Section title="Sedang Berlangsung">
                        <div className="flex flex-col gap-3">
                            {active.map(exam => (
                                <ExamRow
                                    key={exam.id}
                                    exam={exam}
                                    status="active"
                                    actionLabel="Masuk Ujian"
                                    actionFn={() => navigate(`/student/exam/${exam.id}`)}
                                />
                            ))}
                        </div>
                    </Section>
                )}

                {/* UPCOMING EXAMS */}
                {ready.length > 0 && (
                    <Section title="Akan Datang">
                        <div className="flex flex-col gap-3">
                            {ready.map(exam => (
                                <ExamRow
                                    key={exam.id}
                                    exam={exam}
                                    status="ready"
                                    actionLabel="Persiapan"
                                    actionFn={() => navigate(`/student/exam/${exam.id}`)}
                                />
                            ))}
                        </div>
                    </Section>
                )}

                {/* FINISHED EXAMS */}
                <Section title="Riwayat Penyelesaian">
                    {finished.length === 0 ? (
                        <div className="flex items-center justify-center py-16 px-4 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                            <p className="text-slate-400 text-sm">Arsip ujian kosong.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {finished.map(exam => (
                                <ExamRow
                                    key={exam.id}
                                    exam={exam}
                                    status="finished"
                                    actionLabel="Lihat Hasil"
                                    actionFn={() => navigate(`/student/exam/${exam.id}/result`)}
                                />
                            ))}
                        </div>
                    )}
                </Section>

            </div>
        </div>
    )
}

function Section({ title, children }) {
    return (
        <div className="flex flex-col gap-4">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest border-b border-slate-200 pb-3">
                {title}
            </h2>
            {children}
        </div>
    )
}

function ExamRow({ exam, status, actionLabel, actionFn }) {
    
    // Status visual mapping
    let icon, statusTag;
    
    switch (status) {
        case "active":
            icon = (
                <div className="h-10 w-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="10 8 16 12 10 16 10 8"></polygon></svg>
                </div>
            )
            statusTag = <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold tracking-widest text-blue-700 bg-blue-50 border border-blue-200 uppercase"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>Terbuka</span>
            break;
        case "ready":
            icon = (
                <div className="h-10 w-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center shrink-0 border border-slate-200">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                </div>
            )
            statusTag = <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold tracking-widest text-slate-600 bg-slate-100 border border-slate-200 uppercase">Menunggu</span>
            break;
        case "finished":
        default:
            icon = (
                <div className="h-10 w-10 rounded-full bg-white text-slate-400 flex items-center justify-center shrink-0 border border-slate-200 shadow-sm">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                </div>
            )
            statusTag = <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold tracking-widest text-slate-500 bg-slate-50 border border-slate-200 uppercase">Selesai</span>
            break;
    }

    return (
        <div 
            onClick={() => {
                actionFn && actionFn()
            }}
            className="group flex flex-col md:flex-row md:items-center justify-between bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-300 hover:shadow-sm transition-all duration-200 cursor-pointer"
        >
            <div className="flex items-center gap-4">
                {icon}
                <div className="flex flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-3">
                        <h3 className="font-medium text-slate-900 text-[15px] group-hover:text-blue-600 transition-colors">
                            {exam.title}
                        </h3>
                        {statusTag}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-[13px] text-slate-500 mt-0.5">
                        <span className="flex items-center gap-1.5 opacity-80">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                            {dayjs.utc(exam.start_time).tz("Asia/Jakarta").format("DD MMM YYYY, HH:mm")}
                        </span>
                    </div>
                </div>
            </div>

            <div className="mt-4 md:mt-0 flex items-center md:pl-6">
                <Button
                    size="sm"
                    variant="outlined"
                    className={`rounded-lg px-4 shadow-sm text-xs font-semibold py-1.5 transition-all 
                        ${status === 'active' ? 'bg-blue-600 text-white hover:bg-blue-700 border-transparent' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:text-slate-900'}`}
                    onClick={(e) => {
                        e.stopPropagation();
                        actionFn && actionFn()
                    }}
                >
                    {actionLabel}
                </Button>
            </div>
        </div>
    )
}

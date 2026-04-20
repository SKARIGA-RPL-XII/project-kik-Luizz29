import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Spinner, Button as TailuxButton, Card, Badge } from "components/ui"
import { 
    CheckCircleIcon, 
    XCircleIcon, 
    ChevronLeftIcon,
    AcademicCapIcon,
    ChartBarIcon,
    CheckIcon,
    XMarkIcon
} from "@heroicons/react/24/outline";

import { API_URL } from '../../../utils/config';

export default function ExamResultPage() {
    const { examID } = useParams()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [result, setResult] = useState(null)
    const [error, setError] = useState(null)
    const token = localStorage.getItem("authToken")

    useEffect(() => {
        fetch(`${API_URL}/student/exam/${examID}/result`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(async (r) => {
            const data = await r.json()
            if (!r.ok) throw new Error(data.message || "Gagal memuat hasil ujian")
            setResult(data)
        })
        .catch(err => setError(err.message))
        .finally(() => setLoading(false))
    }, [examID, token])

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-dark-900 gap-4">
                <Spinner size={48} className="text-primary" />
                <p className="text-slate-500 dark:text-dark-300 font-medium">Menganalisis hasil pengerjaan Anda...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark-900 p-6">
                <Card className="max-w-md w-full p-8 text-center space-y-4 border-none shadow-xl dark:bg-dark-800">
                    <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center">
                        <XCircleIcon className="h-10 w-10" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-dark-50">Oops! Terjadi Kesalahan</h2>
                    <p className="text-slate-500 dark:text-dark-400">{error}</p>
                    <TailuxButton 
                        color="primary" 
                        fullWidth 
                        onClick={() => navigate("/student/dashboard")}
                        className="rounded-xl py-3"
                    >
                        Kembali ke Dashboard
                    </TailuxButton>
                </Card>
            </div>
        )
    }

    if (!result) return null

    const isPassed = result.score >= 70;
    const correctCount = result.questions.filter(q => {
        const selected = q.options?.find(o => o.is_user_selected);
        return selected && selected.is_correct;
    }).length;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-dark-900 transition-colors duration-300 pb-20">
            {/* HERO SCORE SECTION */}
            <div className="bg-white dark:bg-dark-800 border-b border-slate-200 dark:border-dark-700 shadow-sm overflow-hidden relative">
                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -ml-32 -mb-32"></div>

                <div className="max-w-5xl mx-auto px-6 py-12 md:py-20 flex flex-col items-center text-center relative z-10">
                    <div className={`mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-[0.2em] shadow-sm
                        ${isPassed ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}
                    `}>
                        <ChartBarIcon className="h-4 w-4" />
                        Evaluasi Kompetensi Selesai
                    </div>

                    <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-dark-50 tracking-tight">
                        Ringkasan Hasil Ujian
                    </h1>
                    
                    <div className="mt-10 relative">
                        <div className={`text-8xl md:text-[10rem] font-black leading-none tracking-tighter
                            ${isPassed ? 'text-primary' : 'text-amber-500'}
                        `}>
                            {Math.round(result.score)}
                        </div>
                        <div className="text-xs font-bold text-slate-400 dark:text-dark-500 uppercase tracking-widest mt-2">
                            Skor Akhir Dari 100
                        </div>
                    </div>

                    <div className="mt-10 flex flex-wrap justify-center gap-4">
                        <div className="px-6 py-3 rounded-2xl bg-slate-50 dark:bg-dark-900/50 border border-slate-100 dark:border-dark-700 flex items-center gap-3">
                            <CheckCircleIcon className="h-5 w-5 text-emerald-500" />
                            <div className="text-left">
                                <p className="text-[10px] font-bold text-slate-400 uppercase leading-none">Benar</p>
                                <p className="text-lg font-bold text-slate-900 dark:text-dark-100">{correctCount}</p>
                            </div>
                        </div>
                        <div className="px-6 py-3 rounded-2xl bg-slate-50 dark:bg-dark-900/50 border border-slate-100 dark:border-dark-700 flex items-center gap-3">
                            <XCircleIcon className="h-5 w-5 text-red-500" />
                            <div className="text-left">
                                <p className="text-[10px] font-bold text-slate-400 uppercase leading-none">Salah / Kosong</p>
                                <p className="text-lg font-bold text-slate-900 dark:text-dark-100">{result.questions.length - correctCount}</p>
                            </div>
                        </div>
                    </div>

                    <TailuxButton 
                        variant="outlined" 
                        onClick={() => navigate("/student/dashboard")}
                        className="mt-12 rounded-2xl px-8 py-3.5 flex items-center gap-2 font-bold uppercase tracking-widest text-[11px] border-slate-200 dark:border-dark-700 hover:bg-slate-50 dark:hover:bg-dark-750"
                    >
                        <ChevronLeftIcon className="h-4 w-4" />
                        Kembali ke Dashboard
                    </TailuxButton>
                </div>
            </div>

            {/* DETAILED ANALYSIS */}
            <div className="max-w-5xl mx-auto px-6 py-12 space-y-10">
                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                        <AcademicCapIcon className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-dark-50">Analisis Soal</h2>
                        <p className="text-sm text-slate-500 dark:text-dark-400">Tinjau kembali jawaban Anda dan kunci jawaban.</p>
                    </div>
                </div>

                <div className="space-y-8">
                    {result.questions.map((q, idx) => {
                        const selectedOpt = q.options?.find(o => o.is_user_selected);
                        const isCorrectAnswer = selectedOpt && selectedOpt.is_correct;

                        return (
                            <Card key={q.id} skin="shadow" className="p-0 rounded-[2.5rem] dark:bg-dark-800 border-none overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none">
                                {/* Question Header */}
                                <div className="p-8 pb-6 border-b border-slate-100 dark:border-dark-700 bg-white dark:bg-dark-800">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Badge 
                                            variant="soft" 
                                            color={isCorrectAnswer ? 'success' : 'error'}
                                            className="rounded-lg px-3 py-1 font-bold text-[10px] uppercase tracking-wider"
                                        >
                                            SOAL {idx + 1} • {isCorrectAnswer ? 'BENAR' : 'SALAH'}
                                        </Badge>
                                    </div>
                                    <p className="text-lg md:text-xl font-bold text-slate-900 dark:text-dark-50 leading-relaxed">
                                        {q.question_text}
                                    </p>
                                </div>

                                {/* Options List */}
                                <div className="p-8 space-y-4 bg-slate-50 dark:bg-dark-900/40">
                                    {q.options?.map((opt, i) => {
                                        const isSelected = opt.is_user_selected;
                                        const isCorrect = opt.is_correct;
                                        
                                        let borderColor = "border-slate-200 dark:border-dark-700";
                                        let bgColor = "bg-white dark:bg-dark-800";
                                        let textColor = "text-slate-700 dark:text-dark-200";
                                        let badgeContent = null;

                                        if (isSelected && isCorrect) {
                                            borderColor = "border-emerald-500 dark:border-emerald-500/50";
                                            bgColor = "bg-emerald-50 dark:bg-emerald-500/10";
                                            textColor = "text-emerald-700 dark:text-emerald-400 font-bold";
                                            badgeContent = <Badge variant="filled" color="success" className="text-[9px] px-2.5 py-1 rounded-md shadow-sm">ANDA BENAR</Badge>;
                                        } else if (isSelected && !isCorrect) {
                                            borderColor = "border-red-500 dark:border-red-500/50";
                                            bgColor = "bg-red-50 dark:bg-red-500/10";
                                            textColor = "text-red-700 dark:text-red-400 font-bold";
                                            badgeContent = <Badge variant="filled" color="error" className="text-[9px] px-2.5 py-1 rounded-md shadow-sm text-white">ANDA SALAH</Badge>;
                                        } else if (isCorrect && !isSelected) {
                                            borderColor = "border-emerald-500/40 dark:border-emerald-500/40 border-dashed";
                                            bgColor = "bg-white dark:bg-dark-800";
                                            textColor = "text-emerald-600 dark:text-emerald-500 font-bold";
                                            badgeContent = <Badge variant="soft" color="success" className="text-[9px] px-2.5 py-1 rounded-md">KUNCI JAWABAN</Badge>;
                                        }

                                        return (
                                            <div 
                                                key={opt.id} 
                                                className={`flex items-center gap-5 px-6 py-5 rounded-2xl border-2 transition-all duration-300 ${borderColor} ${bgColor}`}
                                            >
                                                <div className={`
                                                    w-8 h-8 flex items-center justify-center rounded-xl border-2 text-[11px] font-black shrink-0
                                                    ${isSelected ? 'bg-slate-900 border-slate-900 text-white dark:bg-white dark:border-white dark:text-dark-900' : 'border-slate-200 dark:border-dark-600 text-slate-400 dark:text-dark-400'}
                                                `}>
                                                    {String.fromCharCode(65 + i)}
                                                </div>
                                                <span className={`text-[15px] md:text-base flex-1 leading-relaxed ${textColor}`}>
                                                    {opt.option_text}
                                                </span>
                                                <div className="flex items-center gap-3">
                                                    {badgeContent}
                                                    {isSelected && (isCorrect ? <CheckIcon className="h-5 w-5 text-emerald-500" /> : <XMarkIcon className="h-5 w-5 text-red-500" />)}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </Card>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

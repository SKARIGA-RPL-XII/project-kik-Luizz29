import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Spinner, Button } from "components/ui"

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

    if (loading) return <div className="flex justify-center py-20"><Spinner size={40} /></div>
    if (error) return <div className="text-center text-red-500 py-10 font-medium bg-red-50 p-4 rounded-lg max-w-lg mx-auto border border-red-200">{error}</div>
    if (!result) return null

    return (
        <div className="flex flex-col gap-8 max-w-4xl mx-auto w-full">
            {/* Header Box */}
            <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm flex flex-col items-center justify-center gap-3">
                <h1 className="text-3xl font-bold text-gray-900">Evaluasi Hasil Ujian</h1>
                <p className="text-gray-500">Total nilai evaluasi kompetensi akhir Anda:</p>
                <div className={`text-6xl font-extrabold mt-2 ${result.score >= 70 ? 'text-green-500' : 'text-red-500'}`}>
                    {Math.round(result.score)}
                </div>
                <Button variant="outlined" className="mt-5 rounded-lg" onClick={() => navigate("/student/dashboard")}>Kembali ke Dashboard</Button>
            </div>

            {/* Questions List */}
            <div className="flex flex-col gap-6 pb-20">
                {result.questions.map((q, idx) => {
                    
                    // Cek apakah soal ini dijawab siswa dan is_correct nya true
                    const selectedOpt = q.options?.find(o => o.is_user_selected)
                    const isCorrectAnswer = selectedOpt && selectedOpt.is_correct

                    return (
                        <div key={q.id} className="bg-white border rounded-xl p-6 shadow-sm flex flex-col gap-5">
                            <div className="flex gap-4 items-start">
                                <span className={`shrink-0 flex items-center justify-center w-10 h-10 rounded-full font-bold text-lg ${isCorrectAnswer ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {idx + 1}
                                </span>
                                <p className="text-gray-900 font-medium text-lg leading-relaxed mt-1.5">
                                    {q.question_text}
                                </p>
                            </div>

                            <div className="flex flex-col gap-3 pl-14">
                                {(!q.options || q.options.length === 0) ? (
                                    <p className="text-gray-400 italic text-sm">Tidak ada opsi ditemukan untuk soal ini.</p>
                                ) : (
                                    q.options.map((opt, i) => {
                                        
                                        let btnStyle = "border-gray-200 bg-gray-50/50 text-gray-700"
                                        let badge = null
                                        let customStyle = {}

                                        if (opt.is_user_selected && opt.is_correct) {
                                            btnStyle = "text-white shadow-md font-semibold border-transparent"
                                            customStyle = { backgroundColor: '#15803d' } // dark green (hijau gelap)
                                            badge = <span className="ml-auto text-[11px] font-extrabold bg-white px-2.5 py-1 rounded-md shadow-sm tracking-wide" style={{ color: '#15803d' }}>JAWABAN BENAR</span>
                                        } else if (opt.is_user_selected && !opt.is_correct) {
                                            btnStyle = "text-white shadow-md font-semibold border-transparent"
                                            customStyle = { backgroundColor: '#ef4444' } // red
                                            badge = <span className="ml-auto text-[11px] font-extrabold bg-white px-2.5 py-1 rounded-md shadow-sm tracking-wide" style={{ color: '#ef4444' }}>JAWABAN SALAH</span>
                                        } else if (opt.is_correct && !opt.is_user_selected) {
                                            btnStyle = "border-green-500 bg-green-50 text-green-900 ring-2 ring-green-500/50 shadow-sm font-semibold"
                                            badge = <span className="ml-auto text-[11px] font-bold text-green-800 bg-green-200 px-2.5 py-1 rounded-md tracking-wide">KUNCI JAWABAN</span>
                                        }

                                        return (
                                            <div key={opt.id} className={`flex items-center px-5 py-4 rounded-xl border transition-all ${btnStyle}`} style={customStyle}>
                                                <span className={`font-semibold mr-4 ${opt.is_user_selected ? 'opacity-90' : 'opacity-50'}`}>{String.fromCharCode(65 + i)}.</span>
                                                <span className="text-[15px] font-medium leading-relaxed flex-1">{opt.option_text}</span>
                                                {badge}
                                            </div>
                                        )
                                    })
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ConfirmModal } from "components/shared/ConfirmModal";
import { useDisclosure } from "hooks";
import { Button as TailuxButton, Card, Badge, Spinner } from "components/ui";

import { useAuthContext } from "app/contexts/auth/context";

import { API_URL } from '../../../utils/config';
import { toast } from 'sonner';
import { 
    ClockIcon, 
    CheckIcon, 
    ChevronLeftIcon, 
    ChevronRightIcon,
    ClipboardDocumentListIcon,
    InformationCircleIcon
} from "@heroicons/react/24/outline";

export default function ExamPage() {
  const { logout } = useAuthContext();

  //Modal
  const [isOpen, { open, close }] = useDisclosure();
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(false);

  const modalState = submitError
    ? "error"
    : submitSuccess
      ? "success"
      : "pending";

  const { examID } = useParams();
  const navigate = useNavigate();

  const token = localStorage.getItem("authToken");

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [timeLeft, setTimeLeft] = useState(0);

  const joinedRef = useRef(false);

  const modalMessages = {
    pending: {
      title: "Kumpulkan Ujian?",
      description:
        "Pastikan semua jawaban sudah benar. Setelah dikumpulkan, ujian tidak bisa diubah.",
      actionText: "Submit Ujian",
    },
    success: {
      title: "Ujian Berhasil Dikumpulkan 🎉",
      description: "Jawaban Anda telah aman tersimpan di sistem.",
      actionText: "Selesai",
    },
    error: {
      title: "Gagal Mengumpulkan",
      description:
        "Terjadi kesalahan. Periksa koneksi internet lalu coba lagi.",
      actionText: "Coba Lagi",
    },
  };

  const joinExam = async (id, coords) => {
    try {
      const res = await fetch(
        `${API_URL}/student/exam/${id}/join`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            latitude: coords.latitude,
            longitude: coords.longitude
          })
        }
      );

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.message || "Tidak bisa join ujian");
        navigate("/student/dashboard");
        return false;
      }
      return true;
    } catch {
      toast.error("Koneksi gagal saat mencoba masuk ujian");
      navigate("/student/dashboard");
      return false;
    }
  };

  const fetchQuestions = async (id) => {
    const res = await fetch(
      `${API_URL}/student/exam/${id}/questions`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) {
      toast.error("Gagal mengambil soal");
      navigate("/student/dashboard");
      return;
    }

    const data = await res.json();
    setQuestions(data.questions || []);

    if (data.duration > 0) {
      const totalSeconds = data.duration * 60;
      if (data.start_time) {
        const startTime = new Date(data.start_time).getTime();
        const now = new Date().getTime();
        const elapsedSeconds = Math.floor((now - startTime) / 1000);
        const remaining = totalSeconds - elapsedSeconds;
        setTimeLeft(remaining > 0 ? remaining : 0);
      } else {
        setTimeLeft(totalSeconds);
      }
    } else {
      setTimeLeft(60 * 60); 
    }
  };

  const requestLocation = () => {
      return new Promise((resolve) => {
          if (!navigator.geolocation) {
              resolve({ latitude: 0, longitude: 0 });
              return;
          }
          navigator.geolocation.getCurrentPosition(
              (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
              () => resolve({ latitude: 0, longitude: 0 }),
              { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
          );
      });
  };

  useEffect(() => {
    if (!examID) return;
    if (joinedRef.current) return;

    joinedRef.current = true;

    const loadExam = async () => {
      const coords = await requestLocation();
      const ok = await joinExam(Number(examID), coords);
      if (!ok) return;

      await fetchQuestions(Number(examID));

      const saved = localStorage.getItem(`exam_${examID}_answers`);
      if (saved) {
        setAnswers(JSON.parse(saved));
      }
      setLoading(false);
    };

    loadExam();

    const heartbeatInterval = setInterval(async () => {
       const coords = await requestLocation();
       fetch(`${API_URL}/student/exam/${examID}/heartbeat`, {
           method: "POST",
           headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
           },
           body: JSON.stringify(coords)
       }).then(async res => {
           if (!res.ok) {
               const contentType = res.headers.get("content-type");
               if (contentType && contentType.includes("application/json")) {
                   const err = await res.json();
                   toast.error(err.message || "Pelanggaran keamanan terdeteksi!");
               } else {
                   toast.error("Akses ditolak oleh server.");
               }
               navigate("/student/dashboard");
           }
       }).catch(() => {
           toast.error("Koneksi terputus. Validasi keamanan gagal.");
           navigate("/student/dashboard");
       });
    }, 15000);

    return () => clearInterval(heartbeatInterval);
  }, [examID]);

  useEffect(() => {
    if (!examID || loading) return;

    const handleCheatLogout = () => {
      logout();
      window.location.href = "/login";
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        toast.error("Keluar dari tab ujian dilarang!");
        handleCheatLogout();
      }
    };

    const handleBlur = () => {
      toast.error("Layar kehilangan fokus! Anda dikeluarkan.");
      handleCheatLogout();
    };

    const handleContextMenu = (e) => e.preventDefault();

    const handleKeyDown = (e) => {
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "i" || e.key === "J" || e.key === "j" || e.key === "C" || e.key === "c")) ||
        (e.ctrlKey && (e.key === "U" || e.key === "u"))
      ) {
        e.preventDefault();
      }
    };

    const securityTimeout = setTimeout(() => {
      document.addEventListener("visibilitychange", handleVisibilityChange);
      window.addEventListener("blur", handleBlur);
      document.addEventListener("contextmenu", handleContextMenu);
      document.addEventListener("keydown", handleKeyDown);
    }, 3000);

    return () => {
      clearTimeout(securityTimeout);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [examID, logout, loading]);

  const handleAnswer = (questionID, optionID) => {
    const updated = {
      ...answers,
      [questionID]: optionID
    };
    setAnswers(updated);
    localStorage.setItem(`exam_${examID}_answers`, JSON.stringify(updated));
  };

  const submitExam = async () => {
    setConfirmLoading(true);
    try {
      const coords = await requestLocation();
      const res = await fetch(
        `${API_URL}/student/exam/${examID}/submit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            answers: answers,
            latitude: coords.latitude,
            longitude: coords.longitude
          })
        }
      );

      if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || "Gagal mengumpulkan");
      }

      localStorage.removeItem(`exam_${examID}_answers`);
      setSubmitSuccess(true);
      setSubmitError(false);
      setTimeout(() => {
        close();
        navigate("/student/dashboard");
      }, 2000);
    } catch (e) {
      toast.error(e.message);
      setSubmitError(true);
    } finally {
      setConfirmLoading(false);
    }
  };

  useEffect(() => {
    if (loading || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer);
          submitExam();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [loading, timeLeft === 0]); 

  const formatTime = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(
      s % 60
    ).padStart(2, "0")}`;

  const currentQuestionData = questions[currentQuestion - 1];
  const progress = Math.round((Object.keys(answers).length / (questions.length || 1)) * 100);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-dark-900 gap-4">
        <Spinner size={48} className="text-primary" />
        <p className="text-slate-500 dark:text-dark-300 font-medium animate-pulse">Menyiapkan lembar ujian...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-900 transition-colors duration-300 flex flex-col">
      {/* STICKY HEADER */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-dark-800/80 backdrop-blur-md border-b border-slate-200 dark:border-dark-700">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <ClipboardDocumentListIcon className="h-6 w-6" />
                </div>
                <div>
                    <h1 className="font-bold text-slate-900 dark:text-dark-50 leading-none">
                        Lembar Ujian
                    </h1>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 dark:text-dark-400 mt-1">
                        ID: {examID}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-6">
                <div className="hidden md:block w-48">
                    <div className="flex justify-between mb-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Progress</span>
                        <span className="text-[10px] font-bold text-primary uppercase">{progress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-dark-700 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-primary transition-all duration-500" 
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>

                <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/10 px-4 py-2 rounded-xl border border-red-100 dark:border-red-900/30">
                    <ClockIcon className="h-5 w-5 text-red-500 animate-pulse" />
                    <span className="font-mono text-red-600 dark:text-red-400 font-bold text-lg">
                        {formatTime(timeLeft)}
                    </span>
                </div>
            </div>
        </div>
      </header>

      <div className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* NAVIGATION SIDEBAR */}
        <aside className="lg:col-span-3 space-y-6">
            <Card skin="shadow" className="p-6 rounded-3xl dark:bg-dark-800 border-none">
                <h2 className="text-xs font-bold text-slate-400 dark:text-dark-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <CheckIcon className="h-4 w-4" />
                    Navigasi Soal
                </h2>
                <div className="grid grid-cols-5 gap-2.5">
                    {questions.map((q, i) => {
                        const isActive = currentQuestion === i + 1;
                        const isAnswered = answers[q.id];
                        return (
                            <button
                                key={i}
                                onClick={() => setCurrentQuestion(i + 1)}
                                className={`
                                    h-10 w-full rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center
                                    ${isActive 
                                        ? "bg-primary text-white shadow-lg shadow-primary/30 scale-110" 
                                        : isAnswered 
                                            ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/20" 
                                            : "bg-slate-100 dark:bg-dark-700 text-slate-500 dark:text-dark-300 hover:bg-slate-200 dark:hover:bg-dark-600"
                                    }
                                `}
                            >
                                {i + 1}
                            </button>
                        );
                    })}
                </div>
            </Card>

            <div className="bg-amber-50 dark:bg-amber-900/10 p-5 rounded-3xl border border-amber-100 dark:border-amber-900/20 flex gap-4">
                <InformationCircleIcon className="h-6 w-6 text-amber-600 shrink-0" />
                <p className="text-[11px] font-medium text-amber-700 dark:text-amber-500 leading-relaxed">
                    Dilarang membuka tab lain atau meninggalkan layar ujian. Pelanggaran akan menyebabkan Anda dikeluarkan secara otomatis.
                </p>
            </div>
        </aside>

        {/* QUESTION PANEL */}
        <main className="lg:col-span-9 flex flex-col gap-6">
            <Card skin="shadow" className="p-8 md:p-12 rounded-[2rem] dark:bg-dark-800 border-none flex-1">
                <div className="flex items-center gap-3 mb-8">
                    <Badge variant="soft" color="primary" className="rounded-lg px-3 py-1 font-bold">
                        SOAL NO. {currentQuestion}
                    </Badge>
                </div>

                <div className="mb-12">
                    <p className="text-xl md:text-2xl font-semibold text-slate-800 dark:text-dark-50 leading-relaxed">
                        {currentQuestionData?.question}
                    </p>
                </div>

                <div className="space-y-4">
                    {currentQuestionData?.options?.map((opt) => {
                        const selected = answers[currentQuestionData.id] === opt.id;
                        return (
                            <label
                                key={opt.id}
                                className={`
                                    group flex gap-5 items-center p-6 rounded-3xl border-2 cursor-pointer transition-all duration-300
                                    ${selected
                                        ? "border-primary bg-primary/5 dark:bg-primary/10"
                                        : "border-slate-100 dark:border-dark-700 hover:border-primary/30 hover:bg-slate-50 dark:hover:bg-dark-750"}
                                `}
                            >
                                <div className={`
                                    w-8 h-8 flex items-center justify-center rounded-xl border-2 transition-all duration-300
                                    ${selected
                                        ? "bg-primary border-primary text-white shadow-lg shadow-primary/30"
                                        : "border-slate-200 dark:border-dark-600 text-slate-400 dark:text-dark-400 group-hover:border-primary/50"}
                                `}>
                                    <span className="text-xs font-bold">{opt.label}</span>
                                </div>

                                <input
                                    type="radio"
                                    className="hidden"
                                    checked={selected}
                                    onChange={() => handleAnswer(currentQuestionData.id, opt.id)}
                                />

                                <span className={`text-base md:text-lg font-medium transition-colors ${selected ? 'text-primary' : 'text-slate-600 dark:text-dark-200'}`}>
                                    {opt.optiontext}
                                </span>

                                {selected && <CheckIcon className="h-6 w-6 text-primary ml-auto" />}
                            </label>
                        );
                    })}
                </div>
            </Card>

            {/* ACTION FOOTER */}
            <div className="flex justify-between items-center bg-white dark:bg-dark-800 p-6 rounded-[2rem] border border-slate-100 dark:border-dark-700 shadow-sm">
                <TailuxButton 
                    variant="outlined"
                    onClick={() => setCurrentQuestion((q) => Math.max(q - 1, 1))}
                    disabled={currentQuestion === 1}
                    className="rounded-2xl px-6 flex items-center gap-2 font-bold uppercase tracking-widest text-[10px]"
                >
                    <ChevronLeftIcon className="h-4 w-4" />
                    Sebelumnya
                </TailuxButton>

                {currentQuestion === questions.length ? (
                    <TailuxButton
                        color="error"
                        onClick={() => {
                            const answeredCount = Object.keys(answers).length;
                            if (answeredCount < questions.length) {
                                toast.error(`Ada ${questions.length - answeredCount} soal yang belum dijawab!`);
                                return;
                            }
                            setSubmitSuccess(false);
                            setSubmitError(false);
                            open();
                        }}
                        className="rounded-2xl px-8 flex items-center gap-2 font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-red-500/20"
                    >
                        Selesai & Kumpulkan
                        <CheckIcon className="h-4 w-4" />
                    </TailuxButton>
                ) : (
                    <TailuxButton
                        color="primary"
                        onClick={() => setCurrentQuestion((q) => Math.min(q + 1, questions.length))}
                        className="rounded-2xl px-8 flex items-center gap-2 font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20"
                    >
                        Lanjut Ke Soal {currentQuestion + 1}
                        <ChevronRightIcon className="h-4 w-4" />
                    </TailuxButton>
                )}
            </div>
        </main>
      </div>

      <ConfirmModal
        show={isOpen}
        onClose={close}
        messages={modalMessages}
        onOk={submitExam}
        confirmLoading={confirmLoading}
        state={modalState}
      />
    </div>
  );
}

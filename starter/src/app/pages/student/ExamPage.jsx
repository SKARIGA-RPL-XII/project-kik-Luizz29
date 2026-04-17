import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ConfirmModal } from "components/shared/ConfirmModal";
import { useDisclosure } from "hooks";

import { useAuthContext } from "app/contexts/auth/context";

import { API_URL } from '../../../utils/config';
import { toast } from 'sonner';

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



  //=============================
  const { examID } = useParams();
  const navigate = useNavigate();

  const token = localStorage.getItem("authToken");

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [timeLeft, setTimeLeft] = useState(60 * 60);

  const joinedRef = useRef(false);


  //MODALLL

  const modalMessages = {
    pending: {
      title: "Kumpulkan Ujian?",
      description:
        "Pastikan semua jawaban sudah benar. Setelah dikumpulkan, ujian tidak bisa diubah.",
      actionText: "Submit Ujian",
    },
    success: {
      title: "Ujian Berhasil Dikumpulkan 🎉",
    },
    error: {
      title: "Gagal Mengumpulkan",
      description:
        "Terjadi kesalahan. Periksa koneksi internet lalu coba lagi.",
    },
  };

  // =============================
  // JOIN EXAM
  // =============================
  const joinExam = async (id, coords) => {

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
  };

  // =============================
  // FETCH QUESTIONS
  // =============================
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
    setQuestions(data);
  };

  // =============================
  // REQUEST GEOLOCATION
  // =============================
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

  // =============================
  // LOAD EXAM ENGINE & HEARTBEAT
  // =============================
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

    // 15 seconds Heartbeat tracker
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
               // Periksa tipe konten untuk mencegah error JSON parse
               const contentType = res.headers.get("content-type");
               if (contentType && contentType.includes("application/json")) {
                   const err = await res.json();
                   toast.error(err.message || "Sistem mendeteksi akses jaringan tidak sah atau lokasi berada di luar jangkauan radar ujian! Ujian diblokir.");
               } else {
                   toast.error("Jaringan/IP berubah atau akses ditolak oleh server. Anda dikeluarkan dari ujian!");
               }
               navigate("/student/dashboard");
           }
       }).catch((err) => {
           console.error("Heartbeat error:", err);
           toast.error("Koneksi tidak stabil, berganti jaringan, atau server tidak dapat dijangkau. Keamanan ujian gagal divalidasi. Anda dikeluarkan!");
           navigate("/student/dashboard");
       });
    }, 15000);

    return () => clearInterval(heartbeatInterval);

  }, [examID]);

  // =============================
  // KONTROL KEAMANAN KETAT
  // =============================
  useEffect(() => {
    if (!examID) return;

    // Fungsi untuk mengeluarkan siswa secara paksa
    const handleCheatLogout = () => {
      logout();
      window.location.href = "/login";
    };

    // 1. Deteksi ganti tab (Visibility Change)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        toast.error("Melanggar aturan! Anda membuka tab/aplikasi lain. Anda dikeluarkan dari ujian.");
        handleCheatLogout();
      }
    };

    // 2. Deteksi keluar dari browser/buka desktop lain (Window Blur)
    const handleBlur = () => {
      toast.error("Melanggar aturan! Ujian kehilangan fokus layar. Anda dikeluarkan dari ujian.");
      handleCheatLogout();
    };

    // 3. Mencegah klik kanan
    const handleContextMenu = (e) => {
      e.preventDefault();
      toast.warning("Klik kanan dinonaktifkan selama ujian.");
    };

    // 4. Mencegah shortcut keyboard tertentu (F12, inspect element)
    const handleKeyDown = (e) => {
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "i" || e.key === "J" || e.key === "j" || e.key === "C" || e.key === "c")) ||
        (e.ctrlKey && (e.key === "U" || e.key === "u"))
      ) {
        e.preventDefault();
        toast.warning("Shortcut keyboard dilarang selama ujian.");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [examID, logout]);

  // =============================
  // SAVE ANSWER (LOCAL ONLY)
  // =============================
  const handleAnswer = (questionID, optionID) => {

    const updated = {
      ...answers,
      [questionID]: optionID
    };

    setAnswers(updated);

    // simpan ke localStorage
    localStorage.setItem(
      `exam_${examID}_answers`,
      JSON.stringify(updated)
    );
  };

  // =============================
  // SUBMIT EXAM
  // =============================
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
      }, 1500);

    } catch (e) {
      toast.error(e.message);
      setSubmitError(true);
    } finally {
      setConfirmLoading(false);
    }
  };


  // =============================
  // TIMER
  // =============================
  useEffect(() => {

    const timer = setInterval(() => {

      setTimeLeft((t) => {

        if (t <= 1) {
          clearInterval(timer);
          submitExam(); // auto submit
          return 0;
        }

        return t - 1;
      });

    }, 1000);

    return () => clearInterval(timer);

  }, []);

  const formatTime = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(
      s % 60
    ).padStart(2, "0")}`;

  const question = questions[currentQuestion - 1];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-700">
        Loading exam...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-gray-800">

      {/* HEADER */}
      <header className="bg-white shadow-sm border-b px-6 py-4 flex justify-between items-center">

        <h1 className="font-semibold text-lg">
          Ujian ID : {examID}
        </h1>

        <div className="font-mono text-red-500 text-lg font-semibold">
          ⏱ {formatTime(timeLeft)}
        </div>

      </header>

      <div className="flex max-w-7xl mx-auto py-8 gap-6">

        {/* SIDEBAR NAV */}
        <aside className="w-72 bg-white rounded-xl shadow-sm border p-5 h-fit">

          <h2 className="font-semibold mb-4">
            Soal
          </h2>

          <div className="grid grid-cols-5 gap-2">

            {questions.map((q, i) => {

              const isActive = currentQuestion === i + 1;
              const isAnswered = answers[q.id];

              return (
                <button
                  key={i}
                  onClick={() => setCurrentQuestion(i + 1)}
                  className={`
                  h-10 rounded-lg text-sm font-medium transition
                  ${isActive && "bg-blue-600 text-white"}
                  ${!isActive && isAnswered && "bg-green-500 text-white"}
                  ${!isActive && !isAnswered && "bg-gray-100 hover:bg-gray-200"}
                `}
                >
                  {i + 1}
                </button>
              );
            })}

          </div>

        </aside>

        {/* QUESTION CONTENT */}
        <main className="flex-1 bg-white rounded-xl shadow-sm border p-8">

          <h2 className="font-semibold text-lg mb-4">
            Soal No. {currentQuestion}
          </h2>

          <p className="text-gray-700 leading-relaxed mb-8">
            {question?.question}
          </p>

          {/* OPTIONS */}
          <div className="flex flex-col gap-4">

            {question?.options?.map((opt) => {

              const selected = answers[question.id] === opt.id;

              return (
                <label
                  key={opt.id}
                  className={`
                  flex gap-4 items-start p-4 rounded-xl border cursor-pointer transition
                  ${selected
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/50"}
                `}
                >

                  {/* CUSTOM ICON */}
                  <div className={`
                    w-6 h-6 flex items-center justify-center rounded-full border mt-1
                    ${selected
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "border-gray-300"}
                  `}>

                    {selected && "✓"}

                  </div>

                  <input
                    type="radio"
                    className="hidden"
                    checked={selected}
                    onChange={() =>
                      handleAnswer(question.id, opt.id)
                    }
                  />

                  <span className="text-gray-800">
                    <b>{opt.label}.</b> {opt.optiontext}
                  </span>

                </label>
              );
            })}

          </div>

          {/* NAV BUTTON */}
          <div className="flex justify-between mt-10">

            <button
              className="px-5 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition"
              onClick={() =>
                setCurrentQuestion((q) => Math.max(q - 1, 1))
              }
            >
              ← Sebelumnya
            </button>

            {currentQuestion === questions.length ? (
              <button
                className="px-6 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
                onClick={() => {
                  setSubmitSuccess(false);
                  setSubmitError(false);
                  open();
                }}

              >
                Submit Ujian
              </button>
            ) : (
              <button
                className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
                onClick={() =>
                  setCurrentQuestion((q) =>
                    Math.min(q + 1, questions.length)
                  )
                }
              >
                Lanjut →
              </button>
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

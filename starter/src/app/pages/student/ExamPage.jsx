import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ConfirmModal } from "components/shared/ConfirmModal";
import { useDisclosure } from "hooks";


const API_URL = "http://localhost:8081";

export default function ExamPage() {

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
  const joinExam = async (id) => {

    const res = await fetch(
      `${API_URL}/student/exam/${id}/join`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) {
      const err = await res.json();
      alert(err.message || "Tidak bisa join ujian");
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
      alert("Gagal mengambil soal");
      navigate("/student/dashboard");
      return;
    }

    const data = await res.json();
    setQuestions(data);
  };

  // =============================
  // LOAD EXAM ENGINE
  // =============================
  useEffect(() => {

    if (!examID) return;
    if (joinedRef.current) return;

    joinedRef.current = true;

    const loadExam = async () => {

      const ok = await joinExam(Number(examID));
      if (!ok) return;

      await fetchQuestions(Number(examID));

      // restore jawaban dari localStorage
      const saved = localStorage.getItem(`exam_${examID}_answers`);
      if (saved) {
        setAnswers(JSON.parse(saved));
      }

      setLoading(false);
    };

    loadExam();

  }, [examID]);

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

      const res = await fetch(
        `${API_URL}/student/exam/${examID}/submit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            answers: answers
          })
        }
      );

      if (!res.ok) throw new Error();

      localStorage.removeItem(`exam_${examID}_answers`);

      setSubmitSuccess(true);
      setSubmitError(false);

      setTimeout(() => {
        close();
        navigate("/student/dashboard");
      }, 1500);

    } catch {
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

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const API_URL = "http://localhost:8081";

export default function ExamPage() {

  const { examID } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(60 * 60);
  const [currentQuestion, setCurrentQuestion] = useState(1);

  const token = localStorage.getItem("authToken");

  // ================= JOIN EXAM =================
  const joinExam = async (id) => {

    if (!id || isNaN(id)) return;

    try {

      const res = await fetch(`${API_URL}/student/exam/${id}/join`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.message || "Tidak bisa join ujian");
        navigate("/student/dashboard");
        return;
      }

    } catch (err) {
      console.error(err);
      navigate("/student/dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (examID) joinExam(examID);
  }, [examID]);

  // ================= TIMER =================
  useEffect(() => {

    const timer = setInterval(() => {

      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer);
          alert("Waktu habis, ujian dikirim!");
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading exam...</p>
      </div>
    );
  }

  // ================= UI =================
  return (
    <div className="min-h-screen bg-gray-50">

      {/* HEADER */}
      <header className="bg-white shadow-sm px-8 py-4 flex justify-between items-center">

        <h1 className="text-lg font-semibold text-gray-700">
          Ujian #{examID}
        </h1>

        <div className="text-red-500 font-semibold text-lg">
          ⏱ {formatTime(timeLeft)}
        </div>

      </header>

      <div className="flex max-w-7xl mx-auto mt-6 gap-6 px-6">

        {/* SIDEBAR SOAL */}
        <aside className="w-72">

          <div className="bg-white rounded-xl shadow-sm p-5">

            <h2 className="font-semibold text-gray-700 mb-4">
              Nomor Soal
            </h2>

            <div className="grid grid-cols-5 gap-2">

              {[...Array(40)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentQuestion(i + 1)}
                  className={`h-9 rounded-md text-sm font-medium transition
                  ${
                    currentQuestion === i + 1
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {i + 1}
                </button>
              ))}

            </div>

          </div>

        </aside>

        {/* CONTENT SOAL */}
        <main className="flex-1">

          <div className="bg-white rounded-xl shadow-sm p-8">

            <h2 className="text-lg font-semibold text-gray-700 mb-6">
              Soal No. {currentQuestion}
            </h2>

            <p className="text-gray-600 leading-relaxed mb-8">
              Manakah pernyataan yang benar mengenai React Hooks?
            </p>

            <div className="space-y-3">

              {["A", "B", "C", "D"].map((opt) => (
                <label
                  key={opt}
                  className="flex items-center gap-3 border rounded-lg p-4 cursor-pointer hover:border-blue-400 transition"
                >
                  <input
                    type="radio"
                    name="answer"
                    className="accent-blue-500"
                  />
                  <span className="text-gray-700">
                    {opt}. Hooks hanya bisa digunakan di class component
                  </span>
                </label>
              ))}

            </div>

            {/* NAVIGATION */}
            <div className="flex justify-between mt-10">

              <button
                onClick={() =>
                  setCurrentQuestion((q) => Math.max(q - 1, 1))
                }
                className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
              >
                ← Sebelumnya
              </button>

              <button
                onClick={() =>
                  setCurrentQuestion((q) => Math.min(q + 1, 40))
                }
                className="px-6 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition"
              >
                Simpan & Lanjut →
              </button>

            </div>

          </div>

        </main>

      </div>

    </div>
  );
}

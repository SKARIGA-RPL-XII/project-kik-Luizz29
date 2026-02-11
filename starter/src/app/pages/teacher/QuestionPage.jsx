import { useParams } from "react-router";
import { useEffect, useState } from "react";
import { Button } from "components/ui";

const API_URL = "http://localhost:8081";

export default function QuestionPage() {
  const { headerid } = useParams();
  const token = localStorage.getItem("authToken");

  const [questions, setQuestions] = useState([]);

  const emptyQuestion = () => ({
    question: "",
    type: "MCQ",
    score: 1,
    options: [
      { label: "A", text: "", iscorrect: false },
      { label: "B", text: "", iscorrect: false },
      { label: "C", text: "", iscorrect: false },
      { label: "D", text: "", iscorrect: false },
    ],
  });

  const [form, setForm] = useState(emptyQuestion());

  // ================= FETCH QUESTIONS =================
  const fetchQuestions = async () => {
    const res = await fetch(`${API_URL}/master/question/${headerid}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const json = await res.json();
    setQuestions(json.data || []);
  };

  useEffect(() => {
    fetchQuestions();
  }, [headerid]);

  // ================= OPTION CHANGE =================
  const handleOptionChange = (index, field, value) => {
    const updated = [...form.options];
    updated[index][field] = value;

    // jika pilih jawaban benar
    if (field === "iscorrect" && value === true) {
      updated.forEach((opt, i) => {
        opt.iscorrect = i === index;
      });
    }

    setForm({ ...form, options: updated });
  };

  // ================= SUBMIT =================
  const handleSubmit = async () => {
    const res = await fetch(`${API_URL}/master/question/${headerid}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      alert("Gagal tambah soal");
      return;
    }

    setForm(emptyQuestion());
    fetchQuestions();
  };

  return (
    <div className="p-6 space-y-6">

      {/* ================= FORM BUILDER ================= */}
      <div className="border border-divider rounded-xl p-6 space-y-4">

        <h2 className="text-lg font-semibold">
          Add Question
        </h2>

        {/* QUESTION TEXT */}
        <textarea
          value={form.question}
          onChange={(e) =>
            setForm({ ...form, question: e.target.value })
          }
          placeholder="Tulis soal..."
          className="w-full border border-divider rounded-lg p-3 bg-card"
        />

        {/* TYPE */}
        <select
          value={form.type}
          onChange={(e) =>
            setForm({ ...form, type: e.target.value })
          }
          className="border border-divider rounded-lg p-2 bg-card"
        >
          <option value="MCQ">Pilihan Ganda</option>
          <option value="ESSAY">Essay</option>
        </select>

        {/* SCORE */}
        <input
          type="number"
          value={form.score}
          onChange={(e) =>
            setForm({ ...form, score: Number(e.target.value) })
          }
          className="border border-divider rounded-lg p-2 bg-card"
        />

        {/* OPTIONS */}
        {form.options.map((opt, i) => (
          <div key={i} className="flex gap-3 items-center">

            <span className="w-6">{opt.label}</span>

            <input
              value={opt.text}
              onChange={(e) =>
                handleOptionChange(i, "text", e.target.value)
              }
              className="flex-1 border border-divider rounded-lg p-2 bg-card"
            />

            <input
              type="radio"
              checked={opt.iscorrect}
              onChange={() =>
                handleOptionChange(i, "iscorrect", true)
              }
            />
          </div>
        ))}

        <Button color="primary" onClick={handleSubmit}>
          Save Question
        </Button>

      </div>

      {/* ================= LIST QUESTIONS ================= */}
      <div className="space-y-4">

        {questions.map((q) => (
          <div key={q.detailid} className="border p-4 rounded-lg">

            <h3 className="font-semibold">{q.question}</h3>
            <p>Score: {q.score}</p>

            <ul className="mt-2">
              {q.options?.map((opt) => (
                <li key={opt.optionid}>
                  {opt.label}. {opt.text} {opt.iscorrect && "✅"}
                </li>
              ))}
            </ul>

          </div>
        ))}

      </div>

    </div>
  );
}

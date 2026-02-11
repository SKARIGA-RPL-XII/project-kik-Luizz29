import { useState } from "react";
import DarkSelect from "components/ui/DarkSelect";
import { Button as TailuxButton } from "components/ui";
import { Snackbar, Alert } from "@mui/material";

const API_URL = "http://localhost:8081";

export default function QuestionTab({
  examId,
  banks,
  examBank,
  examQuestions,
  setExamBank,
  setExamQuestions,
}) {

  const token = localStorage.getItem("authToken");
  const [selectedBank, setSelectedBank] = useState(examBank || "");

  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // ================= APPLY BANK =================
  const handleApplyBank = async () => {

    if (!selectedBank) {
      setToast({
        open: true,
        message: "Pilih bank soal dulu",
        severity: "warning",
      });
      return;
    }

    const res = await fetch(
      `${API_URL}/master/exam/${examId}/set-bank`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          questionbankid: Number(selectedBank),
        }),
      }
    );

    if (!res.ok) {
      setToast({
        open: true,
        message: "Gagal menyimpan bank",
        severity: "error",
      });
      return;
    }

    // update parent state
    setExamBank(Number(selectedBank));

    // load snapshot
    const qRes = await fetch(
      `${API_URL}/master/exam/${examId}/questions`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const qJson = await qRes.json();
    setExamQuestions(qJson.data || []);

    setToast({
      open: true,
      message: "Bank berhasil disimpan",
      severity: "success",
    });
  };

  const bankName = banks.find(
    (b) => b.headerid === examBank
  )?.title;

  return (
    <div className="space-y-4">

      {!examBank && (
        <>
          <DarkSelect
            label="Select Question Bank"
            value={selectedBank}
            options={banks.map((b) => ({
              value: b.headerid,
              label: b.title,
            }))}
            onChange={setSelectedBank}
          />

          <TailuxButton color="primary" onClick={handleApplyBank}>
            Apply Bank
          </TailuxButton>
        </>
      )}

      {examBank && (
        <>
          <div className="bg-card border border-divider rounded-lg p-4">
            <p className="text-sm text-muted">
              Selected Question Bank
            </p>

            <p className="text-lg font-semibold">
              {bankName || "-"}
            </p>

            <p className="text-sm text-muted mt-2">
              Total Questions : {examQuestions.length}
            </p>
          </div>

          <div className="space-y-3">
            {examQuestions.map((q, index) => (
              <div
                key={q.id}
                className="bg-card border border-divider rounded-lg p-4"
              >
                <p className="font-semibold mb-2">
                  {index + 1}. {q.question}
                </p>

                <div className="space-y-1 pl-4">
                  {q.options?.map((opt) => (
                    <div
                      key={opt.id}
                      className={`text-sm ${
                        opt.iscorrect
                          ? "text-green-500 font-semibold"
                          : ""
                      }`}
                    >
                      {opt.label}. {opt.optiontext}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert severity={toast.severity} variant="filled">
          {toast.message}
        </Alert>
      </Snackbar>

    </div>
  );
}

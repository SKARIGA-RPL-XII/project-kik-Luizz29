import { API_URL } from '../../../utils/config';
import { toast } from 'sonner';
import { useState } from 'react';
import { ConfirmModal } from 'components/shared/ConfirmModal';

export default function PublishTab({
  exam,
  schedule,
  security,
  examQuestions,
  participants, 
  token,
  examId,
  refreshExam
}) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const hasQuestions = examQuestions?.length > 0;
  const hasSchedule = !!schedule;
  const hasSecurity = !!security;
  const hasParticipants = participants?.length > 0;


  const isReady = hasQuestions && hasSchedule && hasParticipants;
  const formatDate = (dateString) => {

    if (!dateString) return "-";

    return new Date(dateString).toLocaleString("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
      hour12: false
    });
  };

  const handlePublish = async () => {

    if (!isReady) {
      toast.warning("Exam belum siap dipublish");
      return;
    }

    setShowConfirm(true);
  };

  const executePublish = async () => {
    setIsPublishing(true);
    try {

      const res = await fetch(
        `${API_URL}/master/exam/${examId}/publish`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error || "Publish gagal");
        setIsPublishing(false);
        setShowConfirm(false);
        return;
      }

      toast.success("Exam berhasil dipublish");
      refreshExam();

    } catch (err) {
      console.log(err);
      toast.error("Error publish exam");
    } finally {
      setIsPublishing(false);
      setShowConfirm(false);
    }
  };

  // ================= CHECKLIST ITEM =================
  function CheckItem({ label, ok }) {
    return (
      <div className="flex justify-between items-center border-b border-divider py-2">
        <span>{label}</span>

        <span className={`font-medium ${ok ? "text-green-400" : "text-red-400"}`}>
          {ok ? "✔ Ready" : "✖ Missing"}
        </span>
      </div>
    );
  }

  return (
    <div className="max-w-lg space-y-6">

      <h3 className="text-lg font-semibold">Publish Exam</h3>

      {/* ================= SUMMARY ================= */}
      <div className="bg-card border border-divider rounded-lg p-4 space-y-2">

        <p><strong>Exam :</strong> {exam.examnm}</p>
        <p><strong>Status :</strong> {exam.status}</p>

        <p><strong>Total Question :</strong> {examQuestions?.length || 0}</p>

        <p><strong>Total Participant :</strong> {participants?.length || 0}</p>

        {schedule && (
          <p>
            <strong>Schedule :</strong>{" "}
            {formatDate(schedule.StartTime)} - {formatDate(schedule.EndTime)}
          </p>
        )}

      </div>

      {/* ================= CHECKLIST ================= */}
      <div className="bg-card border border-divider rounded-lg p-4 space-y-2">

        <h4 className="font-semibold mb-2">Exam Readiness</h4>

        <CheckItem label="Question Assigned" ok={hasQuestions} />
        <CheckItem label="Schedule Created" ok={hasSchedule} />
        <CheckItem label="Participant Assigned" ok={hasParticipants} />
        <CheckItem label="Security Configured" ok={hasSecurity} />

      </div>

      {/* ================= WARNING ================= */}
      <div className="text-sm text-yellow-400">
        Setelah exam dipublish, konfigurasi exam tidak dapat diubah.
      </div>

      {/* ================= BUTTON ================= */}
      <button
        disabled={!isReady || exam.status === "Published"}
        onClick={handlePublish}
        className={`px-4 py-2 rounded-lg text-white transition
          ${isReady && exam.status !== "Published"
            ? "bg-primary hover:opacity-90"
            : "bg-gray-500 cursor-not-allowed"}
        `}
      >
        {exam.status === "Published"
          ? "Already Published"
          : "Publish Exam"}
      </button>

      <ConfirmModal
        show={showConfirm}
        onClose={() => setShowConfirm(false)}
        onOk={executePublish}
        confirmLoading={isPublishing}
        state="pending"
        messages={{
          pending: {
            title: "Publish Exam?",
            description: "Yakin ingin publish exam ini? Konfigurasi tidak dapat diubah setelah dipublish.",
            actionText: "Publish",
          },
        }}
      />
    </div>
  );
}

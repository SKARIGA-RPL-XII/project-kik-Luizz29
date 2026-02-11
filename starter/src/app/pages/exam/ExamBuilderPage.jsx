import { useState, useEffect } from "react";
import { useParams } from "react-router";
import { Card } from "components/ui";

import QuestionTab from "./QuestionTab";
import ParticipantTab from "./ParticipantTab";
import ScheduleTab from "./ScheduleTab";
import SecurityTab from "./SecurityTab";
import PublishTab from "./PublishTab";

const API_URL = "http://localhost:8081";

export default function ExamBuilderPage() {

  const { id } = useParams();
  const token = localStorage.getItem("authToken");

  const [exam, setExam] = useState(null);
  const [activeTab, setActiveTab] = useState("question");

  const [banks, setBanks] = useState([]);
  const [examBank, setExamBank] = useState(null);
  const [examQuestions, setExamQuestions] = useState([]);

  const [schedule, setSchedule] = useState(null);
  const [security, setSecurity] = useState(null);
  const [participants, setParticipants] = useState([]);

  // ================= FETCH EXAM =================
  const fetchExam = async () => {
    try {
      const res = await fetch(`${API_URL}/master/exam/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = await res.json();
      const examData = json.data || json;

      setExam(examData);
      setExamBank(examData.questionbankid || null);

    } catch (err) {
      console.log(err);
    }
  };

  // ================= FETCH BANK =================
  const fetchBanks = async () => {
    try {
      const res = await fetch(`${API_URL}/master/question-bank`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = await res.json();
      setBanks(json.data || []);

    } catch (err) {
      console.log(err);
    }
  };

  // ================= FETCH QUESTIONS =================
  const fetchExamQuestions = async () => {

    if (!examBank || examQuestions.length > 0) return;

    try {
      const res = await fetch(
        `${API_URL}/master/exam/${id}/questions`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const json = await res.json();
      setExamQuestions(json.data || []);

    } catch (err) {
      console.log(err);
    }
  };

  // ================= FETCH PARTICIPANTS =================
  const fetchParticipants = async () => {
    try {
      const res = await fetch(
        `${API_URL}/master/exam/${id}/participants`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const json = await res.json();
      setParticipants(json.data || []);

    } catch (err) {
      console.log(err);
    }
  };

  // ================= FETCH SCHEDULE =================
  const fetchSchedule = async () => {
    try {
      const res = await fetch(
        `${API_URL}/master/exam/${id}/schedule`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (res.status === 404) {
        setSchedule(null);
        return;
      }

      const data = await res.json();
      setSchedule(data);

    } catch (err) {
      console.log(err);
    }
  };

  // ================= FETCH SECURITY =================
  const fetchSecurity = async () => {
    try {
      const res = await fetch(
        `${API_URL}/master/exam/${id}/security`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (res.status === 404) {
        setSecurity(null);
        return;
      }

      const data = await res.json();
      setSecurity(data);

    } catch (err) {
      console.log(err);
    }
  };

  // ================= INIT LOAD =================
  useEffect(() => {
    fetchExam();
    fetchBanks();
    fetchSchedule();
    fetchSecurity();
    fetchParticipants();
  }, [id]);

  useEffect(() => {
    fetchExamQuestions();
  }, [examBank]);

  if (!exam) return <div>Loading...</div>;

  // ================= TAB BUTTON =================
  function TabButton({ label, active, onClick, disabled }) {
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={`px-4 py-2 rounded-lg text-sm transition
          ${active
            ? "bg-primary text-white"
            : "bg-card border border-divider"}
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        `}
      >
        {label}
      </button>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-4">

      {/* HEADER */}
      <Card className="p-5">
        <h2 className="text-xl font-semibold">{exam.examnm}</h2>

        <p className="text-sm text-muted">
          Duration : {exam.duration} minutes
        </p>

        <p className="text-sm text-muted">
          Status : {exam.status}
        </p>

        <p className="text-sm text-muted">
          Participants : {participants.length}
        </p>
      </Card>

      {/* TAB MENU */}
      <Card className="p-3">
        <div className="flex gap-3">

          <TabButton
            label="Question"
            active={activeTab === "question"}
            onClick={() => setActiveTab("question")}
          />

          <TabButton
            label="Participant"
            active={activeTab === "participant"}
            onClick={() => setActiveTab("participant")}
          />

          <TabButton
            label="Schedule"
            active={activeTab === "schedule"}
            onClick={() => setActiveTab("schedule")}
          />

          <TabButton
            label="Security"
            active={activeTab === "security"}
            onClick={() => setActiveTab("security")}
          />

          <TabButton
            label="Publish"
            active={activeTab === "publish"}
            onClick={() => setActiveTab("publish")}
            disabled={!schedule || participants.length === 0}
          />

        </div>
      </Card>

      {/* TAB CONTENT */}
      <Card className="p-5 min-h-[300px]">

        {activeTab === "question" && (
          <QuestionTab
            examId={id}
            banks={banks}
            examBank={examBank}
            examQuestions={examQuestions}
            setExamBank={setExamBank}
            setExamQuestions={setExamQuestions}
          />
        )}

        {activeTab === "participant" && (
          <ParticipantTab
            examId={id}
            refreshParticipants={fetchParticipants}
          />
        )}

        {activeTab === "schedule" && (
          <ScheduleTab
            examId={id}
            token={token}
            schedule={schedule}
            refreshSchedule={fetchSchedule}
          />
        )}

        {activeTab === "security" && (
          <SecurityTab
            examId={id}
            token={token}
            security={security}
            refreshSecurity={fetchSecurity}
          />
        )}

        {activeTab === "publish" && (
          <PublishTab
            exam={exam}
            schedule={schedule}
            security={security}
            examQuestions={examQuestions}
            participants={participants}
            token={token}
            examId={id}
            refreshExam={fetchExam}
          />
        )}

      </Card>

    </div>
  );
}

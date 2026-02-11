import { useEffect, useState } from "react";
import { DatePicker } from "components/shared/form/Datepicker";

const API_URL = "http://localhost:8081";

// ================= HELPER FORMAT WIB =================
const formatLocalDate = (date) => {
  if (!date) return null;

  const pad = (n) => String(n).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
};

export default function ScheduleTab({
  examId,
  token,
  schedule,
  refreshSchedule
}) {

  const [form, setForm] = useState({
    startTime: null,
    endTime: null
  });

  const [loading, setLoading] = useState(false);

  // ================= LOAD EXISTING SCHEDULE =================
  useEffect(() => {

    if (!schedule) {
      setForm({ startTime: null, endTime: null });
      return;
    }

    setForm({
      startTime: schedule.StartTime
        ? new Date(schedule.StartTime)
        : null,
      endTime: schedule.EndTime
        ? new Date(schedule.EndTime)
        : null
    });

  }, [schedule]);

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.startTime || !form.endTime) {
      alert("Start & End time wajib diisi");
      return;
    }

    if (form.endTime <= form.startTime) {
      alert("End time harus setelah Start time");
      return;
    }

    setLoading(true);

    try {

      const method = schedule ? "PUT" : "POST";

      const res = await fetch(
        `${API_URL}/master/exam/${examId}/schedule`,
        {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            startTime: formatLocalDate(form.startTime),
            endTime: formatLocalDate(form.endTime)
          })
        }
      );

      if (!res.ok) {
        const json = await res.json();
        alert(json.error);
        setLoading(false);
        return;
      }

      await refreshSchedule();
      alert("Schedule saved");

    } catch (err) {
      console.log(err);
      alert("Error saving schedule");
    }

    setLoading(false);
  };

  return (
    <div className="max-w-md space-y-4">

      <h3 className="text-lg font-semibold">Exam Schedule</h3>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* START */}
        <div>
          <label className="text-sm mb-1 block">Start Time</label>

          <DatePicker
            value={form.startTime}
            onChange={(date) =>
              setForm({
                ...form,
                startTime: date ? new Date(date) : null
              })
            }
            options={{
              enableTime: true,
              dateFormat: "Y-m-d H:i"
            }}
            placeholder="Choose start time"
          />
        </div>

        {/* END */}
        <div>
          <label className="text-sm mb-1 block">End Time</label>

          <DatePicker
            value={form.endTime}
            onChange={(date) =>
              setForm({
                ...form,
                endTime: date ? new Date(date) : null
              })
            }
            options={{
              enableTime: true,
              minDate: form.startTime || new Date(),
              dateFormat: "Y-m-d H:i"
            }}
            placeholder="Choose end time"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-primary text-white rounded-lg"
        >
          {loading ? "Saving..." : "Save Schedule"}
        </button>

      </form>
    </div>
  );
}

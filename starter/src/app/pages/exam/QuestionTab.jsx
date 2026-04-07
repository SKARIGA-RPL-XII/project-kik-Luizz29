import { useState, useEffect } from "react";
import DarkSelect from "components/ui/DarkSelect";
import { Button as TailuxButton } from "components/ui";

import { API_URL } from '../../../utils/config';
import { toast } from 'sonner';

export default function QuestionTab({
  examId,
  // teachers = [], // ❌ Hapus dari props, kita akan fetch sendiri
  examTeacher,
  setExamTeacher,
}) {
  const token = localStorage.getItem("authToken");
  
  // ✅ State untuk menyimpan data guru dari API
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(examTeacher || "");
  // ================= FETCH TEACHERS =================
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await fetch(`${API_URL}/select/teachers`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Butuh JWT karena ada middlewares.JWTAuth()
          },
        });

        if (!res.ok) throw new Error("Gagal mengambil data guru");

        const resData = await res.json();
        // Sesuai handler Go kamu: c.JSON(200, gin.H{"data": teachers})
        setTeachers(resData.data || []); 
      } catch (error) {
        console.error("Fetch teachers error:", error);
        toast.error("Gagal memuat daftar guru");
      }
    };

    if (token) {
      fetchTeachers();
    }
  }, [token]);

  // ================= ASSIGN TEACHER =================
  const handleAssignTeacher = async () => {
    if (!selectedTeacher) {
      toast.warning("Pilih guru dulu");
      return;
    }

    const res = await fetch(
      `${API_URL}/master/exam/${examId}/assign-teacher`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          teacher_id: Number(selectedTeacher),
        }),
      }
    );

    if (!res.ok) {
      toast.error("Gagal assign guru");
      return;
    }

    setExamTeacher(Number(selectedTeacher));

    toast.success("Guru berhasil di-assign");
  };

  // ✅ Cari nama guru (mendukung multiple keys sesuai backend)
  const teacherName = teachers.find(
    (t) => (t.id || t.teacherid) === examTeacher
  )?.name || teachers.find(
    (t) => (t.id || t.teacherid) === examTeacher
  )?.teachernm;

  return (
    <div className="space-y-4">
      {!examTeacher && (
        <>
          <DarkSelect
            label="Assign Teacher"
            value={selectedTeacher}
            options={teachers.map((t) => ({
              value: t.id || t.teacherid,
              label: t.name || t.teachernm,
            }))}
            onChange={setSelectedTeacher}
          />

          <TailuxButton color="primary" onClick={handleAssignTeacher}>
            Assign Teacher
          </TailuxButton>
         </>
      )}

      {examTeacher && (
        <div className="bg-card border border-divider rounded-lg p-4">
          <p className="text-sm text-muted">Assigned Teacher</p>
          <p className="text-lg font-semibold">{teacherName || "Memuat nama..."}</p>
          <p className="text-sm text-muted mt-2">
            Teacher akan mengatur soal ujian
          </p>
        </div>
      )}


    </div>
  );
}
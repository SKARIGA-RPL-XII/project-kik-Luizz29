import { useEffect, useMemo, useState } from "react";
import { Button as TailuxButton } from "components/ui";
import { useNavigate } from "react-router";

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";

import { API_URL } from '../../../utils/config';

export default function AssignedExamsPage() {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const token = localStorage.getItem("authToken");

  useEffect(() => {
    const fetchMyExams = async () => {
      const res = await fetch(`${API_URL}/master/exam/my-exams`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        console.error("Gagal fetch my exams");
        return;
      }

      const json = await res.json();
      setExams(json.data || []);
    };

    fetchMyExams();
  }, [token]);

  const columns = useMemo(
    () => [
      { header: "No", cell: ({ row }) => row.index + 1 },
      { header: "Exam Name", accessorKey: "examnm" },
      { header: "Description", accessorKey: "description" },
      { header: "Duration (min)", accessorKey: "duration" },
      { header: "Status", accessorKey: "status" },
      {
        header: "Action",
        cell: ({ row }) => {
          return (
            <TailuxButton
              color="primary"
              onClick={() =>
                navigate(`/teacher/manage-question-exam/${row.original.id}`)
              }
            >
              Insert Question Bank
            </TailuxButton>
          );
        },
      },
    ],
    [navigate]
  );

  const table = useReactTable({
    data: exams,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="p-6 md:p-8">
      <div className="bg-background border border-divider rounded-xl">
        <div className="border-b border-divider px-6 py-4">
          <h1 className="text-lg font-semibold">Assigned Exams</h1>
          <p className="text-sm text-muted">
            Daftar ujian yang ditugaskan kepada Anda. Klik &quot;Insert Question Bank&quot; untuk memasukkan soal ke dalam ujian.
          </p>
        </div>

        <div className="px-6 py-4 overflow-x-auto">
          <table className="w-full text-sm border border-divider">
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((h) => (
                    <th key={h.id} className="px-3 py-2 text-left font-medium">
                      {flexRender(h.column.columnDef.header, h.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-t border-divider hover:bg-card">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-3 py-2">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
              {exams.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-muted">
                    Tidak ada ujian yang ditugaskan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

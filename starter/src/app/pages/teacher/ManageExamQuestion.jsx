import { useEffect, useMemo, useState } from "react";
import DarkSelect from "components/ui/DarkSelect";
import { Button as TailuxButton } from "components/ui";
import { useParams } from "react-router";


import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { API_URL } from '../../../utils/config';
import { toast } from 'sonner';

export default function TeacherExamQuestionPage() {

  const { id } = useParams(); // ← SESUAIKAN DENGAN ROUTE /master/exam/:id
  const token = localStorage.getItem("authToken");


  // ================= STATE =================
  const [banks, setBanks] = useState([]);
  const [selectedBank, setSelectedBank] = useState("");
  const [examQuestions, setExamQuestions] = useState([]);
  // ================= FETCH BANK =================
  const fetchBanks = async () => {
    const resBanks = await fetch(`${API_URL}/master/question-bank/my-banks`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    if (!resBanks.ok) {
      console.error("Gagal fetch data question banks");
      setBanks([]);
      return;
    }

    const jsonBanks = await resBanks.json();
    setBanks(jsonBanks.data || []);
  };

  // ================= FETCH SNAPSHOT =================
  const fetchExamQuestions = async () => {
    const res = await fetch(
      `${API_URL}/master/exam/${id}/questions`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!res.ok) return;

    const json = await res.json();
    setExamQuestions(json.data || []);
  };

  useEffect(() => {
    fetchBanks();
    fetchExamQuestions();
  }, []);

  // ================= APPLY BANK =================
  const handleApplyBank = async () => {

    if (!selectedBank) {
      toast.warning("Pilih bank soal dulu");
      return;
    }

    const res = await fetch(
      `${API_URL}/master/exam/${id}/set-bank`,
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
      toast.error("Gagal apply bank");
      return;
    }

    await fetchExamQuestions();

    toast.success("Bank berhasil di-apply");
  };

  // ================= TABLE =================
  const columns = useMemo(() => [
    { header: "No", cell: ({ row }) => row.index + 1 },
    { header: "Question", accessorKey: "question" },
  ], []);

  const table = useReactTable({
    data: examQuestions,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // ================= UI =================
  return (
    <div className="p-6 md:p-8">
      <div className="bg-background border border-divider rounded-xl">

        {/* HEADER */}
        <div className="border-b border-divider px-6 py-4">
          <h1 className="text-lg font-semibold">
            Assign Question Bank
          </h1>
          <p className="text-sm text-muted">
            Pilih bank soal untuk ujian ini
          </p>
        </div>

        {/* SELECT BANK */}
        <div className="px-6 py-6 border-b border-divider space-y-4">

          <DarkSelect
            label="Question Bank"
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

        </div>

        {/* SNAPSHOT TABLE */}
        <div className="px-6 py-4 overflow-x-auto">
          <h2 className="font-semibold mb-3">
            Snapshot Questions ({examQuestions.length})
          </h2>

          <table className="w-full text-sm border border-divider">
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((h) => (
                    <th key={h.id} className="px-3 py-2 text-left">
                      {flexRender(h.column.columnDef.header, h.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>

            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-t border-divider">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-3 py-2">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>

          </table>
        </div>

      </div>

    </div>
  );
}
import { useEffect, useMemo, useState } from "react";
import DarkSelect from "components/ui/DarkSelect";
import { Button as TailuxButton } from "components/ui";
import { useNavigate } from "react-router";


// MUI



import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";

import { Modal, ModalHeader, ModalBody, ModalFooter } from "components/ui/Modal";

import { API_URL } from '../../../utils/config';
import { toast } from 'sonner';

export default function QuestionBankPage() {

  const navigate = useNavigate();

  // ======================
  // STATE
  // ======================
  const [subjects, setSubjects] = useState([]);
  const [banks, setBanks] = useState([]);

  const [title, setTitle] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [description, setDescription] = useState("");

  const [openDelete, setOpenDelete] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const [openEdit, setOpenEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editSubjectId, setEditSubjectId] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const token = localStorage.getItem("authToken");

  // ======================
  // FETCH SUBJECT
  // ======================
  const fetchSubjects = async () => {
    const res = await fetch(`${API_URL}/select/subjects`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      console.error("Gagal fetch subject");
      return;
    }

    const json = await res.json();
    setSubjects(json.data || []);
  };

  // ======================
  // FETCH BANK
  // ======================
  const fetchBanks = async () => {
    const res = await fetch(`${API_URL}/master/question-bank`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      console.error("Gagal fetch question bank");
      return;
    }

    const json = await res.json();
    setBanks(json.data || []);
  };

  useEffect(() => {
    fetchSubjects();
    fetchBanks();
  }, []);

  // ======================
  // CREATE
  // ======================
  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch(`${API_URL}/master/question-bank`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title,
        subjectid: Number(subjectId),
        teacherid: 1, // sementara hardcode dulu
        description,
        details: []   // WAJIB ADA
      }),
    });


    if (!res.ok) {
      toast.error("Gagal menambahkan bank");
      return;
    }

    const json = await res.json();
    setBanks((prev) => [...prev, json.data]);

    setTitle("");
    setSubjectId("");
    setDescription("");

    toast.success("Bank berhasil ditambahkan");
  };

  // ======================
  // EDIT
  // ======================
  const handleConfirmEdit = async () => {
    const res = await fetch(`${API_URL}/master/question-bank/${editId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: editTitle,
        subjectid: Number(editSubjectId),
        description: editDescription,
      }),
    });

    if (!res.ok) {
      toast.error("Gagal update bank");
      return;
    }

    setBanks((prev) =>
      prev.map((b) =>
        b.headerid === editId
          ? {
            ...b,
            title: editTitle,
            subjectid: Number(editSubjectId),
            description: editDescription,
          }
          : b
      )
    );

    setOpenEdit(false);
    toast.success("Bank berhasil diupdate");
  };

  // ======================
  // DELETE
  // ======================
  const handleConfirmDelete = async () => {
    const res = await fetch(`${API_URL}/master/question-bank/${selectedId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      toast.error("Gagal hapus bank");
      return;
    }

    setBanks((prev) =>
      prev.filter((b) => b.headerid !== selectedId)
    );

    setOpenDelete(false);

    toast.success("Bank berhasil dihapus");
  };

  // ======================
  // TABLE
  // ======================
  const columns = useMemo(
    () => [
      { header: "ID", accessorKey: "headerid" },
      { header: "Title", accessorKey: "title" },
      {
        header: "Subject",
        accessorKey: "subjectid",
        cell: ({ getValue }) =>
          subjects.find((s) => s.subjectid === getValue())?.subjectnm || "-",
      },
      { header: "Description", accessorKey: "description" },
      {
        header: "Action",
        cell: ({ row }) => {
          const bank = row.original;

          return (
            <div className="flex gap-2 flex-wrap">
              {/* ===== EDIT ===== */}
              <TailuxButton
                size="small"
                variant="outlined"
                onClick={() => {
                  setEditId(bank.headerid);
                  setEditTitle(bank.title);
                  setEditSubjectId(bank.subjectid);
                  setEditDescription(bank.description);
                  setOpenEdit(true);
                }}
              >
                Edit
              </TailuxButton>

              {/* ===== DELETE ===== */}
              <TailuxButton
                size="small"
                variant="outlined"
                color="error"
                onClick={() => {
                  setSelectedId(bank.headerid);
                  setOpenDelete(true);
                }}
              >
                Delete
              </TailuxButton>

              {/* ===== MANAGE QUESTION ===== */}
              <TailuxButton
                color="primary"
                onClick={() =>
                  navigate(`/teacher/question-bank/${row.original.headerid}`)
                }
              >
                Manage Question
              </TailuxButton>

            </div>
          );
        },
      }

    ],
    [subjects]
  );

  const table = useReactTable({
    data: banks,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  // ======================
  // UI
  // ======================
  return (
    <div className="p-6 md:p-8">
      <div className="bg-background border border-divider rounded-xl">

        {/* HEADER */}
        <div className="border-b border-divider px-6 py-4">
          <h1 className="text-lg font-semibold">Question Bank Management</h1>
          <p className="text-sm text-muted">Kelola bank soal</p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="px-6 py-6 border-b border-divider">
          <div className="grid md:grid-cols-2 gap-4">

            {/* TITLE */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-muted">
                Title
              </label>
              <input
                className="w-full rounded-lg px-4 py-2 text-sm bg-card border border-divider text-foreground"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* SUBJECT */}
            <DarkSelect
              label="Subject"
              value={subjectId}
              options={subjects.map((s) => ({
                value: s.subjectid,
                label: s.subjectnm,
              }))}
              onChange={setSubjectId}
            />

            {/* DESCRIPTION */}
            <div className="md:col-span-2 space-y-1">
              <label className="text-sm font-medium text-muted">
                Description
              </label>

              <textarea
                rows={3}
                className="w-full rounded-lg px-4 py-2 text-sm bg-card border border-divider text-foreground resize-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end mt-5">
            <TailuxButton color="primary" type="submit">
              + Add Bank
            </TailuxButton>
          </div>
        </form>

        {/* TABLE */}
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

      {/* DIALOG + TOAST */}
      
        {/* DELETE */}
        <Modal open={openDelete} onClose={() => setOpenDelete(false)}>
          <ModalHeader>Hapus Bank</ModalHeader>
          <ModalBody>
            Yakin ingin menghapus bank ini?
          </ModalBody>
          <ModalFooter>
            <TailuxButton onClick={() => setOpenDelete(false)} variant="outlined">Batal</TailuxButton>
            <TailuxButton color="error" onClick={handleConfirmDelete}>
              Hapus
            </TailuxButton>
          </ModalFooter>
        </Modal>

        {/* EDIT */}
        <Modal open={openEdit} onClose={() => setOpenEdit(false)}>
          <ModalHeader>Edit Bank</ModalHeader>

          <ModalBody className="space-y-4">

            <input
              className="w-full rounded-lg px-4 py-2 text-sm bg-card border border-divider"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
            />

            <DarkSelect
              label="Subject"
              value={editSubjectId}
              options={subjects.map((s) => ({
                value: s.subjectid,
                label: s.subjectnm,
              }))}
              onChange={setEditSubjectId}
            />

            <textarea
              className="w-full rounded-lg px-4 py-2 text-sm bg-card border border-divider"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
            />

          </ModalBody>

          <ModalFooter>
            <TailuxButton onClick={() => setOpenEdit(false)} variant="outlined">Batal</TailuxButton>
            <TailuxButton color="primary" onClick={handleConfirmEdit}>
              Simpan
            </TailuxButton>
          </ModalFooter>
        </Modal>
    </div>
  );
}

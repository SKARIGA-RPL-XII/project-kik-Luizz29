import { useEffect, useMemo, useState } from "react";
import { Button as TailuxButton } from "components/ui";
import { ThemeProvider } from "@mui/material/styles";
import { useMuiTheme } from "hooks/useMuiTheme";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router";


import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";

const API_URL = "http://localhost:8081";

export default function ExamPage() {
  const navigate = useNavigate();


  const muiTheme = useMuiTheme();
  const token = localStorage.getItem("authToken");

  const [exams, setExams] = useState([]);

  const [examnm, setExamnm] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");

  const [openDelete, setOpenDelete] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const [openEdit, setOpenEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editExamnm, setEditExamnm] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDuration, setEditDuration] = useState("");

  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // ================= FETCH =================
  const fetchExam = async () => {
    const res = await fetch(`${API_URL}/master/exam`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      console.error("Gagal fetch exam");
      return;
    }

    const json = await res.json();
    setExams(json.data || json);
  };

  useEffect(() => {
    fetchExam();
  }, []);

  // ================= CREATE =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch(`${API_URL}/master/exam`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        examnm,
        description,
        duration: Number(duration),
      }),
    });

    if (!res.ok) {
      setToast({ open: true, message: "Gagal tambah exam", severity: "error" });
      return;
    }

    fetchExam();

    setExamnm("");
    setDescription("");
    setDuration("");

    setToast({ open: true, message: "Exam berhasil ditambahkan", severity: "success" });
  };

  // ================= EDIT =================
  const handleConfirmEdit = async () => {

    const res = await fetch(`${API_URL}/master/exam/${editId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        examnm: editExamnm,
        description: editDescription,
        duration: Number(editDuration),
      }),
    });

    if (!res.ok) {
      setToast({ open: true, message: "Gagal update exam", severity: "error" });
      return;
    }

    fetchExam();
    setOpenEdit(false);

    setToast({ open: true, message: "Exam berhasil diupdate", severity: "success" });
  };

  // ================= DELETE =================
  const handleConfirmDelete = async () => {

    const res = await fetch(`${API_URL}/master/exam/${selectedId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      setToast({ open: true, message: "Gagal hapus exam", severity: "error" });
      return;
    }

    fetchExam();
    setOpenDelete(false);

    setToast({ open: true, message: "Exam berhasil dihapus", severity: "success" });
  };

  // ================= TABLE =================
const columns = useMemo(() => [
  { header: "ID", accessorKey: "id" },
  { header: "Exam Name", accessorKey: "examnm" },
  { header: "Description", accessorKey: "description" },
  { header: "Duration", accessorKey: "duration" },
  { header: "Status", accessorKey: "status" },
  {
    header: "Action",
    cell: ({ row }) => {

      const exam = row.original;

      return (
        <div className="flex gap-2 flex-wrap">

          {/* ===== MANAGE ===== */}
          <TailuxButton
            color="primary"
            onClick={() => navigate(`/exam/${exam.id}`)}
            disabled={exam.status === "Published"}
          >
            Manage
          </TailuxButton>

          {/* ===== EDIT ===== */}
          <Button
            size="small"
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => {
              setEditId(exam.id);
              setEditExamnm(exam.examnm);
              setEditDescription(exam.description);
              setEditDuration(exam.duration);
              setOpenEdit(true);
            }}
          >
            Edit
          </Button>

          {/* ===== DELETE ===== */}
          <Button
            size="small"
            color="error"
            variant="outlined"
            startIcon={<DeleteIcon />}
            onClick={() => {
              setSelectedId(exam.id);
              setOpenDelete(true);
            }}
          >
            Delete
          </Button>

        </div>
      );
    }
  }
], [navigate]);


  const table = useReactTable({
    data: exams,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="p-6 md:p-8">

      <div className="bg-background border border-divider rounded-xl">

        {/* HEADER */}
        <div className="border-b border-divider px-6 py-4">
          <h1 className="text-lg font-semibold">Exam Management</h1>
          <p className="text-sm text-muted">Kelola ujian</p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="px-6 py-6 border-b border-divider">

          <div className="grid md:grid-cols-3 gap-4">

            <input
              className="rounded-lg px-4 py-2 bg-card border border-divider"
              placeholder="Exam Name"
              value={examnm}
              onChange={(e) => setExamnm(e.target.value)}
            />

            <input
              className="rounded-lg px-4 py-2 bg-card border border-divider"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <input
              type="number"
              className="rounded-lg px-4 py-2 bg-card border border-divider"
              placeholder="Duration"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />

          </div>

          <div className="flex justify-end mt-5">
            <TailuxButton color="primary" type="submit">
              + Add Exam
            </TailuxButton>
          </div>

        </form>

        {/* TABLE */}
        <div className="px-6 py-4 overflow-x-auto">

          <table className="w-full text-sm border border-divider">

            <thead>
              {table.getHeaderGroups().map(hg => (
                <tr key={hg.id}>
                  {hg.headers.map(h => (
                    <th key={h.id} className="px-3 py-2 text-left">
                      {flexRender(h.column.columnDef.header, h.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>

            <tbody>
              {table.getRowModel().rows.map(row => (
                <tr key={row.id} className="border-t border-divider">
                  {row.getVisibleCells().map(cell => (
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
      <ThemeProvider theme={muiTheme}>

        {/* DELETE */}
        <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
          <DialogTitle>Hapus Exam</DialogTitle>
          <DialogContent>
            <DialogContentText>Yakin ingin menghapus exam ini?</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDelete(false)}>Batal</Button>
            <Button color="error" variant="contained" onClick={handleConfirmDelete}>
              Hapus
            </Button>
          </DialogActions>
        </Dialog>

        {/* EDIT */}
        <Dialog open={openEdit} onClose={() => setOpenEdit(false)}>
          <DialogTitle>Edit Exam</DialogTitle>

          <DialogContent className="space-y-4">

            <input
              className="w-full rounded-lg px-4 py-2 bg-card border border-divider"
              value={editExamnm}
              onChange={(e) => setEditExamnm(e.target.value)}
            />

            <input
              className="w-full rounded-lg px-4 py-2 bg-card border border-divider"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
            />

            <input
              type="number"
              className="w-full rounded-lg px-4 py-2 bg-card border border-divider"
              value={editDuration}
              onChange={(e) => setEditDuration(e.target.value)}
            />

          </DialogContent>

          <DialogActions>
            <Button onClick={() => setOpenEdit(false)}>Batal</Button>
            <Button variant="contained" onClick={handleConfirmEdit}>
              Simpan
            </Button>
          </DialogActions>
        </Dialog>

        {/* TOAST */}
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

      </ThemeProvider>

    </div>
  );
}

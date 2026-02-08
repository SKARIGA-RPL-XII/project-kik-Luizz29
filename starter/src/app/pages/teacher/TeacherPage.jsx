import { useEffect, useMemo, useState } from "react";
import DarkSelect from "components/ui/DarkSelect";
import { Button as TailuxButton } from "components/ui";

// MUI
import { ThemeProvider } from "@mui/material/styles";
import { useMuiTheme } from "hooks/useMuiTheme";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

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

export default function TeacherPage() {

  // ================= STATE =================
  const [users, setUsers] = useState([]);
  const [teachers, setTeachers] = useState([]);

  const [teacherName, setTeacherName] = useState("");
  const [userId, setUserId] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [openDelete, setOpenDelete] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const [openEdit, setOpenEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editIsActive, setEditIsActive] = useState(true);

  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const muiTheme = useMuiTheme();
  const token = localStorage.getItem("authToken");

  // ================= FETCH =================
  useEffect(() => {

    fetch(`${API_URL}/select/users`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(j => setUsers(j.data || []));

    fetch(`${API_URL}/master/teacher`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(j => setTeachers(j.data || []));

  }, []);

  // ================= CREATE =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch(`${API_URL}/master/teacher`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        teachernm: teacherName,
        userid: Number(userId),
        isactive: isActive,
      }),
    });

    if (!res.ok) {
      setToast({ open: true, message: "Gagal menambahkan teacher", severity: "error" });
      return;
    }

    const json = await res.json();

    setTeachers(prev => [...prev, json.data]);

    setTeacherName("");
    setUserId("");
    setIsActive(true);

    setToast({ open: true, message: "Teacher berhasil ditambahkan", severity: "success" });
  };

  // ================= EDIT =================
  const handleConfirmEdit = async () => {

    const res = await fetch(`${API_URL}/master/teacher/${editId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        isactive: editIsActive,
      }),
    });

    if (!res.ok) {
      setToast({ open: true, message: "Gagal update teacher", severity: "error" });
      return;
    }

    setTeachers(prev =>
      prev.map(t =>
        t.teacherid === editId
          ? { ...t, isactive: editIsActive }
          : t
      )
    );

    setOpenEdit(false);

    setToast({ open: true, message: "Teacher berhasil diupdate", severity: "success" });
  };

  // ================= DELETE =================
  const handleConfirmDelete = async () => {

    const res = await fetch(`${API_URL}/master/teacher/${selectedId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      setToast({ open: true, message: "Gagal menghapus teacher", severity: "error" });
      return;
    }

    setTeachers(prev =>
      prev.filter(t => t.teacherid !== selectedId)
    );

    setOpenDelete(false);

    setToast({ open: true, message: "Teacher berhasil dihapus", severity: "success" });
  };

  // ================= TABLE =================
  const columns = useMemo(() => [

    { header: "ID", accessorKey: "teacherid" },

    { header: "Teacher Name", accessorKey: "teachernm" },

    {
      header: "User",
      accessorKey: "userid",
      cell: ({ getValue }) =>
        users.find(u => u.userid === getValue())?.username || "-"
    },

    {
      header: "Status",
      accessorKey: "isactive",
      cell: ({ getValue }) => (
        <span
          className={`px-2 py-0.5 rounded text-xs font-semibold ${
            getValue()
              ? "bg-success/20 text-success"
              : "bg-danger/20 text-danger"
          }`}
        >
          {getValue() ? "ACTIVE" : "INACTIVE"}
        </span>
      )
    },

    {
      header: "Action",
      cell: ({ row }) => (
        <div className="flex gap-2">

          <Button
            size="small"
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => {
              setEditId(row.original.teacherid);
              setEditIsActive(row.original.isactive);
              setOpenEdit(true);
            }}
          >
            Edit
          </Button>

          <Button
            size="small"
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => {
              setSelectedId(row.original.teacherid);
              setOpenDelete(true);
            }}
          >
            Delete
          </Button>

        </div>
      )
    }

  ], [users]);

  const table = useReactTable({
    data: teachers,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  // ================= UI =================
  return (
    <div className="p-6 md:p-8">
      <div className="bg-background border border-divider rounded-xl">

        {/* HEADER */}
        <div className="border-b border-divider px-6 py-4">
          <h1 className="text-lg font-semibold">Teacher Management</h1>
          <p className="text-sm text-muted">Kelola data teacher</p>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="px-6 py-6 space-y-4 border-b border-divider"
        >

          {/* Teacher Name */}
          <div>
            <label className="block text-sm mb-1">Teacher Name</label>
            <input
              value={teacherName}
              onChange={(e) => setTeacherName(e.target.value)}
              className="w-full rounded-lg px-4 py-2 bg-card border border-divider"
              placeholder="Masukkan nama teacher"
            />
          </div>

          {/* User Select */}
          <DarkSelect
            label="User"
            placeholder="-- Pilih User --"
            value={userId}
            options={users.map(u => ({
              value: u.userid,
              label: u.username,
            }))}
            onChange={setUserId}
          />

          {/* Active */}
          <label
            className={`flex items-center gap-3 rounded-lg px-4 py-3 border cursor-pointer transition ${
              isActive
                ? "border-success/60 bg-success/10 text-success"
                : "border-divider bg-background text-muted"
            }`}
          >
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-5 w-5"
            />
            <span className="text-sm font-medium">Active Teacher</span>
          </label>

          <div className="flex justify-end">
            <TailuxButton color="primary">
              + Add Teacher
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
                    <th key={h.id} className="px-3 py-2 text-left font-medium">
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
          <DialogTitle>Hapus Teacher</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Yakin mau menghapus teacher ini?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDelete(false)}>Batal</Button>
            <Button
              color="error"
              variant="contained"
              onClick={handleConfirmDelete}
            >
              Hapus
            </Button>
          </DialogActions>
        </Dialog>

        {/* EDIT */}
        <Dialog open={openEdit} onClose={() => setOpenEdit(false)}>
          <DialogTitle>Edit Teacher</DialogTitle>
          <DialogContent>
            <label className="flex items-center gap-3 mt-3">
              <input
                type="checkbox"
                checked={editIsActive}
                onChange={(e) => setEditIsActive(e.target.checked)}
              />
              Active Teacher
            </label>
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

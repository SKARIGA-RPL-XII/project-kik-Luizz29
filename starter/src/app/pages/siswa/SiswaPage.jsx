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

const selectClass = `
  w-full rounded-lg px-4 py-2 text-sm
  bg-card text-foreground
  border border-divider
  focus:outline-none focus:ring-2 focus:ring-primary/40
  [&>option]:bg-background
  [&>option]:text-foreground
`;

export default function SiswaPage() {
  // ======================
  // STATE
  // ======================
  const [users, setUsers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [siswas, setSiswas] = useState([]);

  const [userId, setUserId] = useState("");
  const [classId, setClassId] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [openDelete, setOpenDelete] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const [openEdit, setOpenEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editClassId, setEditClassId] = useState("");
  const [editIsActive, setEditIsActive] = useState(true);

  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const muiTheme = useMuiTheme();
  const token = localStorage.getItem("authToken");

  // ======================
  // FETCH
  // ======================
  useEffect(() => {
    fetch(`${API_URL}/select/users`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((j) => setUsers(j.data || []));

    fetch(`${API_URL}/select/classes`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((j) => setClasses(j.data || []));

    fetch(`${API_URL}/master/siswa`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((j) => setSiswas(j.data || []));
  }, []);

  // ======================
  // CREATE
  // ======================
  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch(`${API_URL}/master/siswa`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        userid: Number(userId),
        classid: Number(classId),
        isactive: isActive,
      }),
    });

    if (!res.ok) {
      setToast({ open: true, message: "Gagal menambahkan siswa", severity: "error" });
      return;
    }

    const json = await res.json();
    setSiswas((prev) => [...prev, json.data]);

    setUserId("");
    setClassId("");
    setIsActive(true);

    setToast({ open: true, message: "Siswa berhasil ditambahkan", severity: "success" });
  };

  // ======================
  // EDIT
  // ======================
  const handleConfirmEdit = async () => {
    const res = await fetch(`${API_URL}/master/siswa/${editId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        classid: Number(editClassId),
        isactive: editIsActive,
      }),
    });

    if (!res.ok) {
      setToast({ open: true, message: "Gagal update siswa", severity: "error" });
      return;
    }

    setSiswas((prev) =>
      prev.map((s) =>
        s.siswaid === editId
          ? { ...s, classid: Number(editClassId), isactive: editIsActive }
          : s
      )
    );

    setOpenEdit(false);
    setToast({ open: true, message: "Siswa berhasil diupdate", severity: "success" });
  };

  // ======================
  // DELETE
  // ======================
  const handleConfirmDelete = async () => {
    const res = await fetch(`${API_URL}/master/siswa/${selectedId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      setToast({ open: true, message: "Gagal menghapus siswa", severity: "error" });
      return;
    }

    setSiswas((prev) => prev.filter((s) => s.siswaid !== selectedId));
    setOpenDelete(false);
    setToast({ open: true, message: "Siswa berhasil dihapus", severity: "success" });
  };

  // ======================
  // TABLE
  // ======================
  const columns = useMemo(
    () => [
      { header: "ID", accessorKey: "siswaid" },
      {
        header: "User",
        accessorKey: "userid",
        cell: ({ getValue }) =>
          users.find((u) => u.userid === getValue())?.username || "-",
      },
      {
        header: "Class",
        accessorKey: "classid",
        cell: ({ getValue }) =>
          classes.find((c) => c.classid === getValue())?.classnm || "-",
      },
      {
        header: "Status",
        accessorKey: "isactive",
        cell: ({ getValue }) => (
          <span
            className={`px-2 py-0.5 rounded text-xs font-semibold ${getValue()
              ? "bg-success/20 text-success"
              : "bg-danger/20 text-danger"
              }`}
          >
            {getValue() ? "ACTIVE" : "INACTIVE"}
          </span>
        ),
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
                setEditId(row.original.siswaid);
                setEditClassId(row.original.classid);
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
                setSelectedId(row.original.siswaid);
                setOpenDelete(true);
              }}
            >
              Delete
            </Button>
          </div>
        ),
      },
    ],
    [users, classes]
  );

  const table = useReactTable({
    data: siswas,
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
          <h1 className="text-lg font-semibold">Siswa Management</h1>
          <p className="text-sm text-muted">Kelola data siswa dan kelas</p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4 border-b border-divider">
          <DarkSelect
            label="User"
            placeholder="-- Pilih User --"
            value={userId}
            options={users.map((u) => ({
              value: u.userid,
              label: u.username,
            }))}
            onChange={setUserId}
          />

          <DarkSelect
            label="Class"
            placeholder="-- Pilih Class --"
            value={classId}
            options={classes.map((c) => ({
              value: c.classid,
              label: c.classnm,
            }))}
            onChange={setClassId}
          />





          <label
            className={`flex items-center gap-3 rounded-lg px-4 py-3 border cursor-pointer transition ${isActive
              ? "border-success/60 bg-success/10 text-success"
              : "border-divider bg-background text-muted"
              }`}
          >
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-5 w-5 rounded border border-divider text-primary"
            />
            <span className="text-sm font-medium">Active Siswa</span>
          </label>

          <div className="flex justify-end">
   
                <TailuxButton
                    color="primary"

                >
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
      <ThemeProvider theme={muiTheme}>
        {/* DELETE */}
        <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
          <DialogTitle>Hapus Siswa</DialogTitle>
          <DialogContent>
            <DialogContentText>Yakin mau menghapus siswa ini?</DialogContentText>
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
          <DialogTitle>Edit Siswa</DialogTitle>
          <DialogContent className="space-y-4">
            <select className={selectClass} value={editClassId} onChange={(e) => setEditClassId(e.target.value)}>
              {classes.map((c) => (
                <option key={c.classid} value={c.classid}>{c.classnm}</option>
              ))}
            </select>

            <label
              className={`flex items-center gap-3 rounded-lg px-4 py-3 border cursor-pointer transition ${editIsActive
                ? "border-success/60 bg-success/10 text-success"
                : "border-divider bg-background text-muted"
                }`}
            >
              <input
                type="checkbox"
                checked={editIsActive}
                onChange={(e) => setEditIsActive(e.target.checked)}
                className="h-5 w-5 rounded border border-divider text-primary"
              />
              <span className="text-sm font-medium">Active Siswa</span>
            </label>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenEdit(false)}>Batal</Button>
            <Button variant="contained" onClick={handleConfirmEdit}>Simpan</Button>
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

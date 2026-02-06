import { useEffect, useMemo, useState } from "react";
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
} from "@mui/material";
import { toast } from "sonner";

const API_URL = "http://localhost:8081";

export default function ClassPage() {
  // ======================
  // STATE
  // ======================
  const [className, setClassName] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [classes, setClasses] = useState([]);

  // DELETE
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  // EDIT
  const [openEdit, setOpenEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editClassName, setEditClassName] = useState("");
  const [editIsActive, setEditIsActive] = useState(true);

  // ======================
  // THEME
  // ======================
  const muiTheme = useMuiTheme();

  // ======================
  // FETCH CLASS
  // ======================
  const fetchClasses = async () => {
    const token = localStorage.getItem("authToken");

    const res = await fetch(`${API_URL}/master/class`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      console.error("Gagal fetch class");
      return;
    }

    const json = await res.json();
    setClasses(json.data);
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  // ======================
  // CREATE CLASS
  // ======================
  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("authToken");

    const res = await fetch(`${API_URL}/master/class`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        classnm: className,
        isactive: isActive,
      }),
    });

    if (!res.ok) {
      alert("Gagal menambahkan class");
      return;
    }

    const json = await res.json();
    setClasses((prev) => [...prev, json.data]);

    setClassName("");
    setIsActive(true);
  };

  // ======================
  // EDIT
  // ======================
  const handleOpenEdit = (row) => {
    setEditId(row.classid);
    setEditClassName(row.classnm);
    setEditIsActive(row.isactive);
    setOpenEdit(true);
  };

  const handleConfirmEdit = async () => {
    const token = localStorage.getItem("authToken");

    const res = await fetch(
      `${API_URL}/master/class/${editId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          classnm: editClassName,
          isactive: editIsActive,
        }),
      }
    );

    if (!res.ok) {
      alert("Gagal update class");
      return;
    }

    setClasses((prev) =>
      prev.map((c) =>
        c.classid === editId
          ? { ...c, classnm: editClassName, isactive: editIsActive }
          : c
      )
    );

    setOpenEdit(false);
  };

  // ======================
  // DELETE
  // ======================
const handleConfirmDelete = async () => {
  const token = localStorage.getItem("authToken");

  try {
    const res = await fetch(
      `${API_URL}/master/class/${selectedId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) {
      const err = await res.json();
      alert(err.message || "Gagal menghapus class");
      return;
    }

    setClasses((prev) =>
      prev.filter((c) => c.classid !== selectedId)
    );

    toast.success("Class berhasil dihapus ");
    setOpenDelete(false);
  } catch {
    toast.error("Terjadi kesalahan saat menghapus class");
  }
};


  // ======================
  // TABLE
  // ======================
  const columns = useMemo(
    () => [
      { header: "ID", accessorKey: "classid" },
      { header: "Class Name", accessorKey: "classnm" },
      {
        header: "Status",
        accessorKey: "isactive",
        cell: ({ getValue }) => (
          <span
            className={`
              px-2 py-0.5 rounded text-xs font-semibold
              ${getValue()
                ? "bg-success/20 text-success"
                : "bg-danger/20 text-danger"}
            `}
          >
            {getValue() ? "ACTIVE" : "INACTIVE"}
          </span>
        ),
      },
      {
        header: "Created",
        accessorKey: "createddate",
        cell: ({ getValue }) =>
          getValue()
            ? new Date(getValue()).toLocaleDateString()
            : "-",
      },
      {
        header: "Action",
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button
              size="small"
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => handleOpenEdit(row.original)}
            >
              Edit
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => {
                setSelectedId(row.original.classid);
                setOpenDelete(true);
              }}
            >
              Delete
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: classes,
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
          <h1 className="text-lg font-semibold">Class Management</h1>
          <p className="text-sm text-muted">
            Create and manage class
          </p>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="px-6 py-6 space-y-4 border-b border-divider"
        >
          <input
            className="w-full rounded-lg px-4 py-2 text-sm bg-card border"
            placeholder="Class Name"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            required
          />

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            Active Class
          </label>

          <div className="flex justify-end">
              <TailuxButton
                    color="primary"
                    type="submit"
                >
                    + Add Class
                </TailuxButton>
          </div>
        </form>

        {/* TABLE */}
        <div className="px-6 py-4 overflow-x-auto">
          <table className="w-full text-sm border">
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((h) => (
                    <th key={h.id} className="px-3 py-2 text-left">
                      {flexRender(
                        h.column.columnDef.header,
                        h.getContext()
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-t">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-3 py-2">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* DELETE DIALOG */}
      <ThemeProvider theme={muiTheme}>
        <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
          <DialogTitle>Hapus Class</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Yakin mau menghapus class ini?
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

        {/* EDIT DIALOG */}
        <Dialog open={openEdit} onClose={() => setOpenEdit(false)}>
          <DialogTitle>Edit Class</DialogTitle>
          <DialogContent className="space-y-4">
            <input
              className="w-full rounded px-3 py-2 border"
              value={editClassName}
              onChange={(e) => setEditClassName(e.target.value)}
            />
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={editIsActive}
                onChange={(e) => setEditIsActive(e.target.checked)}
              />
              Active
            </label>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenEdit(false)}>Batal</Button>
            <Button variant="contained" onClick={handleConfirmEdit}>
              Simpan
            </Button>
          </DialogActions>
        </Dialog>
      </ThemeProvider>
    </div>
  );
}

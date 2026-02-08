import { useEffect, useMemo, useState } from "react";
import { Button as TailuxButton} from "components/ui";

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

export default function RoomPage() {
  // ======================
  // STATE
  // ======================
  const [roomName, setRoomName] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [rooms, setRooms] = useState([]);

  // DELETE
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  // EDIT
  const [openEdit, setOpenEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editRoomName, setEditRoomName] = useState("");
  const [editIsActive, setEditIsActive] = useState(true);

  // TOAST
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const muiTheme = useMuiTheme();

  // ======================
  // FETCH
  // ======================
  const fetchRooms = async () => {
    const token = localStorage.getItem("authToken");

    const res = await fetch(`${API_URL}/master/room`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      setToast({
        open: true,
        message: "Gagal mengambil data room",
        severity: "error",
      });
      return;
    }

    const json = await res.json();
    setRooms(json.data);
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  // ======================
  // CREATE
  // ======================
  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("authToken");

    const res = await fetch(`${API_URL}/master/room`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        roomnm: roomName,
        isactive: isActive,
      }),
    });

    if (!res.ok) {
      setToast({
        open: true,
        message: "Gagal menambahkan room",
        severity: "error",
      });
      return;
    }

    const json = await res.json();
    setRooms((prev) => [...prev, json.data]);
    setRoomName("");
    setIsActive(true);

    setToast({
      open: true,
      message: "Room berhasil ditambahkan",
      severity: "success",
    });
  };

  // ======================
  // EDIT
  // ======================
  const handleOpenEdit = (row) => {
    setEditId(row.roomid);
    setEditRoomName(row.roomnm);
    setEditIsActive(row.isactive);
    setOpenEdit(true);
  };

  const handleConfirmEdit = async () => {
    const token = localStorage.getItem("authToken");

    const res = await fetch(
      `${API_URL}/master/room/${editId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          roomnm: editRoomName,
          isactive: editIsActive,
        }),
      }
    );

    if (!res.ok) {
      setToast({
        open: true,
        message: "Gagal update room",
        severity: "error",
      });
      return;
    }

    setRooms((prev) =>
      prev.map((r) =>
        r.roomid === editId
          ? { ...r, roomnm: editRoomName, isactive: editIsActive }
          : r
      )
    );

    setOpenEdit(false);
    setToast({
      open: true,
      message: "Room berhasil diupdate",
      severity: "success",
    });
  };

  // ======================
  // DELETE
  // ======================
  const handleConfirmDelete = async () => {
    const token = localStorage.getItem("authToken");

    const res = await fetch(
      `${API_URL}/master/room/${selectedId}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!res.ok) {
      setToast({
        open: true,
        message: "Gagal menghapus room",
        severity: "error",
      });
      return;
    }

    setRooms((prev) =>
      prev.filter((r) => r.roomid !== selectedId)
    );

    setOpenDelete(false);
    setToast({
      open: true,
      message: "Room berhasil dihapus",
      severity: "success",
    });
  };

  // ======================
  // TABLE
  // ======================
  const columns = useMemo(
    () => [
      { header: "ID", accessorKey: "roomid" },
      { header: "Room Name", accessorKey: "roomnm" },
      {
        header: "Status",
        accessorKey: "isactive",
        cell: ({ getValue }) => (
          <span
            className={`
              px-2 py-0.5 rounded text-xs font-semibold
              ${
                getValue()
                  ? "bg-success/20 text-success"
                  : "bg-danger/20 text-danger"
              }
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
                setSelectedId(row.original.roomid);
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
    data: rooms,
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
          <h1 className="text-lg font-semibold">Room Management</h1>
          <p className="text-sm text-muted">
            Create and manage room
          </p>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="px-6 py-6 space-y-4 border-b border-divider"
        >
          <input
            className="
              w-full rounded-lg px-4 py-2 text-sm
              bg-card border border-divider
              text-foreground
            "
            placeholder="Room Name"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            required
          />

          {/* ACTIVE CARD */}
          <div
            onClick={() => setIsActive(!isActive)}
            className={`
              cursor-pointer transition
              flex items-center gap-3
              rounded-lg px-4 py-3 border
              ${
                isActive
                  ? "border-success/60 bg-success/10"
                  : "border-danger/60 bg-danger/10"
              }
            `}
          >
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="
                h-5 w-5 rounded
                text-success
                border border-divider
                focus:ring-2 focus:ring-success
              "
            />
            <div>
              <p className="text-sm font-semibold text-foreground">
                Active Room
              </p>
              <p className="text-xs text-muted">
                Room dapat digunakan dalam penjadwalan
              </p>
            </div>
          </div>

          <div className="flex justify-end">

                <TailuxButton
                    color="primary"
                  type="submit"
                >
                    + Add Bank
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

      {/* DELETE & EDIT & TOAST */}
      <ThemeProvider theme={muiTheme}>
        {/* DELETE */}
        <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
          <DialogTitle>Hapus Room</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Yakin mau menghapus room ini?
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
          <DialogTitle>Edit Room</DialogTitle>
          <DialogContent className="space-y-4">
            <input
              className="w-full rounded px-3 py-2 border"
              value={editRoomName}
              onChange={(e) => setEditRoomName(e.target.value)}
            />
            <div
              onClick={() => setEditIsActive(!editIsActive)}
              className={`
                cursor-pointer transition
                flex items-center gap-3
                rounded-lg px-4 py-3 border
                ${
                  editIsActive
                    ? "border-success/60 bg-success/10"
                    : "border-danger/60 bg-danger/10"
                }
              `}
            >
              <input
                type="checkbox"
                checked={editIsActive}
                onChange={(e) => setEditIsActive(e.target.checked)}
              />
              <span className="text-sm font-medium">
                Active Room
              </span>
            </div>
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
          <Alert
            severity={toast.severity}
            variant="filled"
            onClose={() => setToast({ ...toast, open: false })}
          >
            {toast.message}
          </Alert>
        </Snackbar>
      </ThemeProvider>
    </div>
  );
}
  
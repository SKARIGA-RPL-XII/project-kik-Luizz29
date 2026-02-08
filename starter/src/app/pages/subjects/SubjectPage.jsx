import { useEffect, useMemo, useState } from "react";
import { Button as TailuxButton } from "components/ui";
//MUI AREA //
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


const API_URL = "http://localhost:8081";

export default function UserPage() {
  // ======================
  // STATE
  // ======================
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [users, setUsers] = useState([]);

  //DELETE
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  //EDIT
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");

  //SELECT ROLE

  // ======================
  // MUI THEME (TAILUX AWARE)
  // ======================
  const muiTheme = useMuiTheme();

  // ======================
  // FETCH DATA
  // ======================
  const fetchUsers = async () => {
    const token = localStorage.getItem("authToken");
    console.log("TOKEN:", token);

    const res = await fetch(`${API_URL}/master/subject`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      console.error("Unauthorized");
      return;
    }

    const data = await res.json();
    setUsers(data);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ======================
  // CREATE USER
  // ======================
  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("authToken");

    const res = await fetch(`${API_URL}/master/subject`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        subject_nm: name,
        subject_code: subject,
        is_active: true,
      }),
    });

    if (!res.ok) {
      alert("Gagal menambahkan subject");
      return;
    }

    const result = await res.json();

    setUsers((prev) => [...prev, result.data]);

    setName("");
    setSubject("");
    setIsActive(true);
  };

  //EDIT
  const handleOpenEdit = (user) => {
    setSelectedUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setOpenEdit(true);
  };

  const handleCloseEdit = () => {
    setOpenEdit(false);
    setSelectedUser(null);
  };


  const handleOpenDelete = (id) => {
    setSelectedUserId(id);
    setOpenDelete(true);
  };

  const handleCloseDelete = () => {
    setOpenDelete(false);
    setSelectedUserId(null);
  };

  const handleConfirmDelete = async () => {
    if (!selectedUserId) return;

    const token = localStorage.getItem("authToken");

    const res = await fetch(`${API_URL}/master/subject/${selectedUserId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      console.error("Gagal hapus subject");
      return;
    }

    setUsers((prev) =>
      prev.filter((s) => s.subject_id !== selectedUserId)
    );

    handleCloseDelete();
  };



  const handleConfirmEdit = async () => {
    if (!selectedUser) return;

    await fetch(`${API_URL}/users/${selectedUser.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editName,
        email: editEmail,
      }),
    });

    setUsers((prev) =>
      prev.map((u) =>
        u.id === selectedUser.id
          ? { ...u, name: editName, email: editEmail }
          : u
      )
    );

    handleCloseEdit();
  };



  // ======================
  // TABLE COLUMNS
  // ======================
  const columns = useMemo(
    () => [
      {
        header: "ID",
        accessorKey: "subject_id",
      },
      {
        header: "Subject Name",
        accessorKey: "subject_name",
      },
      {
        header: "Code",
        accessorKey: "subject_code",
      },
      {
        header: "Status",
        accessorKey: "is_active",
        cell: ({ getValue }) => {
          const active = getValue();
          return (
            <span
              className={`
              px-2 py-0.5 rounded text-xs font-semibold
              ${active
                  ? "bg-success/20 text-success"
                  : "bg-danger/20 text-danger"}
            `}
            >
              {active ? "ACTIVE" : "INACTIVE"}
            </span>
          );
        },
      },
      {
        header: "Created Date",
        accessorKey: "created_date",
        cell: ({ getValue }) => {
          const value = getValue();
          if (!value || value.startsWith("0001")) return "-";
          return new Date(value).toLocaleDateString();
        },
      },
      {
        header: "Action",
        id: "actions",
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button
              variant="outlined"
              color="primary"
              startIcon={<EditIcon />}
              size="small"
              onClick={() => handleOpenEdit(row.original)}
            >
              Edit
            </Button>

            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              size="small"
              onClick={() => handleOpenDelete(row.original.subject_id)}
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
    data: users,
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
          <h1 className="text-lg font-semibold text-foreground">
            Subject Management
          </h1>
          <p className="text-sm text-muted">
            Create and manage subject
          </p>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="px-6 py-6 space-y-4 border-b border-divider"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              className="
                w-full rounded-lg px-4 py-2 text-sm
                bg-card
                border border-divider
                text-foreground
                placeholder-muted
                focus:outline-none focus:ring-2 focus:ring-primary/40
              "
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <input
              className="
                w-full rounded-lg px-4 py-2 text-sm
                bg-card
                border border-divider
                text-foreground
                placeholder-muted
                focus:outline-none focus:ring-2 focus:ring-primary/40
              "
              placeholder="Subject Code"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
            <div
              className={`
                flex items-center gap-3
                rounded-lg px-4 py-3
                border
                ${isActive
                  ? "border-primary/60 bg-primary/10"
                  : "border-warning/60 bg-warning/10"}
            `}
            >
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="
                h-5 w-5
                rounded
                border border-divider
                text-primary
                focus:ring-2 focus:ring-primary
                "
              />
              <label className="text-sm font-medium text-foreground">
                Active Subject
              </label>
            </div>



          </div>

          <div className="flex justify-end">
            <TailuxButton
                    color="primary"
                    type="submit"
                >
                    + Add Subject
                </TailuxButton>
          </div>
        </form>

        {/* TABLE */}
        <div className="px-6 py-4 overflow-x-auto">
          <table
            className="
              w-full text-sm
              bg-card
              border border-divider
              divide-x divide-divider
            "
          >
            <thead className="border-b border-divider">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-3 py-2 text-left font-medium text-foreground"
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>

            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="
                    border-b border-divider
                    hover:bg-hover
                    last:border-none
                  "
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-3 py-2 text-foreground"
                    >
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

          {/* PAGINATION */}
          <div className="flex items-center justify-between mt-4">
            <span className="text-sm text-muted">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </span>

            <div className="space-x-2">
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="
                  px-3 py-1 text-sm rounded
                  border border-divider
                  text-foreground
                  disabled:opacity-40
                "
              >
                Prev
              </button>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="
                  px-3 py-1 text-sm rounded
                  border border-divider
                  text-foreground
                  disabled:opacity-40
                "
              >
                Next
              </button>
            </div>
          </div>
        </div>
        <ThemeProvider theme={muiTheme}>
          <Dialog open={openDelete} onClose={handleCloseDelete}>
            <DialogTitle>Hapus User</DialogTitle>

            <DialogContent>
              <DialogContentText>
                Yakin mau menghapus user ini?
                Data yang sudah dihapus tidak bisa dikembalikan.
              </DialogContentText>
            </DialogContent>

            <DialogActions>
              <Button onClick={handleCloseDelete}>
                Batal
              </Button>
              <Button
                onClick={handleConfirmDelete}
                color="error"
                variant="contained"
              >
                Hapus
              </Button>
            </DialogActions>
          </Dialog>
        </ThemeProvider>

        <ThemeProvider theme={muiTheme}>
          <Dialog open={openEdit} onClose={handleCloseEdit}>
            <DialogTitle>Edit User</DialogTitle>

            <DialogContent className="space-y-4">
              <input
                className="
          w-full rounded-lg px-4 py-2 text-sm
          bg-card border border-divider
          text-foreground
          focus:outline-none focus:ring-2 focus:ring-primary/40
        "
                placeholder="Name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />

              <input
                type="email"
                className="
          w-full rounded-lg px-4 py-2 text-sm
          bg-card border border-divider
          text-foreground
          focus:outline-none focus:ring-2 focus:ring-primary/40
        "
                placeholder="Email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
              />
            </DialogContent>

            <DialogActions>
              <Button onClick={handleCloseEdit}>
                Batal
              </Button>
              <Button
                onClick={handleConfirmEdit}
                variant="contained"
              >
                Simpan
              </Button>
            </DialogActions>
          </Dialog>
        </ThemeProvider>


      </div>


    </div>

  );

}

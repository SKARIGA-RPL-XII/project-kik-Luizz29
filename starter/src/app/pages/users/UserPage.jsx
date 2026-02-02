import { useEffect, useMemo, useState } from "react";

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

import {
  Dialog as HeadlessDialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { Fragment } from "react";


import { useDisclosure } from "hooks";




const API_URL = "http://localhost:8081";

export default function UserPage() {
  // ======================
  // STATE
  // ======================
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
  const [roles, setRoles] = useState([]);
  const [roleId, setRoleId] = useState("");

  const [isSuccessOpen, { open: openSuccess, close: closeSuccess }] =
    useDisclosure(false);



  // ======================
  // MUI THEME (TAILUX AWARE)
  // ======================
  const muiTheme = useMuiTheme();


  // ======================
  // FETCH DATA
  // ======================
  const fetchUsers = async () => {
    const token = localStorage.getItem("authToken"); 

    console.log("TOKEN YANG DIKIRIM:", token); 

    const res = await fetch(`${API_URL}/users`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    console.log("Fetched users:", data);
    setUsers(data);
  };



  const fetchRoles = async () => {
    const token = localStorage.getItem("authToken");

    const res = await fetch(`${API_URL}/select/roles`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    console.log("ROLES:", data);
    setRoles(data);
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);



  // ======================
  // CREATE USER
  // ======================
  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("authToken");

    if (!token) {
      alert("Token tidak ditemukan, silakan login ulang");
      return;
    }

    await fetch(`${API_URL}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // 🔥 INI KUNCINYA
      },
      body: JSON.stringify({
        name,
        email,
        password,
        role_id: Number(roleId),
      }),
    });

    setName("");
    setEmail("");
    setPassword("");
    setRoleId("");
    fetchUsers();
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
    if (!token) {
      alert("Token tidak ditemukan, silakan login ulang");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/users/${selectedUserId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`, // 🔥 WAJIB
        },
      });

      if (!res.ok) throw new Error("Delete failed");

      // Update data table
      setUsers((prev) => prev.filter((u) => u.id !== selectedUserId));

      openSuccess();
      handleCloseDelete();
    } catch (error) {
      console.error(error);
      alert("Failed to delete data");
    }
  };



  const handleConfirmEdit = async () => {
    if (!selectedUser) return;

    const token = localStorage.getItem("authToken");
    if (!token) {
      alert("Token tidak ditemukan, silakan login ulang");
      return;
    }

    await fetch(`${API_URL}/users/${selectedUser.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // 🔥 WAJIB
      },
      body: JSON.stringify({
        name: editName,
        email: editEmail,
      }),
    });

    // Update state lokal (optimistic update)
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
        header: "Name",
        accessorKey: "name",
      },
      {
        header: "Email",
        accessorKey: "email",
      },
      {
        header: "Role",
        cell: ({ row }) => {
          const role = row.original.role;
          if (!role || typeof role !== 'object' || !('rolenm' in role)) {
            return "-";
          }
          return role.rolenm || "-";
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
              onClick={() => handleOpenDelete(row.original.id)}
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
      {/* CARD */}
      <div
        className="
          w-full max-w-full xl:max-w-6xl 2xl:max-w-7xl
          bg-background
          border border-divider
          rounded-xl shadow-sm
        "
      >
        {/* HEADER */}
        <div className="border-b border-divider px-6 py-4">
          <h1 className="text-lg font-semibold text-foreground">
            User Management
          </h1>
          <p className="text-sm text-muted">
            Create and manage users
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
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <input
              type="email"
              className="
                w-full rounded-lg px-4 py-2 text-sm
                bg-card
                border border-divider
                text-foreground
                placeholder-muted
                focus:outline-none focus:ring-2 focus:ring-primary/40
              "
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <select
              className="
    w-full rounded-lg px-4 py-2 text-sm
    bg-card
    border border-divider
    text-foreground
    focus:outline-none focus:ring-2 focus:ring-primary/40
  "
              value={roleId}
              onChange={(e) => setRoleId(Number(e.target.value))}
              required
            >
              <option value="" disabled>
                -- Pilih Role --
              </option>

              {roles.map((role) => (
                <option
                  key={role.roleid}
                  value={role.roleid}
                  className="bg-card text-foreground"
                >
                  {role.rolenm}
                </option>
              ))}

            </select>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="
                rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white
                hover:bg-primary/90 transition
              "
            >
              Save User
            </button>
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

      <Transition appear show={isSuccessOpen} as={Fragment}>
        <HeadlessDialog
          as="div"
          className="fixed inset-0 z-[100] flex items-center justify-center px-4"
          onClose={closeSuccess}
        >
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="absolute inset-0 bg-gray-900/50 dark:bg-black/40" />
          </TransitionChild>

          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <DialogPanel className="relative w-full max-w-md rounded-lg bg-white px-6 py-10 text-center dark:bg-dark-700">
              <CheckCircleIcon className="mx-auto size-24 text-success" />
              <h3 className="mt-4 text-2xl font-semibold text-gray-800 dark:text-dark-100">
                Delete Success
              </h3>
              <p className="mt-2 text-gray-600 dark:text-dark-300">
                Data berhasil dihapus.
              </p>
              <button
                onClick={closeSuccess}
                className="mt-6 rounded-lg bg-green-500 px-5 py-2 text-sm font-medium text-white hover:bg-green-600 transition"
              >
                Close
              </button>
            </DialogPanel>
          </TransitionChild>
        </HeadlessDialog>
      </Transition>

    </div>

  );

}

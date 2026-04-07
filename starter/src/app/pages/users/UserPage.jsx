import { useEffect, useMemo, useState } from "react";
import DarkSelect from "components/ui/DarkSelect";
import { Button as TailuxButton } from "components/ui";

//MUI AREA //



import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  getFilteredRowModel,
} from "@tanstack/react-table";

import { Modal, ModalHeader, ModalBody, ModalFooter } from "components/ui/Modal";



import { API_URL } from '../../../utils/config';
import { toast as toastSonner } from 'sonner';

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
    toastSonner.error("Token tidak ditemukan, silakan login ulang");
    return;
  }

  try {

    const res = await fetch(`${API_URL}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name,
        email,
        password,
        role_id: Number(roleId),
      }),
    });

    if (!res.ok) {
      toastSonner.error("Gagal menambahkan user");
      return;
    }

    const json = await res.json();

    // Update table realtime jika API return data
    if (json?.data) {
      setUsers((prev) => [...prev, json.data]);
    } else {
      fetchUsers();
    }

    // Reset form
    setName("");
    setEmail("");
    setPassword("");
    setRoleId("");

    toastSonner.success("User berhasil ditambahkan");

  } catch (err) {
    toastSonner.error("Terjadi kesalahan server: " + err.message);
  }
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
      toastSonner.error("Token tidak ditemukan, silakan login ulang");
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

      toastSonner.success("User berhasil dihapus");
      handleCloseDelete();
    } catch (error) {
      console.error(error);
      toastSonner.error("Failed to delete data");
    }
  };



  const handleConfirmEdit = async () => {
    if (!selectedUser) return;

    const token = localStorage.getItem("authToken");
    if (!token) {
      toastSonner.error("Token tidak ditemukan, silakan login ulang");
      return;
    }

    const res = await fetch(`${API_URL}/users/${selectedUser.id}`, {
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

    if (!res.ok) {
      toastSonner.error("Gagal update user");
      return;
    }

    // Update state lokal (optimistic update)
    setUsers((prev) =>
      prev.map((u) =>
        u.id === selectedUser.id
          ? { ...u, name: editName, email: editEmail }
          : u
      )
    );

    toastSonner.success("User berhasil diupdate");
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
        accessorFn: (row) => row.role?.rolenm || "-",
        id: "role",
        cell: ({ getValue }) => getValue(),
      },

      {
        header: "Action",
        id: "actions",
        cell: ({ row }) => (
          <div className="flex gap-2">
            <TailuxButton
              variant="outlined"
              color="primary"
              size="small"
              onClick={() => handleOpenEdit(row.original)}
            >
              Edit
            </TailuxButton>

            <TailuxButton
              variant="outlined"
              color="error"
              onClick={() => handleOpenDelete(row.original.id)}
            >
              Delete
            </TailuxButton>
          </div>
        ),
      },
    ],
    []
  );

  const [globalFilter, setGlobalFilter] = useState("");

  const table = useReactTable({
    data: users,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  // ======================
  // UI
  // ======================
  return (
    <div className="p-6 md:p-8">
      {/* CARD */}
      <div className="bg-background border border-divider rounded-xl">
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
            <DarkSelect
              label="Role"
              placeholder="-- Pilih Role --"
              value={roleId || null}
              options={roles.map((role) => ({
                value: role.roleid,
                label: role.rolenm,
              }))}
              onChange={(val) => setRoleId(Number(val))}
            />

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

        <div className="px-6 pt-4 pb-2 flex justify-between items-center">
          <input
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search..."
            className="w-64 rounded-lg px-4 py-2 text-sm bg-card border border-divider text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

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
        <Modal open={openDelete} onClose={handleCloseDelete}>
          <ModalHeader>Hapus User</ModalHeader>

          <ModalBody>
            Yakin mau menghapus user ini?
            Data yang sudah dihapus tidak bisa dikembalikan.
          </ModalBody>

          <ModalFooter>
            <TailuxButton onClick={handleCloseDelete} variant="outlined">
              Batal
            </TailuxButton>
            <TailuxButton
              onClick={handleConfirmDelete}
              color="error"
            >
              Hapus
            </TailuxButton>
          </ModalFooter>
        </Modal>

        <Modal open={openEdit} onClose={handleCloseEdit}>
          <ModalHeader>Edit User</ModalHeader>

          <ModalBody className="space-y-4">
            <input
              className="w-full rounded-lg px-4 py-2 text-sm bg-card border border-divider text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="Name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />

            <input
              type="email"
              className="w-full rounded-lg px-4 py-2 text-sm bg-card border border-divider text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="Email"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
            />
          </ModalBody>

          <ModalFooter>
            <TailuxButton onClick={handleCloseEdit} variant="outlined">
              Batal
            </TailuxButton>
            <TailuxButton onClick={handleConfirmEdit} color="primary">
              Simpan
            </TailuxButton>
          </ModalFooter>
        </Modal>




      </div>



    </div>

  );

}

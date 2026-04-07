import { useEffect, useMemo, useState } from "react";
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
import { toast } from 'sonner';

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
      toast.error("Gagal menambahkan subject");
      return;
    }

    const result = await res.json();

    setUsers((prev) => [...prev, result.data]);

    toast.success("Subject berhasil ditambahkan");
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
      toast.error("Gagal hapus subject");
      return;
    }

    setUsers((prev) =>
      prev.filter((s) => s.subject_id !== selectedUserId)
    );

    toast.success("Subject berhasil dihapus");
    handleCloseDelete();
  };



  const handleConfirmEdit = async () => {
    if (!selectedUser) return;

    const res = await fetch(`${API_URL}/users/${selectedUser.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editName,
        email: editEmail,
      }),
    });

    if (!res.ok) {
      toast.error("Gagal update subject");
      return;
    }

    setUsers((prev) =>
      prev.map((u) =>
        u.id === selectedUser.id
          ? { ...u, name: editName, email: editEmail }
          : u
      )
    );

    toast.success("Subject berhasil diupdate");
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
        accessorFn: (row) => (row.is_active ? "ACTIVE" : "INACTIVE"),
        id: "status",
        cell: ({ getValue }) => {
          return (
            <span
              className={`
              px-2 py-0.5 rounded text-xs font-semibold
              ${getValue() === "ACTIVE"
                  ? "bg-success/20 text-success"
                  : "bg-danger/20 text-danger"}
            `}
            >
              {getValue()}
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
              size="small"
              onClick={() => handleOpenDelete(row.original.subject_id)}
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
            <TailuxButton
              onClick={handleConfirmEdit}
              color="primary"
            >
              Simpan
            </TailuxButton>
          </ModalFooter>
        </Modal>


      </div>


    </div>

  );

}

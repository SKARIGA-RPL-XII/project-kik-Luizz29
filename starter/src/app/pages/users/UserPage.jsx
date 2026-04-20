import { useEffect, useMemo, useState, useCallback } from "react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import DarkSelect from "components/ui/DarkSelect";
import { 
  Button as TailuxButton, 
  Card, 
  Badge,
  Modal, 
  ModalHeader, 
  ModalBody, 
  ModalFooter 
} from "components/ui";
import { 
  UsersIcon, 
  PlusIcon, 
  MagnifyingGlassIcon,
  TrashIcon,
  PencilSquareIcon,
  ShieldCheckIcon,
  EnvelopeIcon,
  UserCircleIcon,
  KeyIcon,
  IdentificationIcon
} from "@heroicons/react/24/outline";

import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  getFilteredRowModel,
} from "@tanstack/react-table";

import { API_URL } from '../../../utils/config';
import { toast as toastSonner } from 'sonner';
import { ConfirmModal } from "components/shared/ConfirmModal";

export default function UserPage() {
  const [parent] = useAutoAnimate();

  // ======================
  // STATE
  // ======================
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [roleId, setRoleId] = useState("");

  const [openAdd, setOpenAdd] = useState(false);
  const [openConfirmAdd, setOpenConfirmAdd] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  const [openEdit, setOpenEdit] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRoleId, setEditRoleId] = useState("");

  const [globalFilter, setGlobalFilter] = useState("");

  const token = localStorage.getItem("authToken");

  // ======================
  // FETCH DATA
  // ======================
  const fetchUsers = useCallback(async () => {
    const res = await fetch(`${API_URL}/users`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) return;
    const data = await res.json();
    setUsers(data || []);
  }, [token]);

  const fetchRoles = useCallback(async () => {
    const res = await fetch(`${API_URL}/select/roles`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) return;
    const data = await res.json();
    setRoles(data || []);
  }, [token]);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, [fetchUsers, fetchRoles]);

  // ======================
  // CREATE USER
  // ======================
  const handleSubmit = (e) => {
    e.preventDefault();
    setOpenConfirmAdd(true);
  };

  const handleConfirmAdd = async () => {
    setIsAdding(true);
    if (!token) {
      toastSonner.error("Session expired, please login again");
      setIsAdding(false);
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
      if (json?.data) {
        setUsers((prev) => [...prev, json.data]);
      } else {
        fetchUsers();
      }

      setName("");
      setEmail("");
      setPassword("");
      setRoleId("");
      setOpenAdd(false);
      setOpenConfirmAdd(false);
      toastSonner.success("User berhasil ditambahkan");
    } catch (err) {
      toastSonner.error("Server error: " + err.message);
    } finally {
      setIsAdding(false);
    }
  };

  // EDIT
  const handleOpenEdit = (user) => {
    setSelectedUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditRoleId(user.role?.roleid || "");
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

    try {
      const res = await fetch(`${API_URL}/users/${selectedUserId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Delete failed");

      setUsers((prev) => prev.filter((u) => u.id !== selectedUserId));
      toastSonner.success("User berhasil dihapus");
      handleCloseDelete();
    } catch {
      toastSonner.error("Failed to delete user");
    }
  };

  const handleConfirmEdit = async () => {
    if (!selectedUser) return;

    const res = await fetch(`${API_URL}/users/${selectedUser.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: editName,
        email: editEmail,
        role_id: Number(editRoleId),
      }),
    });

    if (!res.ok) {
      toastSonner.error("Gagal update user");
      return;
    }

    // Refresh data to get proper role object
    fetchUsers();
    toastSonner.success("User berhasil diupdate");
    handleCloseEdit();
  };

  // ======================
  // TABLE COLUMNS
  // ======================
  const columns = useMemo(() => [
    {
      header: "User Information",
      accessorKey: "name",
      cell: ({ row, getValue }) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20">
            {getValue().charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-foreground">{getValue()}</p>
            <div className="flex items-center gap-1.5 text-[11px] text-muted">
              <EnvelopeIcon className="h-3 w-3" />
              {row.original.email}
            </div>
          </div>
        </div>
      )
    },
    {
      header: "Security Role",
      accessorFn: (row) => row.role?.rolenm || "No Role",
      id: "role",
      cell: ({ getValue }) => (
        <Badge variant="flat" className="bg-primary/5 text-primary border border-primary/10 px-2.5 py-1 rounded-lg">
          <ShieldCheckIcon className="h-3.5 w-3.5 mr-1.5" />
          {getValue()}
        </Badge>
      ),
    },
    {
      header: "Account Status",
      id: "status",
      cell: () => (
        <Badge variant="success" size="sm">Active</Badge>
      )
    },
    {
      header: "Action",
      id: "actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <TailuxButton
            variant="outlined"
            size="small"
            className="px-2 min-w-0"
            onClick={() => handleOpenEdit(row.original)}
          >
            <PencilSquareIcon className="h-4 w-4" />
          </TailuxButton>
          <TailuxButton
            variant="outlined"
            color="error"
            size="small"
            className="px-2 min-w-0"
            onClick={() => handleOpenDelete(row.original.id)}
          >
            <TrashIcon className="h-4 w-4" />
          </TailuxButton>
        </div>
      ),
    },
  ], []);

  const table = useReactTable({
    data: users,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const stats = [
    { label: "Total Accounts", value: users.length, icon: UsersIcon, color: "text-primary", bg: "bg-primary/10" },
    { label: "Admin Access", value: users.filter(u => u.role?.rolenm?.toLowerCase().includes('admin')).length, icon: ShieldCheckIcon, color: "text-purple-500", bg: "bg-purple-500/10" },
    { label: "Staff", value: users.filter(u => !u.role?.rolenm?.toLowerCase().includes('admin')).length, icon: UserCircleIcon, color: "text-blue-500", bg: "bg-blue-500/10" },
  ];

  // ======================
  // UI
  // ======================
  return (
    <div className="p-6 md:p-10 space-y-8 max-w-screen-2xl mx-auto">
      {/* HERO SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">User Management</h1>
          <p className="text-muted mt-1 text-lg">Kelola akses administratif dan peran pengguna sistem.</p>
        </div>
        <TailuxButton
          color="primary"
          onClick={() => setOpenAdd(true)}
          className="h-12 px-6 text-base shadow-lg shadow-primary/20"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Register Admin User
        </TailuxButton>
      </div>

      {/* STATS HIGHLIGHTS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="p-6 flex items-center gap-5 border-none shadow-sm bg-card/50 backdrop-blur-sm">
            <div className={`p-3 rounded-2xl ${stat.bg}`}>
              <stat.icon className={`h-7 w-7 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-muted uppercase tracking-wider">{stat.label}</p>
              <h3 className="text-2xl font-bold text-foreground mt-0.5">{stat.value}</h3>
            </div>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden border-none shadow-xl bg-card/80 backdrop-blur-md">
        {/* ACTION BAR */}
        <div className="p-6 border-b border-divider flex flex-col sm:flex-row justify-between items-center gap-4 bg-card/30">
          <div className="relative w-full sm:w-96">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted" />
            <input
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Search users..."
              className="w-full rounded-xl pl-10 pr-4 py-2.5 text-sm bg-background/50 border border-divider focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
            />
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id} className="bg-muted/30">
                  {hg.headers.map((h) => (
                    <th key={h.id} className="px-6 py-4 text-xs font-bold text-muted uppercase tracking-widest border-b border-divider">
                      {flexRender(h.column.columnDef.header, h.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody ref={parent}>
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="group hover:bg-primary/5 transition-colors border-b border-divider/50 last:border-0">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-6 py-5 text-sm">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-20 text-center text-muted italic">
                    No users found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="p-4 border-t border-divider flex items-center justify-between bg-card/30 text-xs font-medium text-muted">
          <div>Showing {table.getRowModel().rows.length} of {users.length} accounts</div>
          <div className="flex gap-1">
            <TailuxButton 
              size="small" 
              variant="outlined" 
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="rounded-lg h-8 min-w-0 px-3"
            >
              Prev
            </TailuxButton>
            <TailuxButton 
              size="small" 
              variant="outlined"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="rounded-lg h-8 min-w-0 px-3"
            >
              Next
            </TailuxButton>
          </div>
        </div>
      </Card>

      {/* MODALS */}
      
      {/* ADD MODAL */}
      <Modal open={openAdd} onClose={() => setOpenAdd(false)}>
        <form onSubmit={handleSubmit}>
          <ModalHeader className="text-xl font-bold">Register Admin User</ModalHeader>
          <ModalBody className="space-y-5 pt-4">
            <div className="grid grid-cols-1 gap-5">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-foreground">
                  <UserCircleIcon className="h-4 w-4" /> Full Name
                </label>
                <input
                  className="w-full rounded-xl px-4 py-3 bg-background border border-divider focus:ring-2 focus:ring-primary/40 outline-none transition-all"
                  placeholder="e.g. Administrator"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-foreground">
                  <EnvelopeIcon className="h-4 w-4" /> Email Address
                </label>
                <input
                  type="email"
                  className="w-full rounded-xl px-4 py-3 bg-background border border-divider focus:ring-2 focus:ring-primary/40 outline-none transition-all"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-foreground">
                  <KeyIcon className="h-4 w-4" /> Account Password
                </label>
                <input
                  type="password"
                  className="w-full rounded-xl px-4 py-3 bg-background border border-divider focus:ring-2 focus:ring-primary/40 outline-none transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <IdentificationIcon className="h-4 w-4" /> Security Role
                </label>
                <DarkSelect
                  placeholder="Select access level..."
                  value={roleId || null}
                  options={roles.map((role) => ({
                    value: role.roleid,
                    label: role.rolenm,
                  }))}
                  onChange={(val) => setRoleId(val)}
                />
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <TailuxButton onClick={() => setOpenAdd(false)} variant="outlined" className="rounded-xl">Cancel</TailuxButton>
            <TailuxButton color="primary" type="submit" className="rounded-xl px-8 shadow-lg shadow-primary/30">Create Account</TailuxButton>
          </ModalFooter>
        </form>
      </Modal>

      {/* EDIT MODAL */}
      <Modal open={openEdit} onClose={handleCloseEdit}>
        <ModalHeader className="text-xl font-bold">Edit User Privileges</ModalHeader>
        <ModalBody className="space-y-5 pt-4">
          <div className="grid grid-cols-1 gap-5">
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-foreground">
                <UserCircleIcon className="h-4 w-4" /> Full Name
              </label>
              <input
                className="w-full rounded-xl px-4 py-3 bg-background border border-divider focus:ring-2 focus:ring-primary/40 outline-none transition-all"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-foreground">
                <EnvelopeIcon className="h-4 w-4" /> Email Address
              </label>
              <input
                type="email"
                className="w-full rounded-xl px-4 py-3 bg-background border border-divider focus:ring-2 focus:ring-primary/40 outline-none transition-all"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <IdentificationIcon className="h-4 w-4" /> Security Role
              </label>
              <DarkSelect
                placeholder="Modify role..."
                value={editRoleId || null}
                options={roles.map((role) => ({
                  value: role.roleid,
                  label: role.rolenm,
                }))}
                onChange={(val) => setEditRoleId(val)}
              />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <TailuxButton onClick={handleCloseEdit} variant="outlined" className="rounded-xl">Cancel</TailuxButton>
          <TailuxButton color="primary" onClick={handleConfirmEdit} className="rounded-xl px-8 shadow-lg shadow-primary/30">Apply Updates</TailuxButton>
        </ModalFooter>
      </Modal>

      {/* DELETE MODAL */}
      <Modal open={openDelete} onClose={handleCloseDelete}>
        <ModalHeader className="text-xl font-bold text-danger">Revoke Account Access</ModalHeader>
        <ModalBody className="text-center py-6">
          <div className="p-4 bg-danger/10 rounded-full w-fit mx-auto mb-4">
            <TrashIcon className="h-12 w-12 text-danger" />
          </div>
          <h3 className="text-lg font-bold">Terminate user session?</h3>
          <p className="text-muted mt-2">
            This will permanently remove the user from the system. They will lose all access immediately.
          </p>
        </ModalBody>
        <ModalFooter>
          <TailuxButton onClick={handleCloseDelete} variant="outlined" className="rounded-xl">Keep User</TailuxButton>
          <TailuxButton color="error" onClick={handleConfirmDelete} className="rounded-xl shadow-lg shadow-danger/20">Yes, Revoke</TailuxButton>
        </ModalFooter>
      </Modal>

      <ConfirmModal
        show={openConfirmAdd}
        onClose={() => setOpenConfirmAdd(false)}
        onOk={handleConfirmAdd}
        confirmLoading={isAdding}
        state="pending"
        messages={{
          pending: {
            title: "Daftarkan User?",
            description: "Apakah Anda yakin ingin mendaftarkan pengguna baru ini ke sistem?",
            actionText: "Ya, Daftarkan",
          },
        }}
      />
    </div>
  );
}

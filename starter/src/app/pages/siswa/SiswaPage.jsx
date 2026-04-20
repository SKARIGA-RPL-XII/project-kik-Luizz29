import { useEffect, useMemo, useState, useCallback } from "react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import DarkSelect from "components/ui/DarkSelect";
import { 
  Button as TailuxButton, 
  Card, 
  Avatar, 
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
  CheckBadgeIcon,
  XCircleIcon
} from "@heroicons/react/24/outline";

import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  getFilteredRowModel,
} from "@tanstack/react-table";

import { API_URL } from '../../../utils/config';
import { toast } from 'sonner';
import { ConfirmModal } from "components/shared/ConfirmModal";



export default function SiswaPage() {
  const [parent] = useAutoAnimate();
  
  // ======================
  // STATE
  // ======================
  const [users, setUsers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [siswas, setSiswas] = useState([]);

  const [userId, setUserId] = useState("");
  const [classId, setClassId] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [openAdd, setOpenAdd] = useState(false);
  const [openConfirmAdd, setOpenConfirmAdd] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const [openEdit, setOpenEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editClassId, setEditClassId] = useState("");
  const [editIsActive, setEditIsActive] = useState(true);

  const [globalFilter, setGlobalFilter] = useState("");

  const token = localStorage.getItem("authToken");

  // ======================
  // FETCH
  // ======================
  const fetchUsers = useCallback(() => {
    fetch(`${API_URL}/select/users?role=Siswa`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((j) => setUsers(j.data || []));
  }, [token]);

  const fetchClasses = useCallback(() => {
    fetch(`${API_URL}/select/classes`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((j) => setClasses(j.data || []));
  }, [token]);

  const fetchSiswas = useCallback(() => {
    fetch(`${API_URL}/master/siswa`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((j) => setSiswas(j.data || []));
  }, [token]);

  useEffect(() => {
    fetchUsers();
    fetchClasses();
    fetchSiswas();
  }, [fetchUsers, fetchClasses, fetchSiswas]);

  // ======================
  // CREATE
  // ======================
  const handleSubmit = (e) => {
    e.preventDefault();
    setOpenConfirmAdd(true);
  };

  const handleConfirmAdd = async () => {
    setIsAdding(true);
    try {
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
        toast.error("Gagal menambahkan siswa");
        return;
      }

      const json = await res.json();
      setSiswas((prev) => [...prev, json.data]);

      setUserId("");
      setClassId("");
      setIsActive(true);
      setOpenAdd(false);
      setOpenConfirmAdd(false);

      toast.success("Siswa berhasil ditambahkan");
    } catch {
      toast.error("Terjadi kesalahan sistem");
    } finally {
      setIsAdding(false);
    }
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
      toast.error("Gagal update siswa");
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
    toast.success("Siswa berhasil diupdate");
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
      toast.error("Gagal menghapus siswa");
      return;
    }

    setSiswas((prev) => prev.filter((s) => s.siswaid !== selectedId));
    setOpenDelete(false);
    toast.success("Siswa berhasil dihapus");
  };

  // ======================
  // TABLE
  // ======================
  const columns = useMemo(
    () => [
      { 
        header: "Siswa", 
        accessorFn: (row) => users.find((u) => u.userid === row.userid)?.username || "-",
        id: "username",
        cell: ({ row, getValue }) => (
          <div className="flex items-center gap-3">
            <Avatar name={getValue()} size="xs" />
            <div>
              <p className="font-medium text-foreground">{getValue()}</p>
              <p className="text-[10px] text-muted uppercase">ID: {row.original.siswaid}</p>
            </div>
          </div>
        )
      },
      {
        header: "Class",
        accessorFn: (row) => classes.find((c) => c.classid === row.classid)?.classnm || "-",
        id: "classnm",
        cell: ({ getValue }) => (
          <Badge variant="info" size="sm" className="font-medium">
            {getValue()}
          </Badge>
        )
      },
      {
        header: "Status",
        accessorFn: (row) => (row.isactive ? "ACTIVE" : "INACTIVE"),
        id: "status",
        cell: ({ getValue }) => (
          <div className="flex items-center gap-1.5">
            {getValue() === "ACTIVE" ? (
              <CheckBadgeIcon className="h-4 w-4 text-success" />
            ) : (
              <XCircleIcon className="h-4 w-4 text-danger" />
            )}
            <span className={`text-xs font-semibold ${getValue() === "ACTIVE" ? "text-success" : "text-danger"}`}>
              {getValue()}
            </span>
          </div>
        ),
      },
      {
        header: "Action",
        cell: ({ row }) => (
          <div className="flex gap-2">
            <TailuxButton
              size="small"
              variant="outlined"
              className="px-2 min-w-0"
              onClick={() => {
                setEditId(row.original.siswaid);
                setEditClassId(row.original.classid);
                setEditIsActive(row.original.isactive);
                setOpenEdit(true);
              }}
            >
              <PencilSquareIcon className="h-4 w-4" />
            </TailuxButton>
            <TailuxButton
              size="small"
              variant="outlined"
              color="error"
              className="px-2 min-w-0"
              onClick={() => {
                setSelectedId(row.original.siswaid);
                setOpenDelete(true);
              }}
            >
              <TrashIcon className="h-4 w-4" />
            </TailuxButton>
          </div>
        ),
      },
    ],
    [users, classes]
  );

  const table = useReactTable({
    data: siswas,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const stats = [
    { label: "Total Siswa", value: siswas.length, icon: UsersIcon, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Active", value: siswas.filter(s => s.isactive).length, icon: CheckBadgeIcon, color: "text-success", bg: "bg-success/10" },
    { label: "Inactive", value: siswas.filter(s => !s.isactive).length, icon: XCircleIcon, color: "text-danger", bg: "bg-danger/10" },
  ];

  // ======================
  // UI
  // ======================
  return (
    <div className="p-6 md:p-10 space-y-8 max-w-screen-2xl mx-auto">
      {/* HERO SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Siswa Management</h1>
          <p className="text-muted mt-1 text-lg">Kelola database siswa, penempatan kelas, dan status kehadiran.</p>
        </div>
        <TailuxButton
          color="primary"
          onClick={() => setOpenAdd(true)}
          className="h-12 px-6 text-base shadow-lg shadow-primary/20"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add New Siswa
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
              placeholder="Search by name, ID, or class..."
              className="w-full rounded-xl pl-10 pr-4 py-2.5 text-sm bg-background/50 border border-divider focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
            />
          </div>
          <div className="flex gap-2">
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
                  <td colSpan={columns.length} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center">
                      <div className="p-4 bg-muted/20 rounded-full mb-4">
                        <MagnifyingGlassIcon className="h-10 w-10 text-muted" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground">No data found</h3>
                      <p className="text-muted max-w-xs mx-auto mt-1">
                        Try adjusting your search or filters to find what you&apos;re looking for.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="p-4 border-t border-divider flex items-center justify-between bg-card/30">
          <div className="text-xs text-muted font-medium">
            Showing {table.getRowModel().rows.length} of {siswas.length} entries
          </div>
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
          <ModalHeader className="text-xl font-bold">Add New Siswa</ModalHeader>
          <ModalBody className="space-y-6 pt-4">
            <DarkSelect
              label="Select User Account"
              placeholder="-- Choose User --"
              value={userId}
              options={users.map((u) => ({ value: u.userid, label: u.username }))}
              onChange={setUserId}
            />
            <DarkSelect
              label="Assign to Class"
              placeholder="-- Choose Class --"
              value={classId}
              options={classes.map((c) => ({ value: c.classid, label: c.classnm }))}
              onChange={setClassId}
            />
            <div 
              onClick={() => setIsActive(!isActive)}
              className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer ${isActive ? 'border-success/40 bg-success/5' : 'border-divider bg-muted/5'}`}
            >
              <div className={`p-2 rounded-lg ${isActive ? 'bg-success text-white' : 'bg-muted text-muted-foreground'}`}>
                {isActive ? <CheckBadgeIcon className="h-5 w-5" /> : <XCircleIcon className="h-5 w-5" />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold">Account Active</p>
                <p className="text-xs text-muted">Allow student to join exams</p>
              </div>
              <input type="checkbox" checked={isActive} readOnly className="h-5 w-5 rounded-full text-success border-divider" />
            </div>
          </ModalBody>
          <ModalFooter>
            <TailuxButton onClick={() => setOpenAdd(false)} variant="outlined" className="rounded-xl">Cancel</TailuxButton>
            <TailuxButton color="primary" type="submit" className="rounded-xl px-8 shadow-lg shadow-primary/30">Add Siswa</TailuxButton>
          </ModalFooter>
        </form>
      </Modal>

      {/* EDIT MODAL */}
      <Modal open={openEdit} onClose={() => setOpenEdit(false)}>
        <ModalHeader className="text-xl font-bold">Edit Siswa Details</ModalHeader>
        <ModalBody className="space-y-6 pt-4">
          <DarkSelect
            label="Class"
            value={editClassId}
            options={classes.map((c) => ({ value: c.classid, label: c.classnm }))}
            onChange={setEditClassId}
          />
          <div 
            onClick={() => setEditIsActive(!editIsActive)}
            className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer ${editIsActive ? 'border-success/40 bg-success/5' : 'border-divider bg-muted/5'}`}
          >
            <div className={`p-2 rounded-lg ${editIsActive ? 'bg-success text-white' : 'bg-muted text-muted-foreground'}`}>
              {editIsActive ? <CheckBadgeIcon className="h-5 w-5" /> : <XCircleIcon className="h-5 w-5" />}
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold">Account Active</p>
              <p className="text-xs text-muted">Current status of this student</p>
            </div>
            <input type="checkbox" checked={editIsActive} readOnly className="h-5 w-5 rounded-full text-success border-divider" />
          </div>
        </ModalBody>
        <ModalFooter>
          <TailuxButton onClick={() => setOpenEdit(false)} variant="outlined" className="rounded-xl">Cancel</TailuxButton>
          <TailuxButton color="primary" onClick={handleConfirmEdit} className="rounded-xl px-8 shadow-lg shadow-primary/30">Save Changes</TailuxButton>
        </ModalFooter>
      </Modal>

      {/* DELETE MODAL */}
      <Modal open={openDelete} onClose={() => setOpenDelete(false)}>
        <ModalHeader className="text-xl font-bold text-danger">Confirm Deletion</ModalHeader>
        <ModalBody className="text-center py-6">
          <div className="p-4 bg-danger/10 rounded-full w-fit mx-auto mb-4">
            <TrashIcon className="h-12 w-12 text-danger" />
          </div>
          <h3 className="text-lg font-bold">Are you absolutely sure?</h3>
          <p className="text-muted mt-2">
            This action cannot be undone. This will permanently remove the student record from the system.
          </p>
        </ModalBody>
        <ModalFooter>
          <TailuxButton onClick={() => setOpenDelete(false)} variant="outlined" className="rounded-xl">Keep Student</TailuxButton>
          <TailuxButton color="error" onClick={handleConfirmDelete} className="rounded-xl shadow-lg shadow-danger/20">Yes, Delete</TailuxButton>
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
            title: "Tambahkan Siswa?",
            description: "Apakah Anda yakin ingin menambahkan data siswa baru ini ke sistem?",
            actionText: "Ya, Tambahkan",
          },
        }}
      />
    </div>
  );
}

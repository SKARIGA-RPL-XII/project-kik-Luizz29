import { useEffect, useMemo, useState, useCallback } from "react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
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
  RectangleStackIcon, 
  PlusIcon, 
  MagnifyingGlassIcon,
  TrashIcon,
  PencilSquareIcon,
  CheckBadgeIcon,
  XCircleIcon,
  CalendarIcon
} from "@heroicons/react/24/outline";

import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  getFilteredRowModel,
} from "@tanstack/react-table";

import { toast } from "sonner";
import { API_URL } from '../../../utils/config';
import { ConfirmModal } from "components/shared/ConfirmModal";

export default function ClassPage() {
  const [parent] = useAutoAnimate();
  
  // ======================
  // STATE
  // ======================
  const [className, setClassName] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [classes, setClasses] = useState([]);

  const [openAdd, setOpenAdd] = useState(false);
  const [openConfirmAdd, setOpenConfirmAdd] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const [openEdit, setOpenEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editClassName, setEditClassName] = useState("");
  const [editIsActive, setEditIsActive] = useState(true);

  const [globalFilter, setGlobalFilter] = useState("");

  const token = localStorage.getItem("authToken");

  // ======================
  // FETCH CLASS
  // ======================
  const fetchClasses = useCallback(async () => {
    const res = await fetch(`${API_URL}/master/class`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) return;

    const json = await res.json();
    setClasses(json.data || []);
  }, [token]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  // ======================
  // CREATE CLASS
  // ======================
  const handleSubmit = (e) => {
    e.preventDefault();
    setOpenConfirmAdd(true);
  };

  const handleConfirmAdd = async () => {
    setIsAdding(true);
    try {
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
        toast.error("Gagal menambahkan class");
        return;
      }

      const json = await res.json();
      setClasses((prev) => [...prev, json.data]);

      setClassName("");
      setIsActive(true);
      setOpenAdd(false);
      setOpenConfirmAdd(false);
      toast.success("Class berhasil ditambahkan");
    } catch {
      toast.error("Terjadi kesalahan sistem");
    } finally {
      setIsAdding(false);
    }
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
    const res = await fetch(`${API_URL}/master/class/${editId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        classnm: editClassName,
        isactive: editIsActive,
      }),
    });

    if (!res.ok) {
      toast.error("Gagal update class");
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
    toast.success("Class berhasil diupdate");
  };

  // ======================
  // DELETE
  // ======================
  const handleConfirmDelete = async () => {
    try {
      const res = await fetch(`${API_URL}/master/class/${selectedId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.message || "Gagal menghapus class");
        return;
      }

      setClasses((prev) => prev.filter((c) => c.classid !== selectedId));
      setOpenDelete(false);
      toast.success("Class berhasil dihapus");
    } catch {
      toast.error("Terjadi kesalahan saat menghapus class");
    }
  };

  // ======================
  // TABLE
  // ======================
  const columns = useMemo(() => [
    { 
      header: "Class Name", 
      accessorKey: "classnm",
      cell: ({ row, getValue }) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
            {getValue().charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-foreground">{getValue()}</p>
            <p className="text-[10px] text-muted uppercase">ID: {row.original.classid}</p>
          </div>
        </div>
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
          <Badge variant={getValue() === "ACTIVE" ? "success" : "danger"} size="sm">
            {getValue()}
          </Badge>
        </div>
      ),
    },
    {
      header: "Created Date",
      accessorKey: "createddate",
      cell: ({ getValue }) => (
        <div className="flex items-center gap-2 text-muted text-xs">
          <CalendarIcon className="h-3.5 w-3.5" />
          {getValue() ? new Date(getValue()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : "-"}
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
            onClick={() => handleOpenEdit(row.original)}
          >
            <PencilSquareIcon className="h-4 w-4" />
          </TailuxButton>
          <TailuxButton
            size="small"
            variant="outlined"
            color="error"
            className="px-2 min-w-0"
            onClick={() => {
              setSelectedId(row.original.classid);
              setOpenDelete(true);
            }}
          >
            <TrashIcon className="h-4 w-4" />
          </TailuxButton>
        </div>
      ),
    },
  ], []);

  const table = useReactTable({
    data: classes,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const stats = [
    { label: "Total Classes", value: classes.length, icon: RectangleStackIcon, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Active Groups", value: classes.filter(c => c.isactive).length, icon: CheckBadgeIcon, color: "text-success", bg: "bg-success/10" },
    { label: "Disabled", value: classes.filter(c => !c.isactive).length, icon: XCircleIcon, color: "text-danger", bg: "bg-danger/10" },
  ];

  // ======================
  // UI
  // ======================
  return (
    <div className="p-6 md:p-10 space-y-8 max-w-screen-2xl mx-auto">
      {/* HERO SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Class Management</h1>
          <p className="text-muted mt-1 text-lg">Definisikan dan kelola pengelompokan kelas untuk siswa dan ujian.</p>
        </div>
        <TailuxButton
          color="primary"
          onClick={() => setOpenAdd(true)}
          className="h-12 px-6 text-base shadow-lg shadow-primary/20"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Create New Class
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
              placeholder="Search classes..."
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
                    No classes found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="p-4 border-t border-divider flex items-center justify-between bg-card/30 text-xs font-medium text-muted">
          <div>Showing {table.getRowModel().rows.length} of {classes.length} entries</div>
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
          <ModalHeader className="text-xl font-bold">New Class Group</ModalHeader>
          <ModalBody className="space-y-6 pt-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Class Name</label>
              <input
                className="w-full rounded-xl px-4 py-3 bg-background border border-divider focus:ring-2 focus:ring-primary/40 outline-none transition-all"
                placeholder="e.g. XII RPL 1"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                required
              />
            </div>
            <div 
              onClick={() => setIsActive(!isActive)}
              className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer ${isActive ? 'border-success/40 bg-success/5' : 'border-divider bg-muted/5'}`}
            >
              <div className={`p-2 rounded-lg ${isActive ? 'bg-success text-white' : 'bg-muted text-muted-foreground'}`}>
                {isActive ? <CheckBadgeIcon className="h-5 w-5" /> : <XCircleIcon className="h-5 w-5" />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold">Status: {isActive ? 'Active' : 'Disabled'}</p>
                <p className="text-xs text-muted">Active classes can be assigned to students and exams</p>
              </div>
              <input type="checkbox" checked={isActive} readOnly className="h-5 w-5 rounded-full text-success border-divider" />
            </div>
          </ModalBody>
          <ModalFooter>
            <TailuxButton onClick={() => setOpenAdd(false)} variant="outlined" className="rounded-xl">Cancel</TailuxButton>
            <TailuxButton color="primary" type="submit" className="rounded-xl px-8 shadow-lg shadow-primary/30">Create Class</TailuxButton>
          </ModalFooter>
        </form>
      </Modal>

      {/* EDIT MODAL */}
      <Modal open={openEdit} onClose={() => setOpenEdit(false)}>
        <ModalHeader className="text-xl font-bold">Edit Class Details</ModalHeader>
        <ModalBody className="space-y-6 pt-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Class Name</label>
            <input
              className="w-full rounded-xl px-4 py-3 bg-background border border-divider focus:ring-2 focus:ring-primary/40 outline-none transition-all"
              value={editClassName}
              onChange={(e) => setEditClassName(e.target.value)}
            />
          </div>
          <div 
            onClick={() => setEditIsActive(!editIsActive)}
            className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer ${editIsActive ? 'border-success/40 bg-success/5' : 'border-divider bg-muted/5'}`}
          >
            <div className={`p-2 rounded-lg ${editIsActive ? 'bg-success text-white' : 'bg-muted text-muted-foreground'}`}>
              {editIsActive ? <CheckBadgeIcon className="h-5 w-5" /> : <XCircleIcon className="h-5 w-5" />}
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold">Status: {editIsActive ? 'Active' : 'Disabled'}</p>
              <p className="text-xs text-muted">Current status of this class group</p>
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
        <ModalHeader className="text-xl font-bold text-danger">Delete Class Group</ModalHeader>
        <ModalBody className="text-center py-6">
          <div className="p-4 bg-danger/10 rounded-full w-fit mx-auto mb-4">
            <TrashIcon className="h-12 w-12 text-danger" />
          </div>
          <h3 className="text-lg font-bold">Destroy this record?</h3>
          <p className="text-muted mt-2">
            This will permanently remove the class. Students assigned to this class may lose their association.
          </p>
        </ModalBody>
        <ModalFooter>
          <TailuxButton onClick={() => setOpenDelete(false)} variant="outlined" className="rounded-xl">Keep Class</TailuxButton>
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
            title: "Tambahkan Kelas?",
            description: "Apakah Anda yakin ingin menambahkan data kelas baru ini ke sistem?",
            actionText: "Ya, Tambahkan",
          },
        }}
      />
    </div>
  );
}

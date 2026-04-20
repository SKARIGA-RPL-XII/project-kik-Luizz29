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
  BookOpenIcon, 
  PlusIcon, 
  MagnifyingGlassIcon,
  TrashIcon,
  PencilSquareIcon,
  CheckBadgeIcon,
  XCircleIcon,
  CalendarIcon,
  HashtagIcon
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

export default function SubjectPage() {
  const [parent] = useAutoAnimate();

  // ======================
  // STATE
  // ======================
  const [name, setName] = useState("");
  const [subjectCode, setSubjectCode] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [subjects, setSubjects] = useState([]);

  const [openAdd, setOpenAdd] = useState(false);
  const [openConfirmAdd, setOpenConfirmAdd] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);

  const [openEdit, setOpenEdit] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [editName, setEditName] = useState("");
  const [editCode, setEditCode] = useState("");
  const [editIsActive, setEditIsActive] = useState(true);

  const [globalFilter, setGlobalFilter] = useState("");

  const token = localStorage.getItem("authToken");

  // ======================
  // FETCH DATA
  // ======================
  const fetchSubjects = useCallback(async () => {
    const res = await fetch(`${API_URL}/master/subject`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) return;

    const data = await res.json();
    setSubjects(data || []);
  }, [token]);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  // ======================
  // CREATE SUBJECT
  // ======================
  const handleSubmit = (e) => {
    e.preventDefault();
    setOpenConfirmAdd(true);
  };

  const handleConfirmAdd = async () => {
    setIsAdding(true);
    try {
      const res = await fetch(`${API_URL}/master/subject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subject_nm: name,
          subject_code: subjectCode,
          isactive: isActive,
        }),
      });

      if (!res.ok) {
        toast.error("Gagal menambahkan subject");
        return;
      }

      const result = await res.json();
      setSubjects((prev) => [...prev, result.data]);
      setName("");
      setSubjectCode("");
      setIsActive(true);
      setOpenAdd(false);
      setOpenConfirmAdd(false);
      toast.success("Subject berhasil ditambahkan");
    } catch {
      toast.error("Terjadi kesalahan sistem");
    } finally {
      setIsAdding(false);
    }
  };

  // EDIT
  const handleOpenEdit = (subject) => {
    setSelectedSubject(subject);
    setEditName(subject.subject_name);
    setEditCode(subject.subject_code);
    setEditIsActive(subject.isactive);
    setOpenEdit(true);
  };

  const handleCloseEdit = () => {
    setOpenEdit(false);
    setSelectedSubject(null);
  };

  const handleOpenDelete = (id) => {
    setSelectedSubjectId(id);
    setOpenDelete(true);
  };

  const handleCloseDelete = () => {
    setOpenDelete(false);
    setSelectedSubjectId(null);
  };

  const handleConfirmDelete = async () => {
    if (!selectedSubjectId) return;

    const res = await fetch(`${API_URL}/master/subject/${selectedSubjectId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      toast.error("Gagal hapus subject");
      return;
    }

    setSubjects((prev) => prev.filter((s) => s.subject_id !== selectedSubjectId));
    toast.success("Subject berhasil dihapus");
    handleCloseDelete();
  };

  const handleConfirmEdit = async () => {
    if (!selectedSubject) return;

    const res = await fetch(`${API_URL}/master/subject/${selectedSubject.subject_id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, 
      },
      body: JSON.stringify({
        subject_nm: editName,
        subject_code: editCode,
        isactive: editIsActive,
      }),
    });

    if (!res.ok) {
      toast.error("Gagal update subject");
      return;
    }

    setSubjects((prev) =>
      prev.map((u) =>
        u.subject_id === selectedSubject.subject_id
          ? { ...u, subject_name: editName, subject_code: editCode, isactive: editIsActive }
          : u
      )
    );

    toast.success("Subject berhasil diupdate");
    handleCloseEdit();
  };

  // ======================
  // TABLE COLUMNS
  // ======================
  const columns = useMemo(() => [
    {
      header: "Subject Information",
      accessorKey: "subject_name",
      cell: ({ row, getValue }) => (
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-600">
            <BookOpenIcon className="h-6 w-6" />
          </div>
          <div>
            <p className="font-bold text-foreground text-base">{getValue()}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge variant="flat" size="sm" className="bg-muted/50 text-[10px] font-mono">
                <HashtagIcon className="h-3 w-3 mr-0.5" />
                {row.original.subject_code}
              </Badge>
              <span className="text-[10px] text-muted uppercase">ID: {row.original.subject_id}</span>
            </div>
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
      header: "Registered",
      accessorKey: "created_date",
      cell: ({ getValue }) => (
        <div className="flex items-center gap-2 text-muted text-xs">
          <CalendarIcon className="h-3.5 w-3.5" />
          {getValue() && !getValue().startsWith("0001") ? new Date(getValue()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : "-"}
        </div>
      ),
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
            onClick={() => handleOpenDelete(row.original.subject_id)}
          >
            <TrashIcon className="h-4 w-4" />
          </TailuxButton>
        </div>
      ),
    },
  ], []);

  const table = useReactTable({
    data: subjects,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const stats = [
    { label: "Total Subjects", value: subjects.length, icon: BookOpenIcon, color: "text-indigo-500", bg: "bg-indigo-500/10" },
    { label: "Active Courses", value: subjects.filter(s => s.isactive).length, icon: CheckBadgeIcon, color: "text-success", bg: "bg-success/10" },
    { label: "Archived", value: subjects.filter(s => !s.isactive).length, icon: XCircleIcon, color: "text-danger", bg: "bg-danger/10" },
  ];

  // ======================
  // UI
  // ======================
  return (
    <div className="p-6 md:p-10 space-y-8 max-w-screen-2xl mx-auto">
      {/* HERO SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Subject Management</h1>
          <p className="text-muted mt-1 text-lg">Kelola kurikulum, mata pelajaran, dan kode referensi akademik.</p>
        </div>
        <TailuxButton
          color="primary"
          onClick={() => setOpenAdd(true)}
          className="h-12 px-6 text-base shadow-lg shadow-primary/20"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Create New Subject
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
              placeholder="Search by name or code..."
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
                    No subjects found in current curriculum.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="p-4 border-t border-divider flex items-center justify-between bg-card/30 text-xs font-medium text-muted">
          <div>Showing {table.getRowModel().rows.length} of {subjects.length} results</div>
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
          <ModalHeader className="text-xl font-bold">Register New Subject</ModalHeader>
          <ModalBody className="space-y-6 pt-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Subject Name</label>
                <input
                  className="w-full rounded-xl px-4 py-3 bg-background border border-divider focus:ring-2 focus:ring-primary/40 outline-none transition-all"
                  placeholder="e.g. Mathematics, Physics"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Subject Code</label>
                <input
                  className="w-full rounded-xl px-4 py-3 bg-background border border-divider focus:ring-2 focus:ring-primary/40 outline-none transition-all font-mono"
                  placeholder="e.g. MATH-101"
                  value={subjectCode}
                  onChange={(e) => setSubjectCode(e.target.value)}
                  required
                />
              </div>
            </div>
            <div 
              onClick={() => setIsActive(!isActive)}
              className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer ${isActive ? 'border-success/40 bg-success/5' : 'border-divider bg-muted/5'}`}
            >
              <div className={`p-2 rounded-lg ${isActive ? 'bg-success text-white' : 'bg-muted text-muted-foreground'}`}>
                {isActive ? <CheckBadgeIcon className="h-5 w-5" /> : <XCircleIcon className="h-5 w-5" />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold">Curriculum Status: {isActive ? 'Active' : 'Archived'}</p>
                <p className="text-xs text-muted">Active subjects appear in exam creation and bank</p>
              </div>
              <input type="checkbox" checked={isActive} readOnly className="h-5 w-5 rounded-full text-success border-divider" />
            </div>
          </ModalBody>
          <ModalFooter>
            <TailuxButton onClick={() => setOpenAdd(false)} variant="outlined" className="rounded-xl">Discard</TailuxButton>
            <TailuxButton color="primary" type="submit" className="rounded-xl px-8 shadow-lg shadow-primary/30">Save Subject</TailuxButton>
          </ModalFooter>
        </form>
      </Modal>

      {/* EDIT MODAL */}
      <Modal open={openEdit} onClose={handleCloseEdit}>
        <ModalHeader className="text-xl font-bold">Update Subject Details</ModalHeader>
        <ModalBody className="space-y-6 pt-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Subject Name</label>
              <input
                className="w-full rounded-xl px-4 py-3 bg-background border border-divider focus:ring-2 focus:ring-primary/40 outline-none transition-all"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Subject Code</label>
              <input
                className="w-full rounded-xl px-4 py-3 bg-background border border-divider focus:ring-2 focus:ring-primary/40 outline-none transition-all font-mono"
                value={editCode}
                onChange={(e) => setEditCode(e.target.value)}
              />
            </div>
          </div>
          <div 
            onClick={() => setEditIsActive(!editIsActive)}
            className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer ${editIsActive ? 'border-success/40 bg-success/5' : 'border-divider bg-muted/5'}`}
          >
            <div className={`p-2 rounded-lg ${editIsActive ? 'bg-success text-white' : 'bg-muted text-muted-foreground'}`}>
              {editIsActive ? <CheckBadgeIcon className="h-5 w-5" /> : <XCircleIcon className="h-5 w-5" />}
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold">Availability: {editIsActive ? 'Currently Active' : 'Archived'}</p>
              <p className="text-xs text-muted">Toggle to enable or disable this subject in the system</p>
            </div>
            <input type="checkbox" checked={editIsActive} readOnly className="h-5 w-5 rounded-full text-success border-divider" />
          </div>
        </ModalBody>
        <ModalFooter>
          <TailuxButton onClick={handleCloseEdit} variant="outlined" className="rounded-xl">Cancel</TailuxButton>
          <TailuxButton color="primary" onClick={handleConfirmEdit} className="rounded-xl px-8 shadow-lg shadow-primary/30">Apply Changes</TailuxButton>
        </ModalFooter>
      </Modal>

      {/* DELETE MODAL */}
      <Modal open={openDelete} onClose={handleCloseDelete}>
        <ModalHeader className="text-xl font-bold text-danger">Delete Subject</ModalHeader>
        <ModalBody className="text-center py-6">
          <div className="p-4 bg-danger/10 rounded-full w-fit mx-auto mb-4">
            <TrashIcon className="h-12 w-12 text-danger" />
          </div>
          <h3 className="text-lg font-bold">Delete permanently?</h3>
          <p className="text-muted mt-2">
            This action cannot be undone. All questions associated with this subject will be orphaned.
          </p>
        </ModalBody>
        <ModalFooter>
          <TailuxButton onClick={handleCloseDelete} variant="outlined" className="rounded-xl">No, Keep It</TailuxButton>
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
            title: "Tambahkan Subject?",
            description: "Apakah Anda yakin ingin menambahkan data mata pelajaran baru ini ke sistem?",
            actionText: "Ya, Tambahkan",
          },
        }}
      />
    </div>
  );
}

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
import DarkSelect from "components/ui/DarkSelect";
import { useNavigate } from "react-router";
import { 
  AcademicCapIcon, 
  PlusIcon, 
  MagnifyingGlassIcon,
  TrashIcon,
  PencilSquareIcon,
  ClockIcon,
  BookOpenIcon,
  CheckCircleIcon,
  DocumentDuplicateIcon,
  AdjustmentsHorizontalIcon,
  DocumentTextIcon
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

export default function ExamPage() {
  const navigate = useNavigate();
  const [parent] = useAutoAnimate();
  const token = localStorage.getItem("authToken");

  // ======================
  // STATE
  // ======================
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const [examnm, setExamnm] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [subjectId, setSubjectId] = useState("");

  const [openAdd, setOpenAdd] = useState(false);
  const [openConfirmAdd, setOpenConfirmAdd] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const [openEdit, setOpenEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editExamnm, setEditExamnm] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDuration, setEditDuration] = useState("");
  const [editSubjectId, setEditSubjectId] = useState("");

  // ======================
  // FETCH DATA
  // ======================
  const fetchExam = useCallback(async () => {
    const res = await fetch(`${API_URL}/master/exam`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) return;
    const json = await res.json();
    setExams(json.data || json);
  }, [token]);

  const fetchSubjects = useCallback(async () => {
    const res = await fetch(`${API_URL}/select/subjects`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const json = await res.json();
      setSubjects(json.data || []);
    }
  }, [token]);

  useEffect(() => {
    fetchExam();
    fetchSubjects();
  }, [fetchExam, fetchSubjects]);

  // ================= CREATE =================
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!examnm || !description || !duration || Number(duration) <= 0 || !subjectId) {
      toast.warning("Semua data wajib diisi dengan benar (termasuk Mata Pelajaran)!");
      return;
    }

    setOpenConfirmAdd(true);
  };

  const handleConfirmAdd = async () => {
    setIsAdding(true);
    try {
      const res = await fetch(`${API_URL}/master/exam`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          examnm,
          description,
          duration: Number(duration),
          subjectid: Number(subjectId),
        }),
      });

      if (!res.ok) {
        toast.error("Gagal tambah exam");
        return;
      }

      fetchExam();
      setExamnm("");
      setDescription("");
      setDuration("");
      setSubjectId("");
      setOpenAdd(false);
      setOpenConfirmAdd(false);
      toast.success("Exam berhasil ditambahkan");
    } catch {
      toast.error("Server error");
    } finally {
      setIsAdding(false);
    }
  };

  // ================= EDIT =================
  const handleConfirmEdit = async () => {

    if (!editExamnm || !editDescription || !editDuration || Number(editDuration) <= 0 || !editSubjectId) {
      toast.warning("Semua data wajib diisi dengan benar (termasuk Mata Pelajaran)!");
      return;
    }

    const res = await fetch(`${API_URL}/master/exam/${editId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        examnm: editExamnm,
        description: editDescription,
        duration: Number(editDuration),
        subjectid: Number(editSubjectId),
      }),
    });

    if (!res.ok) {
      toast.error("Gagal update exam");
      return;
    }

    fetchExam();
    setOpenEdit(false);

    toast.success("Exam berhasil diupdate");
  };

  // ================= DELETE =================
  const handleConfirmDelete = async () => {
    try {
      const res = await fetch(`${API_URL}/master/exam/${selectedId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error();

      fetchExam();
      setOpenDelete(false);
      toast.success("Exam berhasil dihapus");
    } catch {
      toast.error("Gagal hapus exam");
    }
  };

  // ================= TABLE =================
  const columns = useMemo(() => [
    {
      header: "Exam Details",
      accessorKey: "examnm",
      cell: ({ row, getValue }) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
            <DocumentTextIcon className="h-6 w-6" />
          </div>
          <div>
            <p className="font-bold text-foreground">{getValue()}</p>
            <p className="text-[11px] text-muted line-clamp-1 max-w-[200px]">{row.original.description}</p>
          </div>
        </div>
      )
    },
    {
      header: "Configuration",
      id: "config",
      cell: ({ row }) => (
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-medium text-muted">
            <ClockIcon className="h-3.5 w-3.5" />
            {row.original.duration} Menit
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-muted">
            <BookOpenIcon className="h-3.5 w-3.5" />
            {subjects.find(s => s.subjectid === row.original.subjectid)?.subjectnm || "No Subject"}
          </div>
        </div>
      )
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: ({ getValue }) => {
        const isPublished = getValue() === "Published";
        return (
          <Badge variant={isPublished ? "success" : "flat"} className={!isPublished ? "bg-muted/50 text-muted-foreground border-divider" : ""}>
            {isPublished ? <CheckCircleIcon className="h-3.5 w-3.5 mr-1.5" /> : <PencilSquareIcon className="h-3.5 w-3.5 mr-1.5" />}
            {getValue()}
          </Badge>
        );
      }
    },
    {
      header: "Action",
      id: "actions",
      cell: ({ row }) => {
        const exam = row.original;
        const isPublished = exam.status === "Published";
        return (
          <div className="flex gap-2">
            <TailuxButton
              color="primary"
              variant={isPublished ? "outlined" : "solid"}
              size="small"
              className="rounded-lg px-4"
              onClick={() => navigate(`/exam/${exam.id}`)}
              disabled={isPublished}
            >
              <AdjustmentsHorizontalIcon className="h-4 w-4 mr-1.5" />
              Manage
            </TailuxButton>
            <TailuxButton
              size="small"
              variant="outlined"
              className="px-2 min-w-0"
              onClick={() => {
                setEditId(exam.id);
                setEditExamnm(exam.examnm);
                setEditDescription(exam.description);
                setEditDuration(exam.duration);
                setEditSubjectId(exam.subjectid || "");
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
                setSelectedId(exam.id);
                setOpenDelete(true);
              }}
            >
              <TrashIcon className="h-4 w-4" />
            </TailuxButton>
          </div>
        );
      }
    }
  ], [navigate, subjects]);


  const table = useReactTable({
    data: exams,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const stats = [
    { label: "Total Exams", value: exams.length, icon: DocumentTextIcon, color: "text-primary", bg: "bg-primary/10" },
    { label: "Published", value: exams.filter(e => e.status === "Published").length, icon: CheckCircleIcon, color: "text-success", bg: "bg-success/10" },
    { label: "Drafts", value: exams.filter(e => e.status === "Draft").length, icon: DocumentDuplicateIcon, color: "text-orange-500", bg: "bg-orange-500/10" },
  ];

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-screen-2xl mx-auto">
      {/* HERO SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <AcademicCapIcon className="h-8 w-8 text-primary" />
            Exam Management
          </h1>
          <p className="text-muted mt-1 text-lg">Kelola, publikasi, dan monitor pelaksanaan ujian akademik.</p>
        </div>
        <TailuxButton
          color="primary"
          onClick={() => setOpenAdd(true)}
          className="h-12 px-6 text-base shadow-lg shadow-primary/20"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Create New Exam
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
              placeholder="Search exams..."
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
                  <td colSpan={table.getAllColumns().length} className="px-6 py-20 text-center text-muted italic">
                    No exams found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="p-4 border-t border-divider flex items-center justify-between bg-card/30 text-xs font-medium text-muted">
          <div>Showing {table.getRowModel().rows.length} of {exams.length} exams</div>
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
          <ModalHeader className="text-xl font-bold">Create New Exam</ModalHeader>
          <ModalBody className="space-y-5 pt-4">
            <div className="grid grid-cols-1 gap-5">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-foreground">
                   Exam Name
                </label>
                <input
                  className="w-full rounded-xl px-4 py-3 bg-background border border-divider focus:ring-2 focus:ring-primary/40 outline-none transition-all"
                  placeholder="e.g. UAS Matematika Semester 2"
                  value={examnm}
                  onChange={(e) => setExamnm(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-foreground">
                   Description
                </label>
                <textarea
                  className="w-full rounded-xl px-4 py-3 bg-background border border-divider focus:ring-2 focus:ring-primary/40 outline-none transition-all min-h-[100px]"
                  placeholder="Deskripsi singkat mengenai ujian ini..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-foreground">
                     Duration (Menit)
                  </label>
                  <input
                    type="number"
                    className="w-full rounded-xl px-4 py-3 bg-background border border-divider focus:ring-2 focus:ring-primary/40 outline-none transition-all"
                    placeholder="90"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                     Mata Pelajaran
                  </label>
                  <DarkSelect
                    placeholder="Pilih Mapel"
                    value={subjectId}
                    options={subjects.map(s => ({
                      value: s.subjectid,
                      label: s.subjectnm,
                    }))}
                    onChange={setSubjectId}
                  />
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <TailuxButton onClick={() => setOpenAdd(false)} variant="outlined" className="rounded-xl">Cancel</TailuxButton>
            <TailuxButton color="primary" type="submit" className="rounded-xl px-8 shadow-lg shadow-primary/30">Save Exam</TailuxButton>
          </ModalFooter>
        </form>
      </Modal>

      {/* EDIT MODAL */}
      <Modal open={openEdit} onClose={() => setOpenEdit(false)}>
        <ModalHeader className="text-xl font-bold">Edit Exam Details</ModalHeader>
        <ModalBody className="space-y-5 pt-4">
          <div className="grid grid-cols-1 gap-5">
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-foreground">
                 Exam Name
              </label>
              <input
                className="w-full rounded-xl px-4 py-3 bg-background border border-divider focus:ring-2 focus:ring-primary/40 outline-none transition-all"
                value={editExamnm}
                onChange={(e) => setEditExamnm(e.target.value)}
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-foreground">
                 Description
              </label>
              <textarea
                className="w-full rounded-xl px-4 py-3 bg-background border border-divider focus:ring-2 focus:ring-primary/40 outline-none transition-all min-h-[100px]"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-foreground">
                   Duration (Menit)
                </label>
                <input
                  type="number"
                  className="w-full rounded-xl px-4 py-3 bg-background border border-divider focus:ring-2 focus:ring-primary/40 outline-none transition-all"
                  value={editDuration}
                  onChange={(e) => setEditDuration(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                   Mata Pelajaran
                </label>
                <DarkSelect
                  placeholder="Pilih Mapel"
                  value={editSubjectId}
                  options={subjects.map(s => ({
                    value: s.subjectid,
                    label: s.subjectnm,
                  }))}
                  onChange={setEditSubjectId}
                />
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <TailuxButton onClick={() => setOpenEdit(false)} variant="outlined" className="rounded-xl">Cancel</TailuxButton>
          <TailuxButton color="primary" onClick={handleConfirmEdit} className="rounded-xl px-8 shadow-lg shadow-primary/30">Save Changes</TailuxButton>
        </ModalFooter>
      </Modal>

      {/* DELETE MODAL */}
      <Modal open={openDelete} onClose={() => setOpenDelete(false)}>
        <ModalHeader className="text-xl font-bold text-danger">Hapus Exam</ModalHeader>
        <ModalBody className="text-center py-6">
          <div className="p-4 bg-danger/10 rounded-full w-fit mx-auto mb-4">
            <TrashIcon className="h-12 w-12 text-danger" />
          </div>
          <h3 className="text-lg font-bold">Yakin ingin menghapus exam ini?</h3>
          <p className="text-muted mt-2">
            Tindakan ini tidak dapat dibatalkan. Seluruh data terkait ujian ini akan hilang.
          </p>
        </ModalBody>
        <ModalFooter>
          <TailuxButton onClick={() => setOpenDelete(false)} variant="outlined" className="rounded-xl">Batal</TailuxButton>
          <TailuxButton color="error" onClick={handleConfirmDelete} className="rounded-xl shadow-lg shadow-danger/20">Ya, Hapus</TailuxButton>
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
            title: "Buat Ujian Baru?",
            description: "Apakah Anda yakin ingin membuat data ujian baru ini?",
            actionText: "Ya, Buat",
          },
        }}
      />
    </div>
  );
}

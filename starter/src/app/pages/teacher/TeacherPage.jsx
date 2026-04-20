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
  PlusIcon, 
  MagnifyingGlassIcon,
  TrashIcon,
  PencilSquareIcon,
  CheckBadgeIcon,
  XCircleIcon,
  BriefcaseIcon
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

export default function TeacherPage() {
  const [parent] = useAutoAnimate();

  // ================= STATE =================
  const [users, setUsers] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [teacherName, setTeacherName] = useState("");
  const [userId, setUserId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [openAdd, setOpenAdd] = useState(false);
  const [openConfirmAdd, setOpenConfirmAdd] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  const [openEdit, setOpenEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editIsActive, setEditIsActive] = useState(true);

  const [globalFilter, setGlobalFilter] = useState("");

  const token = localStorage.getItem("authToken");

  // ================= FETCH =================
  const fetchUsers = useCallback(() => {
    fetch(`${API_URL}/select/users?role=Teacher`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(j => setUsers(j.data || []));
  }, [token]);

  const fetchSubjects = useCallback(() => {
    fetch(`${API_URL}/select/subjects`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(j => setSubjects(j.data || []));
  }, [token]);

  const fetchTeachers = useCallback(() => {
    fetch(`${API_URL}/master/teacher`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(j => setTeachers(j.data || []));
  }, [token]);

  useEffect(() => {
    fetchUsers();
    fetchSubjects();
    fetchTeachers();
  }, [fetchUsers, fetchSubjects, fetchTeachers]);

  // ================= CREATE =================
  const handleSubmit = (e) => {
    e.preventDefault();
    setOpenConfirmAdd(true);
  };

  const handleConfirmAdd = async () => {
    setIsAdding(true);
    try {
      const res = await fetch(`${API_URL}/master/teacher`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          teachernm: teacherName,
          userid: Number(userId),
          subjectid: Number(subjectId),
          isactive: isActive,
        }),
      });

      if (!res.ok) {
        toast.error("Gagal menambahkan teacher");
        return;
      }

      const json = await res.json();
      setTeachers((prev) => [...prev, json.data]);

      setTeacherName("");
      setUserId("");
      setSubjectId("");
      setIsActive(true);
      setOpenAdd(false);
      setOpenConfirmAdd(false);

      toast.success("Teacher berhasil ditambahkan");
    } catch {
      toast.error("Terjadi kesalahan sistem");
    } finally {
      setIsAdding(false);
    }
  };

  // ================= EDIT =================
  const handleConfirmEdit = async () => {
    const res = await fetch(`${API_URL}/master/teacher/${editId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        isactive: editIsActive,
      }),
    });

    if (!res.ok) {
      toast.error("Gagal update teacher");
      return;
    }

    setTeachers(prev =>
      prev.map(t =>
        t.teacherid === editId
          ? { ...t, isactive: editIsActive }
          : t
      )
    );

    setOpenEdit(false);
    toast.success("Teacher berhasil diupdate");
  };

  // ================= DELETE =================
  const handleConfirmDelete = async () => {
    if (!selectedTeacher) return;

    const res = await fetch(`${API_URL}/master/teacher/${selectedTeacher.teacherid}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      toast.error("Gagal menghapus teacher");
      return;
    }

    setTeachers(prev =>
      prev.filter(t => t.teacherid !== selectedTeacher.teacherid)
    );

    setOpenDelete(false);
    setSelectedTeacher(null);
    toast.success("Teacher berhasil dihapus");
  };

  // ================= TABLE =================
  const columns = useMemo(() => [
    { 
      header: "Teacher", 
      accessorKey: "teachernm",
      cell: ({ row, getValue }) => (
        <div className="flex items-center gap-3">
          <Avatar name={getValue()} size="xs" />
          <div>
            <p className="font-medium text-foreground">{getValue()}</p>
            <p className="text-[10px] text-muted uppercase">ID: {row.original.teacherid}</p>
          </div>
        </div>
      )
    },
    {
      header: "User Account",
      accessorFn: (row) => users.find(u => u.userid === row.userid)?.username || "-",
      id: "username",
      cell: ({ getValue }) => (
        <div className="flex items-center gap-2">
          <Badge variant="ghost" size="sm" className="bg-muted/50 border-none font-normal text-muted-foreground">
            {getValue()}
          </Badge>
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
              setEditId(row.original.teacherid);
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
              setSelectedTeacher(row.original);
              setOpenDelete(true);
            }}
          >
            <TrashIcon className="h-4 w-4" />
          </TailuxButton>
        </div>
      )
    }
  ], [users]);

  const table = useReactTable({
    data: teachers,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const stats = [
    { label: "Total Teachers", value: teachers.length, icon: BriefcaseIcon, color: "text-purple-500", bg: "bg-purple-500/10" },
    { label: "Active Staff", value: teachers.filter(t => t.isactive).length, icon: CheckBadgeIcon, color: "text-success", bg: "bg-success/10" },
    { label: "Inactive", value: teachers.filter(t => !t.isactive).length, icon: XCircleIcon, color: "text-danger", bg: "bg-danger/10" },
  ];

  // ================= UI =================
  return (
    <div className="p-6 md:p-10 space-y-8 max-w-screen-2xl mx-auto">
      {/* HERO SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Teacher Management</h1>
          <p className="text-muted mt-1 text-lg">Kelola staf pengajar, akun pengguna, dan akses manajemen soal.</p>
        </div>
        <TailuxButton
          color="primary"
          onClick={() => setOpenAdd(true)}
          className="h-12 px-6 text-base shadow-lg shadow-primary/20"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add New Teacher
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
              placeholder="Search teachers by name or username..."
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
              {table.getHeaderGroups().map(hg => (
                <tr key={hg.id} className="bg-muted/30">
                  {hg.headers.map(h => (
                    <th key={h.id} className="px-6 py-4 text-xs font-bold text-muted uppercase tracking-widest border-b border-divider">
                      {flexRender(h.column.columnDef.header, h.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody ref={parent}>
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map(row => (
                  <tr key={row.id} className="group hover:bg-primary/5 transition-colors border-b border-divider/50 last:border-0">
                    {row.getVisibleCells().map(cell => (
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
                      <h3 className="text-lg font-semibold text-foreground">No teachers found</h3>
                      <p className="text-muted max-w-xs mx-auto mt-1">Try adjusting your search criteria.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="p-4 border-t border-divider flex items-center justify-between bg-card/30">
          <div className="text-xs text-muted font-medium uppercase tracking-tighter">
            Staff Overview | {table.getRowModel().rows.length} of {teachers.length} entries
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
          <ModalHeader className="text-xl font-bold">Register New Teacher</ModalHeader>
          <ModalBody className="space-y-6 pt-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Teacher Full Name</label>
              <input
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
                className="w-full rounded-xl px-4 py-3 bg-background border border-divider focus:ring-2 focus:ring-primary/40 outline-none transition-all"
                placeholder="e.g. John Doe, M.Pd"
              />
            </div>
            <DarkSelect
              label="User Account"
              placeholder="-- Select Linked User --"
              value={userId}
              options={users.map(u => ({ value: u.userid, label: u.username }))}
              onChange={setUserId}
            />
            <DarkSelect
              label="Core Subject"
              placeholder="-- Select Primary Subject --"
              value={subjectId}
              options={subjects.map(s => ({ value: s.subjectid, label: s.subjectnm }))}
              onChange={setSubjectId}
            />
            <div 
              onClick={() => setIsActive(!isActive)}
              className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer ${isActive ? 'border-success/40 bg-success/5' : 'border-divider bg-muted/5'}`}
            >
              <div className={`p-2 rounded-lg ${isActive ? 'bg-success text-white' : 'bg-muted text-muted-foreground'}`}>
                {isActive ? <CheckBadgeIcon className="h-5 w-5" /> : <XCircleIcon className="h-5 w-5" />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold">Status: {isActive ? 'Active' : 'Inactive'}</p>
                <p className="text-xs text-muted">Active teachers can manage exam questions</p>
              </div>
              <input type="checkbox" checked={isActive} readOnly className="h-5 w-5 rounded-full text-success border-divider" />
            </div>
          </ModalBody>
          <ModalFooter>
            <TailuxButton onClick={() => setOpenAdd(false)} variant="outlined" className="rounded-xl">Cancel</TailuxButton>
            <TailuxButton color="primary" type="submit" className="rounded-xl px-8 shadow-lg shadow-primary/30">Register Teacher</TailuxButton>
          </ModalFooter>
        </form>
      </Modal>

      {/* EDIT MODAL */}
      <Modal open={openEdit} onClose={() => setOpenEdit(false)}>
        <ModalHeader className="text-xl font-bold">Update Teacher Status</ModalHeader>
        <ModalBody className="space-y-6 pt-4">
          <div 
            onClick={() => setEditIsActive(!editIsActive)}
            className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer ${editIsActive ? 'border-success/40 bg-success/5' : 'border-divider bg-muted/5'}`}
          >
            <div className={`p-2 rounded-lg ${editIsActive ? 'bg-success text-white' : 'bg-muted text-muted-foreground'}`}>
              {editIsActive ? <CheckBadgeIcon className="h-5 w-5" /> : <XCircleIcon className="h-5 w-5" />}
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold">Active Teacher</p>
              <p className="text-xs text-muted">Update current employment status</p>
            </div>
            <input type="checkbox" checked={editIsActive} readOnly className="h-5 w-5 rounded-full text-success border-divider" />
          </div>
        </ModalBody>
        <ModalFooter>
          <TailuxButton onClick={() => setOpenEdit(false)} variant="outlined" className="rounded-xl">Cancel</TailuxButton>
          <TailuxButton color="primary" onClick={handleConfirmEdit} className="rounded-xl px-8 shadow-lg shadow-primary/30">Update Status</TailuxButton>
        </ModalFooter>
      </Modal>

      {/* DELETE MODAL */}
      <Modal open={openDelete} onClose={() => setOpenDelete(false)}>
        <ModalHeader className="text-xl font-bold text-danger">Remove Teacher</ModalHeader>
        <ModalBody className="text-center py-6">
          <div className="p-4 bg-danger/10 rounded-full w-fit mx-auto mb-4">
            <TrashIcon className="h-12 w-12 text-danger" />
          </div>
          <h3 className="text-lg font-bold">Permanently delete record?</h3>
          <p className="text-muted mt-2">
            This will remove all associations for this teacher. This action is irreversible.
          </p>
        </ModalBody>
        <ModalFooter>
          <TailuxButton onClick={() => setOpenDelete(false)} variant="outlined" className="rounded-xl">Keep Record</TailuxButton>
          <TailuxButton color="error" onClick={handleConfirmDelete} className="rounded-xl shadow-lg shadow-danger/20">Yes, Remove</TailuxButton>
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
            title: "Tambahkan Guru?",
            description: "Apakah Anda yakin ingin menambahkan data guru baru ini ke sistem?",
            actionText: "Ya, Tambahkan",
          },
        }}
      />
    </div>
  );
}

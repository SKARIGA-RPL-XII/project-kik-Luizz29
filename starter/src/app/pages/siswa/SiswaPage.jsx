import { useEffect, useMemo, useState } from "react";
import DarkSelect from "components/ui/DarkSelect";
import { Button as TailuxButton } from "components/ui";
// MUI


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

const selectClass = `
  w-full rounded-lg px-4 py-2 text-sm
  bg-card text-foreground
  border border-divider
  focus:outline-none focus:ring-2 focus:ring-primary/40
  [&>option]:bg-background
  [&>option]:text-foreground
`;

export default function SiswaPage() {
  // ======================
  // STATE
  // ======================
  const [users, setUsers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [siswas, setSiswas] = useState([]);

  const [userId, setUserId] = useState("");
  const [classId, setClassId] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [openDelete, setOpenDelete] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const [openEdit, setOpenEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editClassId, setEditClassId] = useState("");
  const [editIsActive, setEditIsActive] = useState(true);

  const token = localStorage.getItem("authToken");

  // ======================
  // FETCH
  // ======================
  useEffect(() => {
    fetch(`${API_URL}/select/users`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((j) => setUsers(j.data || []));

    fetch(`${API_URL}/select/classes`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((j) => setClasses(j.data || []));

    fetch(`${API_URL}/master/siswa`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((j) => setSiswas(j.data || []));
  }, [token]);

  // ======================
  // CREATE
  // ======================
  const handleSubmit = async (e) => {
    e.preventDefault();

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

    toast.success("Siswa berhasil ditambahkan");
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
      { header: "ID", accessorKey: "siswaid" },
      {
        header: "User",
        accessorFn: (row) => users.find((u) => u.userid === row.userid)?.username || "-",
        id: "username",
      },
      {
        header: "Class",
        accessorFn: (row) => classes.find((c) => c.classid === row.classid)?.classnm || "-",
        id: "classnm",
      },
      {
        header: "Status",
        accessorFn: (row) => (row.isactive ? "ACTIVE" : "INACTIVE"),
        id: "status",
        cell: ({ getValue }) => (
          <span
            className={`px-2 py-0.5 rounded text-xs font-semibold ${getValue() === "ACTIVE"
              ? "bg-success/20 text-success"
              : "bg-danger/20 text-danger"
              }`}
          >
            {getValue()}
          </span>
        ),
      },
      {
        header: "Action",
        cell: ({ row }) => (
          <div className="flex gap-2">
            <TailuxButton
              size="small"
              variant="outlined"
              onClick={() => {
                setEditId(row.original.siswaid);
                setEditClassId(row.original.classid);
                setEditIsActive(row.original.isactive);
                setOpenEdit(true);
              }}
            >
              Edit
            </TailuxButton>
            <TailuxButton
              size="small"
              variant="outlined"
              color="error"
              onClick={() => {
                setSelectedId(row.original.siswaid);
                setOpenDelete(true);
              }}
            >
              Delete
            </TailuxButton>
          </div>
        ),
      },
    ],
    [users, classes]
  );

  const [globalFilter, setGlobalFilter] = useState("");

  const table = useReactTable({
    data: siswas,
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
          <h1 className="text-lg font-semibold">Siswa Management</h1>
          <p className="text-sm text-muted">Kelola data siswa dan kelas</p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4 border-b border-divider">
          <DarkSelect
            label="User"
            placeholder="-- Pilih User --"
            value={userId}
            options={users.map((u) => ({
              value: u.userid,
              label: u.username,
            }))}
            onChange={setUserId}
          />

          <DarkSelect
            label="Class"
            placeholder="-- Pilih Class --"
            value={classId}
            options={classes.map((c) => ({
              value: c.classid,
              label: c.classnm,
            }))}
            onChange={setClassId}
          />





          <label
            className={`flex items-center gap-3 rounded-lg px-4 py-3 border cursor-pointer transition ${isActive
              ? "border-success/60 bg-success/10 text-success"
              : "border-divider bg-background text-muted"
              }`}
          >
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-5 w-5 rounded border border-divider text-primary"
            />
            <span className="text-sm font-medium">Active Siswa</span>
          </label>

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
          <table className="w-full text-sm border border-divider">
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((h) => (
                    <th key={h.id} className="px-3 py-2 text-left font-medium">
                      {flexRender(h.column.columnDef.header, h.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-t border-divider">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-3 py-2">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* DIALOG + TOAST */}
      
        {/* DELETE */}
        <Modal open={openDelete} onClose={() => setOpenDelete(false)}>
          <ModalHeader>Hapus Siswa</ModalHeader>
          <ModalBody>Yakin mau menghapus siswa ini?</ModalBody>
          <ModalFooter>
            <TailuxButton onClick={() => setOpenDelete(false)} variant="outlined">Batal</TailuxButton>
            <TailuxButton color="error" onClick={handleConfirmDelete}>
              Hapus
            </TailuxButton>
          </ModalFooter>
        </Modal>

        {/* EDIT */}
        <Modal open={openEdit} onClose={() => setOpenEdit(false)}>
          <ModalHeader>Edit Siswa</ModalHeader>
          <ModalBody className="space-y-4">
            <select className={selectClass} value={editClassId} onChange={(e) => setEditClassId(e.target.value)}>
              {classes.map((c) => (
                <option key={c.classid} value={c.classid}>{c.classnm}</option>
              ))}
            </select>

            <label
              className={`flex items-center gap-3 rounded-lg px-4 py-3 border cursor-pointer transition ${editIsActive
                ? "border-success/60 bg-success/10 text-success"
                : "border-divider bg-background text-muted"
                }`}
            >
              <input
                type="checkbox"
                checked={editIsActive}
                onChange={(e) => setEditIsActive(e.target.checked)}
                className="h-5 w-5 rounded border border-divider text-primary"
              />
              <span className="text-sm font-medium">Active Siswa</span>
            </label>
          </ModalBody>
          <ModalFooter>
            <TailuxButton onClick={() => setOpenEdit(false)} variant="outlined">Batal</TailuxButton>
            <TailuxButton color="primary" onClick={handleConfirmEdit}>Simpan</TailuxButton>
          </ModalFooter>
        </Modal>
    </div>
  );
}

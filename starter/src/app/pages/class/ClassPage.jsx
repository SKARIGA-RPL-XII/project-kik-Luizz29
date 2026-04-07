import { useEffect, useMemo, useState } from "react";
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
import { toast } from "sonner";

import { API_URL } from '../../../utils/config';

export default function ClassPage() {
  // ======================
  // STATE
  // ======================
  const [className, setClassName] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [classes, setClasses] = useState([]);

  // DELETE
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  // EDIT
  const [openEdit, setOpenEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editClassName, setEditClassName] = useState("");
  const [editIsActive, setEditIsActive] = useState(true);


  // ======================
  // FETCH CLASS
  // ======================
  const fetchClasses = async () => {
    const token = localStorage.getItem("authToken");

    const res = await fetch(`${API_URL}/master/class`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      console.error("Gagal fetch class");
      return;
    }

    const json = await res.json();
    setClasses(json.data);
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  // ======================
  // CREATE CLASS
  // ======================
  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("authToken");

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

    toast.success("Class berhasil ditambahkan");
    setClassName("");
    setIsActive(true);
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
    const token = localStorage.getItem("authToken");

    const res = await fetch(
      `${API_URL}/master/class/${editId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          classnm: editClassName,
          isactive: editIsActive,
        }),
      }
    );

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

    toast.success("Class berhasil diupdate");
    setOpenEdit(false);
  };

  // ======================
  // DELETE
  // ======================
const handleConfirmDelete = async () => {
  const token = localStorage.getItem("authToken");

  try {
    const res = await fetch(
      `${API_URL}/master/class/${selectedId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) {
      const err = await res.json();
      toast.error(err.message || "Gagal menghapus class");
      return;
    }

    setClasses((prev) =>
      prev.filter((c) => c.classid !== selectedId)
    );

    toast.success("Class berhasil dihapus ");
    setOpenDelete(false);
  } catch {
    toast.error("Terjadi kesalahan saat menghapus class");
  }
};


  // ======================
  // TABLE
  // ======================
  const columns = useMemo(
    () => [
      { header: "ID", accessorKey: "classid" },
      { header: "Class Name", accessorKey: "classnm" },
      {
        header: "Status",
        accessorFn: (row) => (row.isactive ? "ACTIVE" : "INACTIVE"),
        id: "status",
        cell: ({ getValue }) => (
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
        ),
      },
      {
        header: "Created",
        accessorKey: "createddate",
        cell: ({ getValue }) =>
          getValue()
            ? new Date(getValue()).toLocaleDateString()
            : "-",
      },
      {
        header: "Action",
        cell: ({ row }) => (
          <div className="flex gap-2">
            <TailuxButton
              size="small"
              variant="outlined"
              onClick={() => handleOpenEdit(row.original)}
            >
              Edit
            </TailuxButton>
            <TailuxButton
              size="small"
              variant="outlined"
              color="error"
              onClick={() => {
                setSelectedId(row.original.classid);
                setOpenDelete(true);
              }}
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
    data: classes,
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
          <h1 className="text-lg font-semibold">Class Management</h1>
          <p className="text-sm text-muted">
            Create and manage class
          </p>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="px-6 py-6 space-y-4 border-b border-divider"
        >
          <input
            className="w-full rounded-lg px-4 py-2 text-sm bg-card border"
            placeholder="Class Name"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            required
          />

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            Active Class
          </label>

          <div className="flex justify-end">
              <TailuxButton
                    color="primary"
                    type="submit"
                >
                    + Add Class
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
          <table className="w-full text-sm border">
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((h) => (
                    <th key={h.id} className="px-3 py-2 text-left">
                      {flexRender(
                        h.column.columnDef.header,
                        h.getContext()
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-t">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-3 py-2">
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
        </div>
      </div>

      {/* DELETE DIALOG */}
      <Modal open={openDelete} onClose={() => setOpenDelete(false)}>
        <ModalHeader>Hapus Class</ModalHeader>
        <ModalBody>
          Yakin mau menghapus class ini?
        </ModalBody>
        <ModalFooter>
          <TailuxButton onClick={() => setOpenDelete(false)} variant="outlined">Batal</TailuxButton>
          <TailuxButton
            color="error"
            onClick={handleConfirmDelete}
          >
            Hapus
          </TailuxButton>
        </ModalFooter>
      </Modal>

      {/* EDIT DIALOG */}
      <Modal open={openEdit} onClose={() => setOpenEdit(false)}>
        <ModalHeader>Edit Class</ModalHeader>
        <ModalBody className="space-y-4">
          <input
            className="w-full rounded-lg px-4 py-2 text-sm bg-card border border-divider text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            value={editClassName}
            onChange={(e) => setEditClassName(e.target.value)}
          />
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={editIsActive}
              onChange={(e) => setEditIsActive(e.target.checked)}
            />
            Active
          </label>
        </ModalBody>
        <ModalFooter>
          <TailuxButton onClick={() => setOpenEdit(false)} variant="outlined">Batal</TailuxButton>
          <TailuxButton color="primary" onClick={handleConfirmEdit}>
            Simpan
          </TailuxButton>
        </ModalFooter>
      </Modal>
    </div>
  );
}

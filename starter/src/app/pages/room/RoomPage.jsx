import { useEffect, useMemo, useState } from "react";
import { Button as TailuxButton} from "components/ui";

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

export default function RoomPage() {
  // ======================
  // STATE
  // ======================
  const [roomName, setRoomName] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [rooms, setRooms] = useState([]);

  // DELETE
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  // EDIT
  const [openEdit, setOpenEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editRoomName, setEditRoomName] = useState("");
  const [editIsActive, setEditIsActive] = useState(true);


  // ======================
  // FETCH
  // ======================
  const fetchRooms = async () => {
    const token = localStorage.getItem("authToken");

    const res = await fetch(`${API_URL}/master/room`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      toast.error("Gagal mengambil data room");
      return;
    }

    const json = await res.json();
    setRooms(json.data);
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  // ======================
  // CREATE
  // ======================
  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("authToken");

    const res = await fetch(`${API_URL}/master/room`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        roomnm: roomName,
        isactive: isActive,
      }),
    });

    if (!res.ok) {
      toast.error("Gagal menambahkan room");
      return;
    }

    const json = await res.json();
    setRooms((prev) => [...prev, json.data]);
    setRoomName("");
    setIsActive(true);

    toast.success("Room berhasil ditambahkan");
  };

  // ======================
  // EDIT
  // ======================
  const handleOpenEdit = (row) => {
    setEditId(row.roomid);
    setEditRoomName(row.roomnm);
    setEditIsActive(row.isactive);
    setOpenEdit(true);
  };

  const handleConfirmEdit = async () => {
    const token = localStorage.getItem("authToken");

    const res = await fetch(
      `${API_URL}/master/room/${editId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          roomnm: editRoomName,
          isactive: editIsActive,
        }),
      }
    );

    if (!res.ok) {
      toast.error("Gagal update room");
      return;
    }

    setRooms((prev) =>
      prev.map((r) =>
        r.roomid === editId
          ? { ...r, roomnm: editRoomName, isactive: editIsActive }
          : r
      )
    );

    setOpenEdit(false);
    toast.success("Room berhasil diupdate");
  };

  // ======================
  // DELETE
  // ======================
  const handleConfirmDelete = async () => {
    const token = localStorage.getItem("authToken");

    const res = await fetch(
      `${API_URL}/master/room/${selectedId}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!res.ok) {
      toast.error("Gagal menghapus room");
      return;
    }

    setRooms((prev) =>
      prev.filter((r) => r.roomid !== selectedId)
    );

    setOpenDelete(false);
    toast.success("Room berhasil dihapus");
  };

  // ======================
  // TABLE
  // ======================
  const columns = useMemo(
    () => [
      { header: "ID", accessorKey: "roomid" },
      { header: "Room Name", accessorKey: "roomnm" },
      {
        header: "Status",
        accessorFn: (row) => (row.isactive ? "ACTIVE" : "INACTIVE"),
        id: "status",
        cell: ({ getValue }) => (
          <span
            className={`
              px-2 py-0.5 rounded text-xs font-semibold
              ${
                getValue() === "ACTIVE"
                  ? "bg-success/20 text-success"
                  : "bg-danger/20 text-danger"
              }
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
                setSelectedId(row.original.roomid);
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
    data: rooms,
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
          <h1 className="text-lg font-semibold">Room Management</h1>
          <p className="text-sm text-muted">
            Create and manage room
          </p>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="px-6 py-6 space-y-4 border-b border-divider"
        >
          <input
            className="
              w-full rounded-lg px-4 py-2 text-sm
              bg-card border border-divider
              text-foreground
            "
            placeholder="Room Name"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            required
          />

          {/* ACTIVE CARD */}
          <div
            onClick={() => setIsActive(!isActive)}
            className={`
              cursor-pointer transition
              flex items-center gap-3
              rounded-lg px-4 py-3 border
              ${
                isActive
                  ? "border-success/60 bg-success/10"
                  : "border-danger/60 bg-danger/10"
              }
            `}
          >
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="
                h-5 w-5 rounded
                text-success
                border border-divider
                focus:ring-2 focus:ring-success
              "
            />
            <div>
              <p className="text-sm font-semibold text-foreground">
                Active Room
              </p>
              <p className="text-xs text-muted">
                Room dapat digunakan dalam penjadwalan
              </p>
            </div>
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

      {/* DELETE & EDIT & TOAST */}
      
        {/* DELETE */}
        <Modal open={openDelete} onClose={() => setOpenDelete(false)}>
          <ModalHeader>Hapus Room</ModalHeader>
          <ModalBody>
              Yakin mau menghapus room ini?
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

        {/* EDIT */}
        <Modal open={openEdit} onClose={() => setOpenEdit(false)}>
          <ModalHeader>Edit Room</ModalHeader>
          <ModalBody className="space-y-4">
            <input
              className="w-full rounded-lg px-4 py-2 text-sm bg-card border border-divider text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              value={editRoomName}
              onChange={(e) => setEditRoomName(e.target.value)}
            />
            <div
              onClick={() => setEditIsActive(!editIsActive)}
              className={`
                cursor-pointer transition
                flex items-center gap-3
                rounded-lg px-4 py-3 border
                ${
                  editIsActive
                    ? "border-success/60 bg-success/10 text-success"
                    : "border-divider bg-background text-muted"
                }
              `}
            >
              <input
                type="checkbox"
                checked={editIsActive}
                onChange={(e) => setEditIsActive(e.target.checked)}
              />
              <span className="text-sm font-medium">
                Active Room
              </span>
            </div>
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
  
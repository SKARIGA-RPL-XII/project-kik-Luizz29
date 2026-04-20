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
  HomeModernIcon, 
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

import { API_URL } from '../../../utils/config';
import { toast } from 'sonner';
import { ConfirmModal } from "components/shared/ConfirmModal";

export default function RoomPage() {
  const [parent] = useAutoAnimate();

  // ======================
  // STATE
  // ======================
  const [roomName, setRoomName] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [rooms, setRooms] = useState([]);

  const [openAdd, setOpenAdd] = useState(false);
  const [openConfirmAdd, setOpenConfirmAdd] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const [openEdit, setOpenEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editRoomName, setEditRoomName] = useState("");
  const [editIsActive, setEditIsActive] = useState(true);

  const [globalFilter, setGlobalFilter] = useState("");

  const token = localStorage.getItem("authToken");

  // ======================
  // FETCH
  // ======================
  const fetchRooms = useCallback(async () => {
    const res = await fetch(`${API_URL}/master/room`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) return;

    const json = await res.json();
    setRooms(json.data || []);
  }, [token]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

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
      setOpenAdd(false);
      setOpenConfirmAdd(false);

      toast.success("Room berhasil ditambahkan");
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
    setEditId(row.roomid);
    setEditRoomName(row.roomnm);
    setEditIsActive(row.isactive);
    setOpenEdit(true);
  };

  const handleConfirmEdit = async () => {
    const res = await fetch(`${API_URL}/master/room/${editId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        roomnm: editRoomName,
        isactive: editIsActive,
      }),
    });

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
    const res = await fetch(`${API_URL}/master/room/${selectedId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      toast.error("Gagal menghapus room");
      return;
    }

    setRooms((prev) => prev.filter((r) => r.roomid !== selectedId));
    setOpenDelete(false);
    toast.success("Room berhasil dihapus");
  };

  // ======================
  // TABLE
  // ======================
  const columns = useMemo(() => [
    { 
      header: "Room Name", 
      accessorKey: "roomnm",
      cell: ({ row, getValue }) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-600">
            <HomeModernIcon className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold text-foreground">{getValue()}</p>
            <p className="text-[10px] text-muted uppercase">ID: {row.original.roomid}</p>
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
      header: "Added On",
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
              setSelectedId(row.original.roomid);
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
    data: rooms,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const stats = [
    { label: "Total Rooms", value: rooms.length, icon: HomeModernIcon, color: "text-orange-500", bg: "bg-orange-500/10" },
    { label: "Available", value: rooms.filter(r => r.isactive).length, icon: CheckBadgeIcon, color: "text-success", bg: "bg-success/10" },
    { label: "Out of Service", value: rooms.filter(r => !r.isactive).length, icon: XCircleIcon, color: "text-danger", bg: "bg-danger/10" },
  ];

  // ======================
  // UI
  // ======================
  return (
    <div className="p-6 md:p-10 space-y-8 max-w-screen-2xl mx-auto">
      {/* HERO SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Room Management</h1>
          <p className="text-muted mt-1 text-lg">Kelola lokasi fisik, ruang kelas, dan laboratorium ujian.</p>
        </div>
        <TailuxButton
          color="primary"
          onClick={() => setOpenAdd(true)}
          className="h-12 px-6 text-base shadow-lg shadow-primary/20"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add New Room
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
              placeholder="Search by room name..."
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
                    No room records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="p-4 border-t border-divider flex items-center justify-between bg-card/30 text-xs font-medium text-muted">
          <div>Displaying {table.getRowModel().rows.length} of {rooms.length} records</div>
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
          <ModalHeader className="text-xl font-bold">New Physical Room</ModalHeader>
          <ModalBody className="space-y-6 pt-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Room Name</label>
              <input
                className="w-full rounded-xl px-4 py-3 bg-background border border-divider focus:ring-2 focus:ring-primary/40 outline-none transition-all"
                placeholder="e.g. Lab Komputer 1, Aula Barat"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
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
                <p className="text-sm font-bold">Room Availability: {isActive ? 'Active' : 'Inactive'}</p>
                <p className="text-xs text-muted">Active rooms can be selected for exam scheduling</p>
              </div>
              <input type="checkbox" checked={isActive} readOnly className="h-5 w-5 rounded-full text-success border-divider" />
            </div>
          </ModalBody>
          <ModalFooter>
            <TailuxButton onClick={() => setOpenAdd(false)} variant="outlined" className="rounded-xl">Cancel</TailuxButton>
            <TailuxButton color="primary" type="submit" className="rounded-xl px-8 shadow-lg shadow-primary/30">Add Room</TailuxButton>
          </ModalFooter>
        </form>
      </Modal>

      {/* EDIT MODAL */}
      <Modal open={openEdit} onClose={() => setOpenEdit(false)}>
        <ModalHeader className="text-xl font-bold">Edit Room Details</ModalHeader>
        <ModalBody className="space-y-6 pt-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Room Name</label>
            <input
              className="w-full rounded-xl px-4 py-3 bg-background border border-divider focus:ring-2 focus:ring-primary/40 outline-none transition-all"
              value={editRoomName}
              onChange={(e) => setEditRoomName(e.target.value)}
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
              <p className="text-sm font-bold">Physical Status: {editIsActive ? 'Active' : 'Out of Order'}</p>
              <p className="text-xs text-muted">Toggle this if the room is temporarily unavailable</p>
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
        <ModalHeader className="text-xl font-bold text-danger">Delete Room Record</ModalHeader>
        <ModalBody className="text-center py-6">
          <div className="p-4 bg-danger/10 rounded-full w-fit mx-auto mb-4">
            <TrashIcon className="h-12 w-12 text-danger" />
          </div>
          <h3 className="text-lg font-bold">Confirm Deletion?</h3>
          <p className="text-muted mt-2">
            Removing this room might affect historical exam data. Are you sure you want to proceed?
          </p>
        </ModalBody>
        <ModalFooter>
          <TailuxButton onClick={() => setOpenDelete(false)} variant="outlined" className="rounded-xl">Keep Room</TailuxButton>
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
            title: "Tambahkan Ruangan?",
            description: "Apakah Anda yakin ingin menambahkan data ruangan baru ini ke sistem?",
            actionText: "Ya, Tambahkan",
          },
        }}
      />
    </div>
  );
}
  
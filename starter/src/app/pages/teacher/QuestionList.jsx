import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router";
import { Button as TailuxButton } from "components/ui";

// MUI



import {
    useReactTable,
    getCoreRowModel,
    flexRender,
} from "@tanstack/react-table";

import { Modal, ModalHeader, ModalBody, ModalFooter } from "components/ui/Modal";

import { API_URL } from '../../../utils/config';
import { toast } from 'sonner';

export default function QuestionList() {

    const [openManage, setOpenManage] = useState(false);
    // const [selectedQuestion, setSelectedQuestion] = useS tate(null);
    const [questionOptions, setQuestionOptions] = useState([]);


    const [score, setScore] = useState("");
    const { headerid } = useParams();

    const [questions, setQuestions] = useState([]);

    const [question, setQuestion] = useState("");
    const [type, setType] = useState("mcq");

    const [selectedId, setSelectedId] = useState(null);
    const [openDelete, setOpenDelete] = useState(false);

    const token = localStorage.getItem("authToken");

    const [options, setOptions] = useState([
        { label: "A", text: "", iscorrect: false },
        { label: "B", text: "", iscorrect: false },
        { label: "C", text: "", iscorrect: false },
        { label: "D", text: "", iscorrect: false },
    ]);

    const handleOptionChange = (index, field, value) => {
        const newOptions = [...options];
        newOptions[index][field] = value;
        setOptions(newOptions);
    };

    // ================= FETCH =================
    const fetchQuestions = async () => {
        const res = await fetch(
            `${API_URL}/master/question/${headerid}`,
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );

        const json = await res.json();
        setQuestions(json.data || []);
    };

    useEffect(() => {
        fetchQuestions();
    }, []);

    // ================= CREATE =================
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await fetch(
                `${API_URL}/master/question/${headerid}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        question,
                        type,
                        score: Number(score),
                        options
                    })
                }
            );

            if (!res.ok) {
                throw new Error("Gagal tambah soal");
            }

            const json = await res.json();

            // ✅ update list question
            setQuestions((prev) => [...prev, json.data]);

            // ✅ reset form
            setQuestion("");
            setScore("");
            setType("mcq");

            // reset option MCQ
            setOptions([
                { label: "A", text: "", iscorrect: false },
                { label: "B", text: "", iscorrect: false },
                { label: "C", text: "", iscorrect: false },
                { label: "D", text: "", iscorrect: false },
            ]);

            // ✅ success toast
            toast.success("Soal berhasil ditambahkan");

        } catch (error) {

            toast.error(error.message);
        }
    };


    // ================= MANAGE OPTION (UPDATE) =================


const handleManage = async (question) => {

    try {
        const res = await fetch(
            `${API_URL}/master/question-option/${question.detailid}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        const json = await res.json();
        setQuestionOptions(json.data);

        setOpenManage(true);

    } catch (error) {
        toast.error(error.message || "Gagal load option");
    }
};

    // The dialog has been moved to the render return


    // ================= DELETE =================
    const handleConfirmDelete = async () => {
        await fetch(`${API_URL}/master/question/${selectedId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
        });

        setQuestions((prev) =>
            prev.filter((q) => q.detailid !== selectedId)
        );

        setOpenDelete(false);

        toast.success("Soal berhasil dihapus");
    };

    // ================= TABLE =================
    const columns = useMemo(
        () => [
            { header: "ID", accessorKey: "detailid" },
            { header: "Question", accessorKey: "question" },
            { header: "Score", accessorKey: "score" },

            {
                header: "Action",
                cell: ({ row }) => (
                    <div className="flex gap-2">

                        {/* ⭐ MANAGE OPTION */}
                        <TailuxButton
                            size="small"
                            variant="outlined"
                            color="primary"
                            onClick={() => handleManage(row.original)}
                        >
                            Manage
                        </TailuxButton>

                        {/* DELETE */}
                        <TailuxButton
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={() => {
                                setSelectedId(row.original.detailid);
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


    const table = useReactTable({
        data: questions,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    // ================= UI =================
    return (
        <div className="p-6 md:p-8">
            <div className="bg-background border border-divider rounded-xl">

                {/* HEADER */}
                <div className="border-b border-divider px-6 py-4">
                    <h1 className="text-lg font-semibold">Question Management</h1>
                    <p className="text-sm text-muted">
                        Kelola daftar soal dalam bank
                    </p>
                </div>

                {/* FORM */}
                <form
                    onSubmit={handleSubmit}
                    className="px-6 py-6 space-y-6 border-b border-divider"
                >
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Pertanyaan</label>
                        <textarea
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            placeholder="Tulis pertanyaan..."
                            className="w-full rounded-lg border border-divider bg-card text-foreground px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow"
                            rows={3}
                            required
                        />
                    </div>

                    {/* Tipe Soal dihapus karena selalu mcq */}

                    {type === "mcq" && (
                        <div className="space-y-4 bg-black/20 p-5 rounded-xl border border-divider">
                            <p className="text-sm font-medium text-foreground">Pilihan Jawaban</p>
                            <div className="space-y-3">
                                {options.map((opt, index) => (
                                    <div key={opt.label} className="flex gap-4 items-center">
                                        <div className="flex items-center justify-center w-8 h-8 rounded-lg border border-divider bg-card text-sm font-semibold">
                                            {opt.label}
                                        </div>

                                        <input
                                            type="text"
                                            value={opt.text}
                                            onChange={(e) =>
                                                handleOptionChange(index, "text", e.target.value)
                                            }
                                            className="flex-1 rounded-lg border border-divider bg-card text-foreground px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow"
                                            placeholder={`Masukkan pilihan ${opt.label}...`}
                                        />

                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                checked={opt.iscorrect}
                                                onChange={(e) =>
                                                    handleOptionChange(index, "iscorrect", e.target.checked)
                                                }
                                                className="w-4 h-4 accent-primary cursor-pointer"
                                            />
                                            <span className={`text-sm select-none transition-colors group-hover:text-primary ${opt.iscorrect ? 'text-primary font-medium' : 'text-muted'}`}>
                                                Jawaban Benar
                                            </span>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Nilai Soal</label>
                        <input
                            type="number"
                            min="0"
                            value={score}
                            onChange={(e) => setScore(e.target.value)}
                            className="w-full rounded-lg px-4 py-2.5 text-sm bg-card text-foreground border border-divider focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow"
                            placeholder="Masukkan nilai (contoh: 5)"
                            required
                        />
                    </div>

                    <div className="flex justify-end pt-2">
                        <TailuxButton
                            type="submit"
                            color="primary"
                        >
                            + Add Question
                        </TailuxButton>
                    </div>
                </form>

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
            
            {/* MANAGE OPTION */}
            <Modal open={openManage} onClose={() => setOpenManage(false)}>
                <ModalHeader>Manage Option</ModalHeader>
                <ModalBody className="space-y-2">
                    {questionOptions.map((opt) => (
                        <div key={opt.optionid} className="flex justify-between py-2 border-b border-divider last:border-0">
                            <span>{opt.label}. {opt.text}</span>
                            {opt.iscorrect && (
                                <span className="text-success font-semibold">
                                    ✔ Correct
                                </span>
                            )}
                        </div>
                    ))}
                </ModalBody>
                <ModalFooter>
                    <TailuxButton onClick={() => setOpenManage(false)} variant="outlined">Tutup</TailuxButton>
                </ModalFooter>
            </Modal>

            {/* DELETE */}
            <Modal open={openDelete} onClose={() => setOpenDelete(false)}>
                <ModalHeader>Hapus Soal</ModalHeader>
                <ModalBody>
                    Yakin ingin menghapus soal ini?
                </ModalBody>
                <ModalFooter>
                    <TailuxButton onClick={() => setOpenDelete(false)} variant="outlined">Batal</TailuxButton>
                    <TailuxButton color="error" onClick={handleConfirmDelete}>
                        Hapus
                    </TailuxButton>
                </ModalFooter>
            </Modal>
        </div>
    );
}


import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router";
import { Button as TailuxButton } from "components/ui";
import DarkSelect from "components/ui/DarkSelect";

// MUI
import { ThemeProvider } from "@mui/material/styles";
import { useMuiTheme } from "hooks/useMuiTheme";
import DeleteIcon from "@mui/icons-material/Delete";


import {
    useReactTable,
    getCoreRowModel,
    flexRender,
} from "@tanstack/react-table";

import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
    Snackbar,
    Alert,
} from "@mui/material";

const API_URL = "http://localhost:8081";

export default function QuestionList() {
    const questionTypeOptions = [
        { value: "mcq", label: "Pilihan Ganda" },
        { value: "ESSAY", label: "Essay" },
    ];

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

    const [toast, setToast] = useState({
        open: false,
        message: "",
        severity: "success",
    });

    const muiTheme = useMuiTheme();
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
            setToast({
                open: true,
                message: "Soal berhasil ditambahkan",
                severity: "success",
            });

        } catch (error) {

            setToast({
                open: true,
                message: error.message,
                severity: "error",
            });
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
        setToast({
            open: true,
            message: error.message || "Gagal load option",
            severity: "error",
        });
    }
};

<Dialog
    open={openManage}
    onClose={() => setOpenManage(false)}
    maxWidth="sm"
    fullWidth
>
    <DialogTitle>
        Manage Option
    </DialogTitle>

    <DialogContent>

        {questionOptions.map((opt) => (
            <div key={opt.optionid} className="flex justify-between py-2">

                <span>
                    {opt.label}. {opt.text}
                </span>

                {opt.iscorrect && (
                    <span className="text-green-500 font-semibold">
                        ✔ Correct
                    </span>
                )}

            </div>
        ))}

    </DialogContent>
</Dialog>


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

        setToast({
            open: true,
            message: "Soal berhasil dihapus",
            severity: "success",
        });
    };

    // ================= TABLE =================
    const columns = useMemo(
        () => [
            { header: "ID", accessorKey: "detailid" },
            { header: "Question", accessorKey: "question" },
            {
                header: "Type",
                accessorKey: "type",
                cell: ({ getValue }) =>
                    getValue() === "mcq" ? "Pilihan Ganda" : "Essay",
            },
            { header: "Score", accessorKey: "score" },

            {
                header: "Action",
                cell: ({ row }) => (
                    <div className="flex gap-2">

                        {/* ⭐ MANAGE OPTION */}
                        <Button
                            size="small"
                            variant="outlined"
                            color="primary"
                            onClick={() => handleManage(row.original)}
                        >
                            Manage
                        </Button>

                        {/* DELETE */}
                        <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={() => {
                                setSelectedId(row.original.detailid);
                                setOpenDelete(true);
                            }}
                        >
                            Delete
                        </Button>

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
                    className="px-6 py-6 space-y-4 border-b border-divider"
                >
                    <textarea
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="Tulis pertanyaan..."
                        className="w-full rounded-lg border border-divider bg-card px-4 py-3 text-sm resize-none focus:ring-2 focus:ring-primary/40"
                        rows={3}
                        required
                    />

                    <DarkSelect
                        placeholder="Pilih tipe soal"
                        value={type}
                        options={questionTypeOptions}
                        onChange={setType}
                    />

                    {type === "mcq" && (
                        <div className="space-y-3">

                            <p className="text-sm font-semibold">Pilihan Jawaban</p>

                            {options.map((opt, index) => (
                                <div key={opt.label} className="flex gap-3 items-center">

                                    <span className="font-semibold w-6">{opt.label}</span>

                                    <input
                                        type="text"
                                        value={opt.text}
                                        onChange={(e) =>
                                            handleOptionChange(index, "text", e.target.value)
                                        }
                                        className="flex-1 rounded-lg border border-divider px-3 py-2 text-sm"
                                        placeholder={`Option ${opt.label}`}
                                    />

                                    <input
                                        type="checkbox"
                                        checked={opt.iscorrect}
                                        onChange={(e) =>
                                            handleOptionChange(index, "iscorrect", e.target.checked)
                                        }
                                    />

                                    <span className="text-xs">Correct</span>

                                </div>
                            ))}
                        </div>
                    )}


                    <div>


                        <input
                            type="number"
                            min="0"
                            value={score}
                            onChange={(e) => setScore(e.target.value)}
                            className="
                            mt-1 w-full rounded-lg px-4 py-2 text-sm
                            bg-card text-foreground
                            border border-divider
                            focus:outline-none focus:ring-2 focus:ring-primary/40
                            "
                            placeholder="Masukkan nilai soal"
                            required
                        />
                    </div>


                    <div className="flex justify-end">
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
            <ThemeProvider theme={muiTheme}>
                <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
                    <DialogTitle>Hapus Soal</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Yakin ingin menghapus soal ini?
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenDelete(false)}>Batal</Button>
                        <Button color="error" variant="contained" onClick={handleConfirmDelete}>
                            Hapus
                        </Button>
                    </DialogActions>
                </Dialog>

                <Snackbar
                    open={toast.open}
                    autoHideDuration={3000}
                    onClose={() => setToast({ ...toast, open: false })}
                    anchorOrigin={{ vertical: "top", horizontal: "right" }}
                >
                    <Alert severity={toast.severity} variant="filled">
                        {toast.message}
                    </Alert>
                </Snackbar>
            </ThemeProvider>
        </div>
    );
}


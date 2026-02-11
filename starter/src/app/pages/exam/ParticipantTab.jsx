import { useEffect, useState } from "react";
import { Card, Button } from "components/ui";
import DarkSelect from "components/ui/DarkSelect";

const API_URL = "http://localhost:8081";

export default function ParticipantTab({ examId }) {

    const token = localStorage.getItem("authToken");

    const [classOptions, setClassOptions] = useState([]);
    const [selectedClasses, setSelectedClasses] = useState([]);

    const [assignedClasses, setAssignedClasses] = useState([]);
    const [participants, setParticipants] = useState([]);

    // ================= FETCH CLASS OPTIONS =================
    const fetchClassOptions = async () => {
        try {
            const res = await fetch(`${API_URL}/master/class`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const json = await res.json();

            const formatted = (json.data || []).map(c => ({
                label: c.classnm,
                value: c.classid, // ✅ FIX
            }));

            setClassOptions(formatted);
        } catch (err) {
            console.error("Fetch class error", err);
        }
    };

    // ================= FETCH ASSIGNED CLASS =================
    const fetchAssignedClasses = async () => {
        try {
            const res = await fetch(
                `${API_URL}/master/exam/${examId}/classes`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const json = await res.json();
            setAssignedClasses(json.data || []);
        } catch (err) {
            console.error("Fetch assigned class error", err);
        }
    };

    // ================= FETCH PARTICIPANT SNAPSHOT =================
    const fetchParticipants = async () => {
        try {
            const res = await fetch(
                `${API_URL}/master/exam/${examId}/participants`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const json = await res.json();
            setParticipants(json.data || []);
        } catch (err) {
            console.error("Fetch participants error", err);
        }
    };

    // ================= ASSIGN CLASS =================
    const handleAssignClass = async () => {

        if (!selectedClasses) return;

        let classIds = [];

        if (Array.isArray(selectedClasses)) {
            classIds = selectedClasses.map(c => c.value ?? c);
        } else {
            classIds = [selectedClasses.value ?? selectedClasses];
        }

        if (classIds.length === 0) return;

        try {
            await fetch(`${API_URL}/master/exam/${examId}/assign-class`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    classids: classIds,
                }),
            });

            setSelectedClasses([]);

            await fetchAssignedClasses();
            await fetchParticipants();

        } catch (err) {
            console.error("Assign class error", err);
        }
    };


    // ================= REMOVE CLASS =================
    const handleRemoveClass = async (classId) => {
        try {
            await fetch(
                `${API_URL}/master/exam/${examId}/class/${classId}`, // ✅ FIX ENDPOINT
                {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            await fetchAssignedClasses();
            await fetchParticipants();

        } catch (err) {
            console.error("Remove class error", err);
        }
    };

    // ================= INIT =================
    useEffect(() => {
        fetchClassOptions();
        fetchAssignedClasses();
        fetchParticipants();
    }, [examId]);

    return (
        <div className="space-y-6">

            {/* ================= ASSIGN CLASS PANEL ================= */}
            <Card className="p-5 space-y-4">

                <h3 className="font-semibold">Assign Class</h3>

                <DarkSelect
                    isMulti
                    placeholder="Select Class"
                    options={classOptions}
                    value={selectedClasses}
                    onChange={setSelectedClasses}
                />


                <Button variant="solid" onClick={handleAssignClass}>
                    Assign
                </Button>

            </Card>

            {/* ================= ASSIGNED CLASS TABLE ================= */}
            <Card className="p-5">

                <h3 className="font-semibold mb-4">Assigned Class</h3>

                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-divider text-left">
                            <th className="py-2">Class</th>
                            <th>Total Student</th>
                            <th></th>
                        </tr>
                    </thead>

                    <tbody>
                        {assignedClasses.map(cls => (
                            <tr key={cls.classid} className="border-b border-divider">
                                <td className="py-2">{cls.classnm}</td>
                                <td>{cls.totalstudent}</td>

                                <td className="text-right">
                                    <Button
                                        size="sm"
                                        variant="twoTone"
                                        onClick={() => handleRemoveClass(cls.classid)}
                                    >
                                        Remove
                                    </Button>
                                </td>
                            </tr>
                        ))}

                        {assignedClasses.length === 0 && (
                            <tr>
                                <td colSpan="3" className="text-center py-4 text-muted">
                                    No class assigned
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

            </Card>

            {/* ================= PARTICIPANT TABLE ================= */}
            <Card className="p-5">

                <h3 className="font-semibold mb-4">Participants</h3>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">

                        <thead>
                            <tr className="border-b border-divider text-left">
                                <th className="py-2">Student Number</th>
                                <th>Name</th>
                                <th>Class</th>
                                <th>Status</th>
                            </tr>
                        </thead>

                        <tbody>
                            {participants.map(p => (
                                <tr key={`${p.studentid}-${p.classnm}`} className="border-b border-divider">
                                    <td className="py-2">{p.studentnumber}</td>
                                    <td>{p.studentname}</td>
                                    <td>{p.classnm}</td>
                                    <td>{p.status}</td>
                                </tr>
                            ))}

                            {participants.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="text-center py-4 text-muted">
                                        No participant assigned
                                    </td>
                                </tr>
                            )}
                        </tbody>

                    </table>
                </div>

            </Card>

        </div>
    );
}

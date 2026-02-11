import { useEffect, useState } from "react";

const API_URL = "http://localhost:8081";

export default function SecurityTab({
    examId,
    token,
    security,
    refreshSecurity
}) {

    const [form, setForm] = useState({
        enableipcheck: false,
        allowednetwork: "",

        enablegeolocation: false,
        latitude: "",
        longitude: "",
        radiusmeter: ""
    });

    const [loading, setLoading] = useState(false);

    // ================= LOAD DATA FROM PARENT =================
    useEffect(() => {

        if (!security) {
            setForm({
                enableipcheck: false,
                allowednetwork: "",
                enablegeolocation: false,
                latitude: "",
                longitude: "",
                radiusmeter: ""
            });
            return;
        }

        setForm({
            enableipcheck: security.enableipcheck || false,
            allowednetwork: security.allowednetwork || "",

            enablegeolocation: security.enablegeolocation || false,
            latitude: security.latitude || "",
            longitude: security.longitude || "",
            radiusmeter: security.radiusmeter || ""
        });

    }, [security]);

    // ================= HANDLE CHANGE =================
    const handleChange = (e) => {

        const { name, value, type, checked } = e.target;

        setForm({
            ...form,
            [name]: type === "checkbox" ? checked : value
        });
    };

    // ================= SUBMIT =================
    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);

        try {

            const method = security ? "PUT" : "POST";

            const res = await fetch(
                `${API_URL}/master/exam/${examId}/security`,
                {
                    method,
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        enableipcheck: form.enableipcheck,
                        allowednetwork: form.allowednetwork,

                        enablegeolocation: form.enablegeolocation,
                        latitude: Number(form.latitude),
                        longitude: Number(form.longitude),
                        radiusmeter: Number(form.radiusmeter)
                    })

                }
            );

            const json = await res.json();

            if (!res.ok) {
                alert(json.error || "Failed saving security");
                setLoading(false);
                return;
            }

            await refreshSecurity();
            alert("Security setting saved");

        } catch (err) {
            console.log(err);
            alert("Error saving security");
        }

        setLoading(false);
    };

    return (
        <div className="max-w-lg space-y-6">

            <h3 className="text-lg font-semibold">Exam Security</h3>

            <form onSubmit={handleSubmit} className="space-y-5">

                {/* IP CHECK */}
                <div className="space-y-2">

                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            name="enableipcheck"
                            checked={form.enableipcheck}
                            onChange={handleChange}
                        />
                        Enable IP Restriction
                    </label>

                    {form.enableipcheck && (
                        <input
                            type="text"
                            name="allowednetwork"
                            value={form.allowednetwork}
                            onChange={handleChange}
                            placeholder="Example: 192.168.137.0/24"
                            className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700"
                        />
                    )}

                </div>

                {/* GEOLOCATION */}
                <div className="space-y-2">

                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            name="enablegeolocation"
                            checked={form.enablegeolocation}
                            onChange={handleChange}
                        />
                        Enable Location Validation
                    </label>

                    {form.enablegeolocation && (
                        <div className="grid grid-cols-3 gap-3">

                            <input
                                type="number"
                                step="any"
                                name="latitude"
                                value={form.latitude}
                                onChange={handleChange}
                                placeholder="Latitude"
                                className="px-3 py-2 rounded-lg bg-gray-800 border border-gray-700"
                            />

                            <input
                                type="number"
                                step="any"
                                name="longitude"
                                value={form.longitude}
                                onChange={handleChange}
                                placeholder="Longitude"
                                className="px-3 py-2 rounded-lg bg-gray-800 border border-gray-700"
                            />

                            <input
                                type="number"
                                name="radiusmeter"
                                value={form.radiusmeter}
                                onChange={handleChange}
                                placeholder="Radius (meter)"
                                className="px-3 py-2 rounded-lg bg-gray-800 border border-gray-700"
                            />

                        </div>
                    )}

                </div>

                {/* BUTTON */}
                <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-primary text-white rounded-lg"
                >
                    {loading ? "Saving..." : "Save Security"}
                </button>

            </form>

        </div>
    );
}

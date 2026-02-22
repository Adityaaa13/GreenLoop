import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const Dashboard = () => {
    const { user } = useAuth();

    // --- Image Upload ---
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadedUrl, setUploadedUrl] = useState("");
    const [uploadLoading, setUploadLoading] = useState(false);

    const handleUpload = async () => {
        if (!selectedFile) return;
        setUploadLoading(true);
        try {
            const formData = new FormData();
            formData.append("image", selectedFile);
            const { data } = await api.post("/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setUploadedUrl(data.url);
        } catch (err) {
            alert(err.response?.data?.message || "Upload failed");
        } finally {
            setUploadLoading(false);
        }
    };

    // --- AI Validation ---
    const [prompt, setPrompt] = useState("");
    const [aiResult, setAiResult] = useState("");
    const [aiLoading, setAiLoading] = useState(false);

    const handleValidate = async () => {
        if (!prompt.trim()) return;
        setAiLoading(true);
        try {
            const { data } = await api.post("/validate", { prompt });
            setAiResult(data.result);
        } catch (err) {
            alert(err.response?.data?.message || "Validation failed");
        } finally {
            setAiLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-emerald-50 to-teal-100 py-10 px-4">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-1">
                    Welcome, {user?.name} 👋
                </h1>
                <p className="text-gray-500 mb-8">
                    Your GreenLoop dashboard
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Upload Card */}
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            📷 Upload Image
                        </h2>
                        <input
                            id="file-input"
                            type="file"
                            accept="image/*"
                            onChange={(e) => setSelectedFile(e.target.files[0])}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-emerald-50 file:text-emerald-700 file:font-semibold hover:file:bg-emerald-100 file:cursor-pointer mb-4"
                        />
                        <button
                            id="upload-btn"
                            onClick={handleUpload}
                            disabled={!selectedFile || uploadLoading}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-50 cursor-pointer"
                        >
                            {uploadLoading ? "Uploading…" : "Upload to Cloudinary"}
                        </button>
                        {uploadedUrl && (
                            <div className="mt-4">
                                <p className="text-sm text-gray-500 mb-2">Uploaded:</p>
                                <img
                                    src={uploadedUrl}
                                    alt="Uploaded"
                                    className="w-full rounded-lg border"
                                />
                            </div>
                        )}
                    </div>

                    {/* AI Validation Card */}
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            🤖 AI Validation
                        </h2>
                        <textarea
                            id="ai-prompt"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            rows={4}
                            placeholder="Enter a prompt for Gemini Flash…"
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition resize-none mb-4"
                        />
                        <button
                            id="validate-btn"
                            onClick={handleValidate}
                            disabled={!prompt.trim() || aiLoading}
                            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-50 cursor-pointer"
                        >
                            {aiLoading ? "Validating…" : "Validate with AI"}
                        </button>
                        {aiResult && (
                            <div className="mt-4 bg-gray-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap">
                                {aiResult}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

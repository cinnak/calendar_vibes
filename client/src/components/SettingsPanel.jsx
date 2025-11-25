import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Plus, Trash2, Save, X } from "lucide-react";
import axios from "axios";

export default function SettingsPanel({ onClose, onSave }) {
    const [rules, setRules] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await axios.get("http://localhost:3000/api/settings");
            if (res.data.rules && res.data.rules.length > 0) {
                setRules(res.data.rules);
            } else {
                // Default rules if empty
                setRules([
                    { keyword: "reading", category: "Reading", color: "#34D399" },
                    { keyword: "1:1", category: "Meeting", color: "#F87171" },
                ]);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const addRule = () => {
        setRules([...rules, { keyword: "", category: "Work", color: "#94A3B8" }]);
    };

    const removeRule = (index) => {
        setRules(rules.filter((_, i) => i !== index));
    };

    const updateRule = (index, field, value) => {
        const newRules = [...rules];
        newRules[index][field] = value;
        setRules(newRules);
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            const res = await axios.post("http://localhost:3000/api/settings/rules", { rules });
            if (res.data.analytics) {
                onSave(res.data.analytics); // Update parent with new data
            }
            onClose();
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <GlassCard className="w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">Categorization Rules</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-slate-400">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                    {rules.map((rule, i) => (
                        <div key={i} className="flex items-center space-x-4 bg-white/5 p-3 rounded-lg border border-white/5">
                            <div className="flex-1">
                                <label className="text-xs text-slate-500 mb-1 block">Keyword</label>
                                <input
                                    type="text"
                                    value={rule.keyword}
                                    onChange={(e) => updateRule(i, "keyword", e.target.value)}
                                    className="w-full bg-transparent border-b border-slate-700 focus:border-blue-500 outline-none text-white py-1"
                                    placeholder="e.g. 'Deep Work'"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="text-xs text-slate-500 mb-1 block">Category</label>
                                <input
                                    type="text"
                                    value={rule.category}
                                    onChange={(e) => updateRule(i, "category", e.target.value)}
                                    className="w-full bg-transparent border-b border-slate-700 focus:border-blue-500 outline-none text-white py-1"
                                    placeholder="e.g. 'Focus'"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 mb-1 block">Color</label>
                                <input
                                    type="color"
                                    value={rule.color}
                                    onChange={(e) => updateRule(i, "color", e.target.value)}
                                    className="h-8 w-8 rounded cursor-pointer bg-transparent border-none"
                                />
                            </div>
                            <button
                                onClick={() => removeRule(i)}
                                className="p-2 text-red-400 hover:bg-red-500/10 rounded-full mt-4"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}
                </div>

                <div className="mt-6 flex justify-between pt-4 border-t border-white/10">
                    <button
                        onClick={addRule}
                        className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 px-4 py-2"
                    >
                        <Plus size={18} />
                        <span>Add Rule</span>
                    </button>

                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                        {loading ? <span>Saving...</span> : (
                            <>
                                <Save size={18} />
                                <span>Save & Analyze</span>
                            </>
                        )}
                    </button>
                </div>
            </GlassCard>
        </div>
    );
}

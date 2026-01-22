import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileAudio, CheckCircle, AlertTriangle, Download, Loader2 } from 'lucide-react';
import axios from 'axios';

function App() {
    const [link, setLink] = useState('');
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [message, setMessage] = useState('');
    const [transcript, setTranscript] = useState('');
    const [model, setModel] = useState('base');

    const handleTranscribe = async () => {
        if (!link) return;
        setStatus('loading');
        setMessage('Queueing job...');
        setTranscript('');

        try {
            // 1. Start Job
            const response = await axios.post('/api/transcribe', {
                drive_link: link,
                model_name: model
            });

            const jobId = response.data.job_id;
            setMessage('Job queued. Waiting for completion...');

            // 2. Poll Status
            const pollInterval = setInterval(async () => {
                try {
                    const statusRes = await axios.get(`/api/job/${jobId}`);
                    const jobData = statusRes.data;

                    if (jobData.status === 'completed') {
                        clearInterval(pollInterval);
                        setTranscript(jobData.transcript);
                        setStatus('success');
                        setMessage('Transcription complete!');
                    } else if (jobData.status === 'failed') {
                        clearInterval(pollInterval);
                        setStatus('error');
                        setMessage(`Error: ${jobData.message}`);
                    } else {
                        // Update progress message if available
                        setMessage(`Status: ${jobData.status} - ${jobData.message || 'Processing...'}`);
                    }
                } catch (err) {
                    console.error("Polling error", err);
                    // Don't stop polling on transient network errors immediately
                }
            }, 3000); // Poll every 3 seconds

        } catch (error) {
            console.error(error);
            setStatus('error');
            setMessage(error.response?.data?.detail || 'Failed to start transcription job.');
        }
    };

    // Auto-download effect
    useEffect(() => {
        if (status === 'success' && transcript) {
            const element = document.createElement("a");
            const file = new Blob([transcript], { type: 'text/plain' });
            element.href = URL.createObjectURL(file);
            element.download = "transcript.txt";
            document.body.appendChild(element); // Required for this to work in FireFox
            element.click();
            document.body.removeChild(element);
        }
    }, [status, transcript]);

    return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4 selection:bg-indigo-500 selection:text-white overflow-hidden relative">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 opacity-20">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600 rounded-full blur-[120px] animate-pulse"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-3xl w-full bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-2xl p-8 shadow-2xl"
            >
                <div className="text-center mb-10">
                    <motion.div
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 mb-6 shadow-lg"
                    >
                        <FileAudio className="w-8 h-8 text-white" />
                    </motion.div>
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 mb-3">
                        Notta Transcriber
                    </h1>
                    <p className="text-slate-400 text-lg">
                        Premium AI-powered audio transcription. Fast, accurate, and secure.
                    </p>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300 ml-1">Google Drive Link</label>
                        <div className="relative group">
                            <input
                                type="text"
                                value={link}
                                onChange={(e) => setLink(e.target.value)}
                                placeholder="https://drive.google.com/file/d/..."
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-4 pl-12 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-600 group-hover:bg-slate-900/80"
                            />
                            <Upload className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5 group-focus-within:text-indigo-400 transition-colors" />
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="space-y-2 flex-1">
                            <label className="text-sm font-medium text-slate-300 ml-1">Model Size</label>
                            <select
                                value={model}
                                onChange={(e) => setModel(e.target.value)}
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-300"
                            >
                                <option value="tiny">Tiny (Fastest)</option>
                                <option value="base">Base (Balanced)</option>
                                <option value="small">Small (Better)</option>
                                <option value="medium">Medium (Best, Slow)</option>
                            </select>
                        </div>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleTranscribe}
                        disabled={status === 'loading' || !link}
                        className={`w-full py-4 rounded-xl font-semibold text-lg shadow-lg flex items-center justify-center gap-2 transition-all ${status === 'loading'
                            ? 'bg-slate-700 cursor-not-allowed text-slate-400'
                            : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-500/20'
                            }`}
                    >
                        {status === 'loading' ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" /> Processing...
                            </>
                        ) : (
                            'Start Transcription'
                        )}
                    </motion.button>

                    <AnimatePresence mode='wait'>
                        {message && (
                            <motion.div
                                key="message"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className={`rounded-lg p-4 flex items-start gap-3 ${status === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                    status === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                        'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                                    }`}
                            >
                                {status === 'error' ? <AlertTriangle className="w-5 h-5 shrink-0" /> :
                                    status === 'success' ? <CheckCircle className="w-5 h-5 shrink-0" /> :
                                        <Loader2 className="w-5 h-5 shrink-0 animate-spin" />}
                                <p className="text-sm font-medium">{message}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                        <div className="text-sm text-amber-200/80">
                            <p className="font-semibold text-amber-400 mb-1">Important:</p>
                            <p>Files are not saved permanently. Your transcript will <strong>automatically download</strong> once complete. Please ensure you save it immediately.</p>
                        </div>
                    </div>

                    {transcript && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-6"
                        >
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-sm font-medium text-slate-300 ml-1">Transcript Preview</label>
                                <button
                                    onClick={() => {
                                        const element = document.createElement("a");
                                        const file = new Blob([transcript], { type: 'text/plain' });
                                        element.href = URL.createObjectURL(file);
                                        element.download = "transcript.txt";
                                        element.click();
                                    }}
                                    className="text-xs flex items-center gap-1 text-indigo-400 hover:text-indigo-300"
                                >
                                    <Download className="w-4 h-4" /> Download Again
                                </button>
                            </div>
                            <textarea
                                readOnly
                                value={transcript}
                                className="w-full h-64 bg-slate-900/50 border border-slate-700 rounded-xl p-4 text-slate-300 text-sm font-light leading-relaxed focus:ring-0 outline-none resize-none"
                            />
                        </motion.div>
                    )}

                </div>
            </motion.div>

            <p className="mt-8 text-slate-600 text-sm">
                Premium Transcription Service &copy; 2026
            </p>
        </div>
    )
}

export default App

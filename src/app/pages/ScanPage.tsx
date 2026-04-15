import Paper from "@/components/Paper";

export default function ScanPage() {
    return (
        <div className="h-full w-full">
            <div className="flex gap-4 h-[calc(100vh-8rem)]">
                {/* Settings/Run Section - Left Side with minimum width */}
                <div className="min-w-96 w-96 flex-shrink-0">
                    <Paper className="h-full p-4">
                        <div className="h-full flex items-center justify-center bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-lg border-2 border-dashed border-emerald-200">
                            <div className="text-center">
                                <h2 className="text-xl font-semibold text-emerald-800 mb-2">Settings / Run</h2>
                                <p className="text-emerald-600 text-sm">Scan configuration and execution controls</p>
                            </div>
                        </div>
                    </Paper>
                </div>

                {/* Live Scan Data Section - Right Side fills remaining space */}
                <div className="flex-1">
                    <Paper className="h-full p-4">
                        <div className="h-full flex items-center justify-center bg-gradient-to-r from-rose-50 to-rose-100 rounded-lg border-2 border-dashed border-rose-200">
                            <div className="text-center">
                                <h2 className="text-xl font-semibold text-rose-800 mb-2">Live Scan Data</h2>
                                <p className="text-rose-600 text-sm">Real-time scan progress and data visualization</p>
                            </div>
                        </div>
                    </Paper>
                </div>
            </div>
        </div>
    );
}
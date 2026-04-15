import Paper from "@/components/Paper";

export default function ControlPage() {
    return (
        <div className="h-full w-full">
            <div className="flex gap-4 h-[calc(100vh-8rem)]">
                {/* Detector Section - Left 1/3 */}
                <div className="w-1/3">
                    <Paper className="h-full p-4">
                        <div className="h-full flex items-center justify-center bg-gradient-to-r from-teal-50 to-teal-100 rounded-lg border-2 border-dashed border-teal-200">
                            <div className="text-center">
                                <h2 className="text-xl font-semibold text-teal-800 mb-2">Detector</h2>
                                <p className="text-teal-600 text-sm">Detector controls and configuration</p>
                            </div>
                        </div>
                    </Paper>
                </div>

                {/* Devices Section - Right 2/3 */}
                <div className="w-2/3">
                    <Paper className="h-full p-4">
                        <div className="h-full flex items-center justify-center bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-lg border-2 border-dashed border-indigo-200">
                            <div className="text-center">
                                <h2 className="text-xl font-semibold text-indigo-800 mb-2">Devices</h2>
                                <p className="text-indigo-600 text-sm">Motor controls, stages, and beamline devices</p>
                            </div>
                        </div>
                    </Paper>
                </div>
            </div>
        </div>
    );
}
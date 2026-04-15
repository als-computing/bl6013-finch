import Paper from "@/components/Paper";

export default function DataPage() {
    return (
        <Paper>
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Data</h1>
                <p className="text-gray-600 text-center max-w-md">
                    Visualize, analyze, and export experimental data. Access data processing tools and visualization options.
                </p>
            </div>
        </Paper>
    );
}
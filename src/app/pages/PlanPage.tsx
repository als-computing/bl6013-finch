import Paper from "@/components/Paper";

export default function PlanPage() {
    return (
        <Paper>
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Plan</h1>
                <p className="text-gray-600 text-center max-w-md">
                    Create and manage experimental plans, queue management, and workflow orchestration.
                </p>
            </div>
        </Paper>
    );
}
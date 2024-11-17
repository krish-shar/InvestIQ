import Chatbot from "@/app/components/ui/chatbot";
import InteractiveChart from "@/app/components/ui/interactive-chart";

export default function DashboardPage() {
  return (
    <div className="flex h-screen">
      {/* Chart Section */}
      <div className="flex-1 p-4">
        <InteractiveChart />
      </div>

      {/* Chatbot Section */}
      <div className="w-1/3 p-4">
        <Chatbot />
      </div>
    </div>
  );
}

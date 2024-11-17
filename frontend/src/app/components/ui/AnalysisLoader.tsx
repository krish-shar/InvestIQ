import { MultiStepLoader } from "@/app/components/ui/multi-step-loader";

type AnalysisLoaderProps = {
  loadingStates: { text: string }[];
  loading: boolean;
  currentStep: number;
};

export function AnalysisLoader({ loadingStates, loading, currentStep }: AnalysisLoaderProps) {
  return (
    <div className="h-screen w-full flex items-center justify-center">
      <MultiStepLoader
        loadingStates={loadingStates}
        loading={loading}
        duration={2000}
        loop={false}
        value={currentStep}
      />
    </div>
  );
}
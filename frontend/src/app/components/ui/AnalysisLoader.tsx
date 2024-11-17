"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MultiStepLoader } from "@/app/components/ui/multi-step-loader";

export default function AnalysisLoaderPage() {
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const router = useRouter();
  const searchParams = useSearchParams();
  const stocksParam = searchParams.get("stocks");
  const selectedStocks = stocksParam ? stocksParam.split(",") : [];

  const generateLoadingStates = (stocks: string[]) => {
    const loadingStates = stocks.flatMap(stock => [
      { text: `Extracting data for ${stock}...` },
      { text: `Analyzing ${stock}...` },
    ]);
    loadingStates.push(
      { text: "Removing fancy jargon..." },
      { text: "Making it simple..." }
    );
    return loadingStates;
  };

  const loadingStates = generateLoadingStates(selectedStocks);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < loadingStates.length - 1) {
          return prev + 1;
        } else {
          clearInterval(timer);
          setLoading(false);
          return prev;
        }
      });
    }, 2000); // Change each step every 2 seconds

    return () => clearInterval(timer);
  }, [loadingStates.length]);

  useEffect(() => {
    if (!loading) {
      const stocksQueryString = selectedStocks.join(",");
      router.push(`/dashboard?stocks=${stocksQueryString}`);
    }
  }, [loading, router, selectedStocks]);
  

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
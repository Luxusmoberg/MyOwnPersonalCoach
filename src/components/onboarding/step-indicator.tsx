import { cn } from "@/lib/utils";

interface StepIndicatorProps {
  currentStep: number;
  steps: { label: string; description: string }[];
}

export function StepIndicator({ currentStep, steps }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-4 mb-12">
      {steps.map((step, i) => (
        <div key={step.label} className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors",
                i < currentStep
                  ? "bg-primary text-primary-foreground"
                  : i === currentStep
                  ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {i < currentStep ? "✓" : i + 1}
            </div>
            <div className="hidden sm:block">
              <p
                className={cn(
                  "text-sm font-medium",
                  i <= currentStep
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {step.label}
              </p>
              <p className="text-xs text-muted-foreground">
                {step.description}
              </p>
            </div>
          </div>
          {i < steps.length - 1 && (
            <div
              className={cn(
                "h-px w-12 transition-colors",
                i < currentStep ? "bg-primary" : "bg-border"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}

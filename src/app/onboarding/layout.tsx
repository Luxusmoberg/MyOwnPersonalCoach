export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-2xl mx-auto py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome to Lucas Coach
        </h1>
        <p className="text-muted-foreground mt-1">
          Let's set up your personal AI coach. This will only take a few minutes.
        </p>
      </div>
      {children}
    </div>
  );
}

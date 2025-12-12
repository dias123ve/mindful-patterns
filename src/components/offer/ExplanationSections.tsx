import React from "react";

const ExplanationSections = () => {
  return (
    <div className="space-y-8">

      {/* Mechanism Card */}
      <div className="bg-card rounded-2xl p-6 md:p-8 shadow-soft border border-border">
        <h2 className="text-xl font-display font-bold text-foreground mb-4">
          The Mechanism Behind Your Score
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Each internal component influences how information is processed, how reactions form, and how decisions are made.
          When one component is less developed than the others, an imbalance appears as recurring emotional patterns,
          inconsistent motivation, or difficulty maintaining clarity under stress.
          The issue is not a lack of capability but a system operating with uneven strength across its parts.
          Understanding this mechanism is the first step toward improving overall system function.
        </p>
      </div>

      {/* Outcomes Card */}
      <div className="bg-card rounded-2xl p-6 md:p-8 shadow-soft border border-border">
        <h2 className="text-xl font-display font-bold text-foreground mb-4">
          What Changes When the System Is Rebalanced
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Strengthening the right internal component makes the system more stable and predictable.
          Typical improvements are practical and gradual.
        </p>
        <ul className="space-y-2 text-muted-foreground text-sm leading-relaxed list-none pl-0">
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
            <span>More steady emotional responses</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
            <span>Clearer priorities and easier decision-making</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
            <span>Motivation that fluctuates less</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
            <span>Smoother communication and clearer boundaries</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
            <span>A more coherent sense of direction</span>
          </li>
        </ul>
      </div>

      {/* Personalized Guidance Card */}
      <div className="bg-card rounded-2xl p-6 md:p-8 shadow-soft border border-border">
        <h2 className="text-xl font-display font-bold text-foreground mb-4">
          Why Personalized Guidance Works
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          General advice assumes everyone struggles for the same reasons, while underlying mechanisms differ between people.
          Two individuals can show similar symptoms but require different internal adjustments.
          Your plan is constructed from your assessment results, focusing on your two strongest components and the one that needs improvement.
          That alignment makes the guidance more precise and the steps easier to apply.
        </p>
      </div>

      {/* Closing line */}
      <div className="text-center py-4">
        <p className="text-foreground font-medium leading-relaxed max-w-2xl mx-auto">
          You already know which part of your system needs support. This gives a clear, practical path to begin.
        </p>
      </div>

    </div>
  );
};

export default ExplanationSections;

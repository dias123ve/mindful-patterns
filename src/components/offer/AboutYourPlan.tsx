import { CheckCircle } from "lucide-react";

const AboutYourPlan = () => {
  const features = [
    "Insights about how each component influences your daily behavior",
    "Common patterns for people with similar profiles",
    "Practical strategies to strengthen the components you want to improve",
    "Simple exercises you can apply in real situations",
  ];

  return (
    <div className="bg-card rounded-2xl p-6 md:p-8 shadow-soft border border-border fade-up" style={{ animationDelay: "0.15s" }}>
      <h2 className="text-xl font-display font-bold text-foreground mb-4">
        About Your Plan
      </h2>
      <p className="text-muted-foreground leading-relaxed mb-6">
        This plan is built from your actual quiz results — your two strongest components and your lowest one. 
        Each guide gives you clear explanations and practical steps tailored to your patterns.
      </p>
      
      <h3 className="text-base font-semibold text-foreground mb-4">
        What You'll Find Inside
      </h3>
      <ul className="space-y-3">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-success shrink-0 mt-0.5" />
            <span className="text-muted-foreground text-sm leading-relaxed">
              {feature}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AboutYourPlan;

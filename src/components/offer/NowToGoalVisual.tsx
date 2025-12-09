import { ArrowRight } from "lucide-react";

interface ComponentData {
  id: string;
  name: string;
  component_key: string;
}

interface NowToGoalVisualProps {
  positiveComponents: ComponentData[];
  negativeComponent: ComponentData | null;
}

const NowToGoalVisual = ({ positiveComponents, negativeComponent }: NowToGoalVisualProps) => {
  return (
    <div className="bg-card rounded-2xl p-6 md:p-8 shadow-soft border border-border fade-up">
      <div className="grid md:grid-cols-[1fr_auto_1fr] gap-6 md:gap-8 items-center">

        {/* NOW SECTION */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Now
          </h3>

          <div className="space-y-3">
            {positiveComponents.map((comp) => (
              <div key={comp.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground font-medium truncate pr-2">
                    {comp.name}
                  </span>
                  <span className="text-muted-foreground font-medium shrink-0">Moderate</span>
                </div>

                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-muted-foreground/40 rounded-full transition-all duration-500"
                    style={{ width: "55%" }}
                  />
                </div>
              </div>
            ))}

            {negativeComponent && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground font-medium truncate pr-2">
                    {negativeComponent.name}
                  </span>
                  <span className="text-warning font-medium shrink-0">Low</span>
                </div>

                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-warning rounded-full transition-all duration-500"
                    style={{ width: "25%" }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ARROW */}
        <div className="hidden md:flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <ArrowRight className="h-5 w-5 text-primary" />
          </div>
        </div>

        <div className="flex md:hidden items-center justify-center py-2">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center rotate-90">
            <ArrowRight className="h-4 w-4 text-primary" />
          </div>
        </div>

        {/* FUTURE STATE */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-success">
            Future You
          </h3>

          <div className="space-y-3">
            {positiveComponents.map((comp) => (
              <div key={comp.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground font-medium truncate pr-2">
                    {comp.name}
                  </span>
                  <span className="text-success font-medium shrink-0">Higher</span>
                </div>

                <div className="h-2 bg-success-light rounded-full overflow-hidden">
                  <div
                    className="h-full bg-success rounded-full transition-all duration-500"
                    style={{ width: "80%" }}
                  />
                </div>
              </div>
            ))}

            {negativeComponent && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground font-medium truncate pr-2">
                    {negativeComponent.name}
                  </span>
                  <span className="text-success font-medium shrink-0">Stronger</span>
                </div>

                <div className="h-2 bg-success-light rounded-full overflow-hidden">
                  <div
                    className="h-full bg-success rounded-full transition-all duration-500"
                    style={{ width: "65%" }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default NowToGoalVisual;

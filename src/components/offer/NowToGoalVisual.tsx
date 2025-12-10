import { ArrowRight } from "lucide-react";

interface ComponentData {
  id: string;
  name: string;
  component_key: string;
}

interface NowToGoalVisualProps {
  positiveComponents: ComponentData[];
  negativeComponent: ComponentData | null;
  componentScores: Record<string, number>;
}

const MAX = 50;

const NowToGoalVisual = ({
  positiveComponents,
  negativeComponent,
  componentScores
}: NowToGoalVisualProps) => {

  const gender = sessionStorage.getItem("gender") === "male" ? "male" : "female";
  const personNow = `/images/${gender}_now.png`;
  const personGoal = `/images/${gender}_goal.png`;

  // ⭐ Width functions (updated)
  const getNowWidth = (score: number, isLow: boolean) => {
    if (isLow) {
      return Math.max((score / MAX) * 40, 10) + "%"; // low minimal 10%
    }
    return Math.max((score / MAX) * 70, 25) + "%"; // moderate minimal 25%
  };

  const getFutureWidth = (isLow: boolean) => {
    return isLow ? "78%" : "92%";
  };

  return (
    <div className="bg-card rounded-2xl p-6 md:p-10 shadow-soft border border-border fade-up">

      <div className="grid md:grid-cols-[1fr_auto_1fr] gap-10 items-start">

        {/* LEFT: NOW */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">
            NOW
          </h3>

          <div className="flex justify-center mb-6">
            <img 
              src={personNow} 
              className="w-full max-w-[120px] object-contain" 
              alt="Now"
            />
          </div>

          <div className="space-y-4">
            {positiveComponents.map((comp) => {
              const score = componentScores[comp.component_key] || 0;

              return (
                <div key={comp.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{comp.name}</span>
                    <span className="text-muted-foreground">Moderate</span>
                  </div>

                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-slate-400/60 rounded-full"
                      style={{ width: getNowWidth(score, false) }}
                    />
                  </div>
                </div>
              );
            })}

            {negativeComponent && (() => {
              const score = componentScores[negativeComponent.component_key] || 0;
              return (
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{negativeComponent.name}</span>
                    <span className="text-warning">Low</span>
                  </div>

                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{ width: getNowWidth(score, true) }}
                    />
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {/* CENTER ARROW */}
        <div className="flex flex-col items-center justify-center gap-6">
          <ArrowRight className="h-8 w-8 text-primary" />
        </div>

        {/* RIGHT: FUTURE YOU */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-success mb-4">
            FUTURE YOU
          </h3>

          <div className="flex justify-center mb-6">
            <img 
              src={personGoal} 
              className="w-full max-w-[120px] object-contain" 
              alt="Goal"
            />
          </div>

          <div className="space-y-4">
            {positiveComponents.map((comp) => (
              <div key={comp.id}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">{comp.name}</span>
                  <span className="text-success">Higher</span>
                </div>

                <div className="h-2 bg-emerald-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: getFutureWidth(false) }}
                  />
                </div>
              </div>
            ))}

            {negativeComponent && (
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">{negativeComponent.name}</span>
                  <span className="text-success">Stronger</span>
                </div>

                <div className="h-2 bg-emerald-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: getFutureWidth(true) }}
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

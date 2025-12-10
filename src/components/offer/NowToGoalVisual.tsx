import { ArrowRight } from "lucide-react";

interface ComponentData {
  id: string;
  name: string;
  component_key: string;
}

interface NowToGoalVisualProps {
  positiveComponents: ComponentData[];
  negativeComponent: ComponentData | null;
  componentScores: Record<string, number>; // NEW
}

const MAX_SCORE = 50;

const NowToGoalVisual = ({
  positiveComponents,
  negativeComponent,
  componentScores
}: NowToGoalVisualProps) => {

  // ambil gender dari sessionStorage
  const gender = sessionStorage.getItem("gender") === "male" ? "male" : "female";

  const personNowSrc = `/images/${gender}_now.png`;
  const personGoalSrc = `/images/${gender}_goal.png`;

  // fungsi hitung bar
  const getNowWidth = (score: number, isLowest: boolean) => {
    if (isLowest) {
      return Math.min((score / MAX_SCORE) * 120, 40) + "%";
    }
    return Math.min((score / MAX_SCORE) * 80, 80) + "%";
  };

  const getGoalWidth = (isLowest: boolean) => {
    return isLowest ? "90%" : "100%";
  };

  return (
    <div className="bg-card rounded-2xl p-6 md:p-8 shadow-soft border border-border fade-up">

      <div className="grid md:grid-cols-[1fr_auto_1fr] gap-6 md:gap-8 items-center">

        {/* NOW SECTION */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Now
          </h3>

          {/* FOTO NOW */}
          <div className="flex justify-center md:hidden mb-4">
            <img
              src={personNowSrc}
              alt="Now avatar"
              className="w-24 h-24 object-contain rounded-xl shadow"
            />
          </div>

          <div className="space-y-3">
            {positiveComponents.map((comp) => {
              const score = componentScores[comp.component_key] || 0;
              return (
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
                      style={{ width: getNowWidth(score, false) }}
                    />
                  </div>
                </div>
              );
            })}

            {negativeComponent && (
              (() => {
                const score = componentScores[negativeComponent.component_key] || 0;
                return (
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
                        style={{ width: getNowWidth(score, true) }}
                      />
                    </div>
                  </div>
                );
              })()
            )}
          </div>
        </div>

        {/* CENTER VISUAL: FOTO NOW → FOTO GOAL */}
        <div className="flex flex-col items-center gap-4">
          <img
            src={personNowSrc}
            alt="Now avatar"
            className="hidden md:block w-24 h-24 object-contain rounded-xl shadow"
          />

          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <ArrowRight className="h-5 w-5 text-primary" />
          </div>

          <img
            src={personGoalSrc}
            alt="Goal avatar"
            className="hidden md:block w-24 h-24 object-contain rounded-xl shadow"
          />
        </div>

        {/* FUTURE SECTION */}
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
                    style={{ width: getGoalWidth(false) }}
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
                    style={{ width: getGoalWidth(true) }}
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

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

const MAX_SCORE = 50;

const NowToGoalVisual = ({
  positiveComponents,
  negativeComponent,
  componentScores
}: NowToGoalVisualProps) => {
  // gender from session (default to female if not set)
  const gender = sessionStorage.getItem("gender") === "male" ? "male" : "female";

  const personNowSrc = `/images/${gender}_now.png`;
  const personGoalSrc = `/images/${gender}_goal.png`;

  /**
   * Now widths:
   * - strongest components scale up to 70%
   * - lowest component uses a "blown" scale (100%) so low scores look visibly small,
   *   but we enforce a minimum width so a tiny score still shows a thin bar
   */
  const getNowWidth = (score: number, isLowest: boolean) => {
    const s = Math.max(0, Number(score || 0));
    if (isLowest) {
      // aggressive scale for low so it looks small, but min 8% and max 40%
      const pct = (s / MAX_SCORE) * 100;
      return Math.max(8, Math.min(pct, 40)) + "%";
    }
    // for non-low (moderate/strong), cap at 70% and ensure minimal visibility if score > 0
    const pct = (s / MAX_SCORE) * 70;
    return (s > 0 ? Math.max(6, Math.min(pct, 70)) : "6%") as any;
  };

  /**
   * Future widths:
   * - not full width to avoid feeling "perfect"
   * - strengths => 92%
   * - weakest => 78%
   */
  const getGoalWidth = (isLowest: boolean) => {
    return isLowest ? "78%" : "92%";
  };

  return (
    <div className="bg-card rounded-2xl p-6 md:p-8 shadow-soft border border-border fade-up">
      <div className="grid md:grid-cols-[1fr_auto_1fr] gap-6 md:gap-8 items-start">
        {/* LEFT: NOW column */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Now
          </h3>

          {/* Avatar on top for desktop */}
          <div className="hidden md:flex justify-center mb-3">
            <img
              src={personNowSrc}
              alt="Now avatar"
              className="w-20 h-20 object-cover rounded-xl shadow"
            />
          </div>

          <div className="space-y-3">
            {positiveComponents.map((comp) => {
              const score = componentScores?.[comp.component_key] ?? 0;
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
                const score = componentScores?.[negativeComponent.component_key] ?? 0;
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

        {/* CENTER: avatar small (mobile) + arrow */}
        <div className="flex flex-col items-center gap-4 justify-start">
          {/* Mobile avatars */}
          <div className="md:hidden flex items-center gap-2">
            <img src={personNowSrc} alt="Now" className="w-16 h-16 object-cover rounded-xl shadow" />
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <ArrowRight className="h-4 w-4 text-primary rotate-90" />
            </div>
            <img src={personGoalSrc} alt="Goal" className="w-16 h-16 object-cover rounded-xl shadow" />
          </div>

          {/* Desktop arrow */}
          <div className="hidden md:flex items-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <ArrowRight className="h-5 w-5 text-primary" />
            </div>
          </div>
        </div>

        {/* RIGHT: FUTURE column */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-success">
            Future You
          </h3>

          {/* Avatar on top for desktop */}
          <div className="hidden md:flex justify-center mb-3">
            <img
              src={personGoalSrc}
              alt="Goal avatar"
              className="w-20 h-20 object-cover rounded-xl shadow"
            />
          </div>

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

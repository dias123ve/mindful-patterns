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

  const gender = sessionStorage.getItem("gender") === "male" ? "male" : "female";

  const personNowSrc = `/images/${gender}_now.png`;
  const personGoalSrc = `/images/${gender}_goal.png`;

  const getModerateWidth = (score: number) => {
    return Math.max((score / MAX_SCORE) * 78, 30);
  };

  const getLowWidth = (score: number) => {
    return Math.max((score / MAX_SCORE) * 45, 18);
  };

  return (
    <div className="bg-card rounded-2xl p-6 md:p-8 shadow-soft border border-border fade-up">

      <div className="grid md:grid-cols-[1fr_auto_1fr] gap-12 items-start">

        {/* NOW SECTION */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-6">
            Now
          </h3>

          {/* FULL-WIDTH PERSON IMAGE */}
          <div className="flex justify-center mb-6">
            <img
              src={personNowSrc}
              alt="Now avatar"
              className="w-[180px] h-auto object-contain"
            />
          </div>

          <div className="space-y-5">

            {/* POSITIVE COMPONENTS */}
            {positiveComponents.map((comp) => {
              const score = componentScores[comp.component_key] || 0;
              const width = getModerateWidth(score);

              return (
                <div key={comp.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{comp.name}</span>
                    <span className="text-muted-foreground">Moderate</span>
                  </div>

                  <div className="relative h-2 bg-muted rounded-full overflow-visible">

                    {/* BAR */}
                    <div
                      className="h-full bg-slate-400/70 rounded-full"
                      style={{ width: width + "%" }}
                    />

                    {/* DOT */}
                    <div
                      className="absolute -top-[3px] h-3 w-3 bg-slate-500 rounded-full shadow-sm"
                      style={{ left: width + "%" }}
                    />
                  </div>
                </div>
              );
            })}

            {/* NEGATIVE COMPONENT */}
            {negativeComponent && (() => {
              const score = componentScores[negativeComponent.component_key] || 0;
              const width = getLowWidth(score);

              return (
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{negativeComponent.name}</span>
                    <span className="text-muted-foreground">Low</span>
                  </div>

                  <div className="relative h-2 bg-muted rounded-full overflow-visible">

                    {/* LOW BAR (still grey) */}
                    <div
                      className="h-full bg-slate-400/70 rounded-full"
                      style={{ width: width + "%" }}
                    />

                    {/* DOT */}
                    <div
                      className="absolute -top-[3px] h-3 w-3 bg-slate-500 rounded-full shadow-sm"
                      style={{ left: width + "%" }}
                    />
                  </div>
                </div>
              );
            })()}

          </div>
        </div>

        {/* CENTER ARROW + PERSON */}
        <div className="flex flex-col items-center gap-6 mt-4">
          <ArrowRight className="h-8 w-8 text-primary" />

          <img
            src={personGoalSrc}
            alt="Goal avatar"
            className="w-[180px] h-auto object-contain"
          />
        </div>

        {/* FUTURE YOU */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-success mb-6">
            Future You
          </h3>

          <div className="space-y-5">

            {/* POSITIVE COMPONENTS */}
            {positiveComponents.map((comp) => {
              const width = 90;

              return (
                <div key={comp.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{comp.name}</span>
                    <span className="text-success">Higher</span>
                  </div>

                  <div className="relative h-2 bg-emerald-100 rounded-full overflow-visible">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: width + "%" }}
                    />

                    {/* DOT */}
                    <div
                      className="absolute -top-[3px] h-3 w-3 bg-emerald-600 rounded-full shadow-sm"
                      style={{ left: width + "%" }}
                    />
                  </div>
                </div>
              );
            })}

            {/* NEGATIVE COMPONENT → Stronger */}
            {negativeComponent && (
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">{negativeComponent.name}</span>
                  <span className="text-success">Stronger</span>
                </div>

                <div className="relative h-2 bg-emerald-100 rounded-full overflow-visible">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: "82%" }}
                  />

                  {/* DOT */}
                  <div
                    className="absolute -top-[3px] h-3 w-3 bg-emerald-600 rounded-full shadow-sm"
                    style={{ left: "82%" }}
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

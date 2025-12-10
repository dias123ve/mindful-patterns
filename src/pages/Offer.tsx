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

  // posisi bar
  const getStrongPos = (score: number) => Math.max((score / MAX_SCORE) * 78, 30);
  const getLowPos = (score: number) => Math.max((score / MAX_SCORE) * 45, 18);

  return (
    <div className="bg-card rounded-2xl p-6 md:p-8 shadow-soft border border-border fade-up max-w-[760px] mx-auto">

      <div className="grid md:grid-cols-[1fr_auto_1fr] gap-4 items-start">

        {/* LEFT — NOW */}
        <div className="text-center">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
            Now
          </h3>

          <img src={personNowSrc} className="w-[200px] h-auto object-contain mx-auto mb-2" />

          <div className="space-y-5">
            {positiveComponents.map((comp) => {
              const score = componentScores[comp.component_key] || 0;
              const pos = getStrongPos(score);

              return (
                <div key={comp.id} className="space-y-1">

                  {/* Title + Status */}
                  <div className="flex justify-between px-1 w-[70%] mx-auto">
                    <span className="text-[15px] font-semibold">{comp.name}</span>
                    <span className="text-[13px] opacity-60">(Strong)</span>
                  </div>

                  {/* TRACK */}
                  <div className="relative h-2 bg-[#D5D7DB] rounded-full w-[70%] mx-auto">

                    {/* BAR */}
                    <div
                      className="absolute h-2 rounded-full"
                      style={{ width: `${pos}%`, backgroundColor: "#FFB74D" }}
                    />

                    {/* DOT */}
                    <div
                      className="absolute -top-[4px] h-3 w-3 rounded-full shadow"
                      style={{ backgroundColor: "#F57C00", left: `${pos}%` }}
                    />
                  </div>
                </div>
              );
            })}

            {/* LOW COMPONENT */}
            {negativeComponent && (() => {
              const score = componentScores[negativeComponent.component_key] || 0;
              const pos = getLowPos(score);

              return (
                <div className="space-y-1">
                  <div className="flex justify-between px-1 w-[70%] mx-auto">
                    <span className="text-[15px] font-semibold">{negativeComponent.name}</span>
                    <span className="text-[13px] opacity-60">(Low)</span>
                  </div>

                  <div className="relative h-2 bg-[#D5D7DB] rounded-full w-[70%] mx-auto">
                    <div
                      className="absolute h-2 rounded-full"
                      style={{ width: `${pos}%`, backgroundColor: "#E57373" }}
                    />
                    <div
                      className="absolute -top-[4px] h-3 w-3 rounded-full shadow"
                      style={{ backgroundColor: "#C62828", left: `${pos}%` }}
                    />
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {/* MIDDLE — BIG ARROW */}
        <div className="flex justify-center items-center pt-14">
          <div className="text-gray-400 text-4xl font-light select-none">
            &gt;&gt;
          </div>
        </div>

        {/* RIGHT — FUTURE YOU */}
        <div className="text-center">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-success mb-3">
            Future You
          </h3>

          <img src={personGoalSrc} className="w-[200px] h-auto object-contain mx-auto mb-2" />

          <div className="space-y-5">

            {/* Elevated components */}
            {positiveComponents.map((comp) => (
              <div key={comp.id} className="space-y-1">

                <div className="flex justify-between px-1 w-[70%] mx-auto">
                  <span className="text-[15px] font-semibold">{comp.name}</span>
                  <span className="text-[13px] opacity-60">(Elevated)</span>
                </div>

                <div className="relative h-2 bg-[#D0E3D5] rounded-full w-[70%] mx-auto">

                  <div className="absolute h-2 bg-emerald-500 rounded-full" style={{ width: "100%" }} />

                  <div
                    className="absolute -top-[4px] h-3 w-3 bg-emerald-600 rounded-full shadow"
                    style={{ left: "92%" }}
                  />
                </div>
              </div>
            ))}

            {/* Steady */}
            {negativeComponent && (
              <div className="space-y-1">

                <div className="flex justify-between px-1 w-[70%] mx-auto">
                  <span className="text-[15px] font-semibold">{negativeComponent.name}</span>
                  <span className="text-[13px] opacity-60">(Steady)</span>
                </div>

                <div className="relative h-2 bg-[#F0E6B8] rounded-full w-[70%] mx-auto">

                  <div
                    className="absolute h-2 rounded-full"
                    style={{ backgroundColor: "#FFD54F", width: "100%" }}
                  />

                  <div
                    className="absolute -top-[4px] h-3 w-3 rounded-full shadow"
                    style={{ backgroundColor: "#FBC02D", left: "82%" }}
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

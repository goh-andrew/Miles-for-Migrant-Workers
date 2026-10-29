import { useId, useState } from "react";
import { FlipTiles } from "./FlipTiles";

const KM = 70.19;
const STEPS = [0.5, 1, 1.5, 2, 2.5, 3, 4, 5];

/**
 * The live thing: pick a pledge per kilometre and the signboard shows what it
 * became over the real 70.19 km. Works with the arrow keys and a thumb.
 */
export function PledgeDial({ active }: { active: boolean }) {
  const [step, setStep] = useState(1);
  const id = useId();
  const perKm = STEPS[step];
  const total = perKm * KM;
  const totalText = total.toFixed(2);

  return (
    <section className="board dial" aria-labelledby={`${id}-h`}>
      <h3 id={`${id}-h`} className="label dial__head">
        Pledge per kilometre
      </h3>
      <p className="body">Supporters paid nothing upfront. After the ride, they paid for the distance we actually covered.</p>
      <p className="dial__try">Try it: what would your pledge have become?</p>
      <label htmlFor={`${id}-r`} className="dial__per">
        <span className="dial__amount">${perKm.toFixed(2)}</span> a kilometre
      </label>
      <input
        id={`${id}-r`}
        className="dial__range"
        type="range"
        min={0}
        max={STEPS.length - 1}
        step={1}
        value={step}
        aria-valuetext={`$${perKm.toFixed(2)} a kilometre`}
        onChange={(e) => setStep(Number(e.target.value))}
      />
      <div className="dial__result" aria-live="polite">
        <FlipTiles value={totalText} prefix="$" active={active} label={`$${totalText}`} />
        <p className="tile-caption">
          ${perKm.toFixed(2)} × {KM} km, paid after the ride
        </p>
      </div>
    </section>
  );
}

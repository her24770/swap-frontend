"use client";

import { useCallback, useId, useRef } from "react";
import { useNonceStyle } from "../../../../../../hooks/useNonceStyle";
import "./RangoSlider.css";

interface RangoSliderProps {
  min: number;
  max: number;
  step?: number;
  valueMin: number;
  valueMax: number;
  onChange: (min: number, max: number) => void;
  formatLabel?: (value: number) => string;
}

export default function RangoSlider({
  min,
  max,
  step = 1,
  valueMin,
  valueMax,
  onChange,
  formatLabel,
}: RangoSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const sliderId = useId();

  const pct = (v: number) => ((v - min) / (max - min)) * 100;

  const handleMinChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const next = Math.min(Number(e.target.value), valueMax - step);
      onChange(next, valueMax);
    },
    [valueMax, step, onChange]
  );

  const handleMaxChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const next = Math.max(Number(e.target.value), valueMin + step);
      onChange(valueMin, next);
    },
    [valueMin, step, onChange]
  );

  const label = formatLabel ?? ((v: number) => String(v));

  const leftPct = pct(valueMin);
  const rightPct = pct(valueMax);

  // Los nonces de CSP no cubren el atributo style="...", el porcentaje
  // calculado en runtime se vuelca a una hoja <style> con nonce, scopeada
  // por id porque puede haber mas de un RangoSlider montado a la vez.
  useNonceStyle(
    `range-slider-dynamic-${sliderId}`,
    `[data-slider-id="${sliderId}"] { left: ${leftPct}%; width: ${rightPct - leftPct}%; }`
  );

  return (
    <div className="range-slider">
      <div className="range-slider__track" ref={trackRef}>
        {/* Track completo */}
        <div className="range-slider__rail" />
        {/* Segmento activo */}
        <div
          className="range-slider__fill"
          data-slider-id={sliderId}
        />
        {/* Input mínimo */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={valueMin}
          onChange={handleMinChange}
          className="range-slider__input range-slider__input--min"
          aria-label="Valor mínimo"
          aria-valuemin={min}
          aria-valuemax={valueMax}
          aria-valuenow={valueMin}
        />
        {/* Input máximo */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={valueMax}
          onChange={handleMaxChange}
          className="range-slider__input range-slider__input--max"
          aria-label="Valor máximo"
          aria-valuemin={valueMin}
          aria-valuemax={max}
          aria-valuenow={valueMax}
        />
      </div>

      {/* Labels */}
      <div className="range-slider__labels">
        <span className="range-slider__label-value">{label(valueMin)}</span>
        <span className="range-slider__label-value">{label(valueMax)}</span>
      </div>
    </div>
  );
}
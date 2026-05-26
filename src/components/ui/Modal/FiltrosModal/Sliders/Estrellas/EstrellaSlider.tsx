"use client";

import RangoSlider from "../Rango/RangoSlider";
import "./EstrellaSlider.css";

interface EstrellaSliderProps {
  valueMin: number;
  valueMax: number;
  onChange: (min: number, max: number) => void;
}

export default function EstrellaSlider({
  valueMin,
  valueMax,
  onChange,
}: EstrellaSliderProps) {
  return (
    <div className="star-range-slider">
      <div className="star-range-slider__container">
        
        {/* Capa de Estrellas de fondo */}
        <div className="star-range-slider__track-stars" aria-hidden>
          {[1, 2, 3, 4, 5].map((star) => {
            const isActive = star >= valueMin && star <= valueMax;
            return (
              <span
                key={star}
                className={`star-range-slider__star-tick${
                  isActive ? " star-range-slider__star-tick--active" : ""
                }`}
              >
                ★
              </span>
            );
          })}
        </div>

        <RangoSlider
          min={0}
          max={5}
          step={1}
          valueMin={valueMin}
          valueMax={valueMax}
          onChange={onChange}
          formatLabel={(v) => (v === 0 ? "Cualquiera" : `${v}★`)}
        />
      </div>
    </div>
  );
}
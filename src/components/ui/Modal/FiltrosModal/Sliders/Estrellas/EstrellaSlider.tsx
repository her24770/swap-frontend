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
      {/* Estrellas visuales */}
      <div className="star-range-slider__stars" aria-hidden>
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`star-range-slider__star${
              star <= valueMax
                ? star <= valueMin
                  ? " star-range-slider__star--full"
                  : " star-range-slider__star--partial"
                : ""
            }`}
          >
            ★
          </span>
        ))}
      </div>

      {/* Slider de rango */}
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
  );
}
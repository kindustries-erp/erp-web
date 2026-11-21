import * as React from "react";
import { V2LoadingSize, type IndicatorProps } from "../V2Loading.type";
import { resolveDimensions } from "./size.helper";

export const SupercarRoadIndicator: React.FC<IndicatorProps> = ({
  size = V2LoadingSize.MD,
  color,
  className,
  ...props
}) => {
  const { width, height } = resolveDimensions(size, 2.2);
  const strokeColor = color ?? "currentColor";
  const fillColor = color ?? "currentColor";

  return (
    <svg
      width={width}
      height={height}
      viewBox="-40 100 620 280"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <defs>
        {/* Chùm sáng đèn pha LED chiếu rọi phía trước */}
        <linearGradient id="supercar-beam" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop stopColor={fillColor} stopOpacity="0.45" offset="0%" />
          <stop stopColor={fillColor} stopOpacity="0" offset="100%" />
        </linearGradient>
      </defs>

      {/* ── 1. Vạch kẻ đường cao tốc trôi nhanh từ phải sang trái ── */}
      <g
        stroke={strokeColor}
        strokeWidth="6"
        strokeLinecap="round"
        opacity="0.35"
      >
        <line x1="600" y1="355" x2="500" y2="355">
          <animate
            attributeName="x1"
            from="620"
            to="-80"
            dur="0.4s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="x2"
            from="520"
            to="-180"
            dur="0.4s"
            repeatCount="indefinite"
          />
        </line>
        <line x1="400" y1="355" x2="300" y2="355">
          <animate
            attributeName="x1"
            from="420"
            to="-280"
            dur="0.4s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="x2"
            from="320"
            to="-380"
            dur="0.4s"
            repeatCount="indefinite"
          />
        </line>
        <line x1="200" y1="355" x2="100" y2="355">
          <animate
            attributeName="x1"
            from="220"
            to="-480"
            dur="0.4s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="x2"
            from="120"
            to="-580"
            dur="0.4s"
            repeatCount="indefinite"
          />
        </line>
      </g>

      {/* ── 2. Vệt gió lướt khí động học sau đuôi xe ── */}
      <g stroke={strokeColor} strokeLinecap="round" opacity="0.4">
        <line x1="-5" y1="215" x2="-35" y2="215" strokeWidth="3.5">
          <animate
            attributeName="x2"
            values="-35;-65;-35"
            dur="0.28s"
            repeatCount="indefinite"
          />
        </line>
        <line x1="0" y1="240" x2="-50" y2="240" strokeWidth="4">
          <animate
            attributeName="x2"
            values="-50;-85;-50"
            dur="0.22s"
            repeatCount="indefinite"
          />
        </line>
        <line x1="-10" y1="280" x2="-40" y2="280" strokeWidth="3">
          <animate
            attributeName="x2"
            values="-40;-60;-40"
            dur="0.32s"
            repeatCount="indefinite"
          />
        </line>
      </g>

      {/* ── 3. Thân xe Supercar chuẩn tỷ lệ cân đối, nhún nhẹ theo tốc độ ── */}
      <g>
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0,0; 0,-1.5; 0,0.8; 0,0"
          dur="0.24s"
          repeatCount="indefinite"
        />

        {/* Chùm sáng đèn trước */}
        <polygon
          points="490,265 580,240 580,310 490,285"
          fill="url(#supercar-beam)"
        />

        {/* Thân xe chính */}
        <path
          fill={fillColor}
          fillOpacity="0.18"
          stroke={strokeColor}
          strokeWidth="4"
          strokeLinejoin="round"
          d="M495,324h-35.3v-10H490v-18.8c0-0.7,0.1-1.4,0.4-2l10.4-23.7l-19.9-14.9
             c-22-16.5-49.2-25.6-76.7-25.6H362c-1,0-2-0.3-2.8-0.9l-44.3-30.1c-24.2-16.4-52.4-25.1-81.6-25.1H128.7L10,209.2v4.8h6
             c2.8,0,5,2.2,5,5v43c0,2.8-2.2,5-5,5h-6v27.3L25,314h25.6v10H22.5c-1.6,0-3-0.7-4-2L1,299c-0.7-0.9-1-1.9-1-3v-34
             c0-2.8,2.2-5,5-5h6v-33H5c-2.8,0-5-2.2-5-5v-13.5c0-2.2,1.4-4.1,3.5-4.8l123-37.5c0.5-0.1,1-0.2,1.5-0.2h105.3
             c31.2,0,61.4,9.3,87.2,26.8l43,29.2h40.7c29.6,0,59,9.8,82.7,27.6l23.1,17.3c1.9,1.4,2.5,3.9,1.6,6L500,296.3V319
             C500,321.8,497.8,324,495,324z"
        />

        {/* Gầm xe */}
        <rect width="71.6" height="8" x="303.2" y="315" fill={fillColor} />
        <rect width="147.7" height="8" x="135.5" y="315" fill={fillColor} />

        {/* Khung kính lái canopy liền mạch thể thao */}
        <path
          fill={fillColor}
          fillOpacity="0.35"
          stroke={strokeColor}
          strokeWidth="2"
          d="M331 227h-75c-.3 0-.5 0-.8-.1l-100.5-15.5 1.5-9.9L256.4 217h59l-4.1-2.9c-24.8-17.7-54-27.1-84.5-27.1h-89.1l-26.2 7.7 24.8 3.8-1.5 9.9-47-7.2c-2.3-.4-4.1-2.3-4.2-4.6-.2-2.3 1.3-4.5 3.6-5.1l48.5-14.2c.5-.1.9-.2 1.4-.2h89.8c32.6 0 63.8 10 90.3 28.9l16.8 12c1.8 1.3 2.5 3.5 1.9 5.6C335.1 225.6 333.2 227 331 227z"
        />

        {/* Hốc hút gió hông khí động học */}
        <path
          fill={fillColor}
          fillOpacity="0.5"
          stroke={strokeColor}
          strokeWidth="2"
          d="M356.2 300.2l-162.6-9.7c-1.4-.1-2.7-.8-3.6-1.9l-30.9-39c-1-1.2-1.3-2.8-.9-4.3s1.4-2.7 2.8-3.4l32.3-14.5c.9-.4 1.8-.5 2.8-.4l158.4 24-1.5 9.9L196 237.2l-25 11.2 25.5 32.2 160.4 9.6L356.2 300.2z"
        />

        {/* Cụm đèn sau & mũi xe */}
        <path
          fill={fillColor}
          d="M37.7 267H16c-2.8 0-5-2.2-5-5v-43c0-2.8 2.2-5 5-5h21.8c2 0 3.8 1.2 4.6 3l10.5 24.5c.6 1.4.5 3.1-.2 4.4l-10.5 18.5C41.2 266 39.5 267 37.7 267z"
        />
        <rect width="31" height="8" x="476" y="264" fill={fillColor} />
      </g>

      {/* ── 4. Bánh xe sau thể thao 8 chấu (xoay tròn 360 độ) ── */}
      <g transform="translate(93.1 295.3)">
        <circle
          cx="0"
          cy="0"
          r="52"
          fill="none"
          stroke={strokeColor}
          strokeWidth="10"
        />
        <circle
          cx="0"
          cy="0"
          r="44"
          fill="none"
          stroke={strokeColor}
          strokeWidth="2"
          opacity="0.5"
        />
        <circle cx="0" cy="0" r="16" fill={fillColor} />
        <g>
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0"
            to="360"
            dur="0.24s"
            repeatCount="indefinite"
          />
          <line
            x1="-38"
            y1="0"
            x2="38"
            y2="0"
            stroke={strokeColor}
            strokeWidth="6"
            strokeLinecap="round"
          />
          <line
            x1="0"
            y1="-38"
            x2="0"
            y2="38"
            stroke={strokeColor}
            strokeWidth="6"
            strokeLinecap="round"
          />
          <line
            x1="-27"
            y1="-27"
            x2="27"
            y2="27"
            stroke={strokeColor}
            strokeWidth="5"
            strokeLinecap="round"
          />
          <line
            x1="-27"
            y1="27"
            x2="27"
            y2="-27"
            stroke={strokeColor}
            strokeWidth="5"
            strokeLinecap="round"
          />
        </g>
      </g>

      {/* ── 5. Bánh xe trước thể thao 8 chấu (xoay tròn 360 độ) ── */}
      <g transform="translate(417.3 295.3)">
        <circle
          cx="0"
          cy="0"
          r="52"
          fill="none"
          stroke={strokeColor}
          strokeWidth="10"
        />
        <circle
          cx="0"
          cy="0"
          r="44"
          fill="none"
          stroke={strokeColor}
          strokeWidth="2"
          opacity="0.5"
        />
        <circle cx="0" cy="0" r="16" fill={fillColor} />
        <g>
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0"
            to="360"
            dur="0.24s"
            repeatCount="indefinite"
          />
          <line
            x1="-38"
            y1="0"
            x2="38"
            y2="0"
            stroke={strokeColor}
            strokeWidth="6"
            strokeLinecap="round"
          />
          <line
            x1="0"
            y1="-38"
            x2="0"
            y2="38"
            stroke={strokeColor}
            strokeWidth="6"
            strokeLinecap="round"
          />
          <line
            x1="-27"
            y1="-27"
            x2="27"
            y2="27"
            stroke={strokeColor}
            strokeWidth="5"
            strokeLinecap="round"
          />
          <line
            x1="-27"
            y1="27"
            x2="27"
            y2="-27"
            stroke={strokeColor}
            strokeWidth="5"
            strokeLinecap="round"
          />
        </g>
      </g>
    </svg>
  );
};

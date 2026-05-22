"use client";

import { useMemo, useEffect } from "react";
import type { Plantation } from "../data/types";

type CoordinateVisualizerProps = {
  plantations: Plantation[];
  currentCorners: { x: string; y: string }[];
  editingId: string | null;
  onOverlapChange?: (hasOverlap: boolean, message: string | null) => void;
};

function isBoundingBoxOverlap(
  c1: { x: number; y: number }[],
  c2: { x: number; y: number }[]
) {
  if (c1.length === 0 || c2.length === 0) return false;

  const minX1 = Math.min(...c1.map(p => p.x));
  const maxX1 = Math.max(...c1.map(p => p.x));
  const minY1 = Math.min(...c1.map(p => p.y));
  const maxY1 = Math.max(...c1.map(p => p.y));

  const minX2 = Math.min(...c2.map(p => p.x));
  const maxX2 = Math.max(...c2.map(p => p.x));
  const minY2 = Math.min(...c2.map(p => p.y));
  const maxY2 = Math.max(...c2.map(p => p.y));

  return !(maxX1 < minX2 || minX1 > maxX2 || maxY1 < minY2 || minY1 > maxY2);
}

export function CoordinateVisualizer({
  plantations,
  currentCorners,
  editingId,
  onOverlapChange,
}: CoordinateVisualizerProps) {
  // Parse current input corners
  const parsedCurrentCorners = useMemo(() => {
    return currentCorners
      .map(c => ({ x: Number(c.x), y: Number(c.y) }))
      .filter(c => !isNaN(c.x) && !isNaN(c.y));
  }, [currentCorners]);

  // Check overlap against other active plantations
  const overlappingPlantations = useMemo(() => {
    if (parsedCurrentCorners.length < 3) return [];
    
    return plantations.filter(p => {
      if (p.plantationId === editingId) return false;
      return isBoundingBoxOverlap(parsedCurrentCorners, p.corners);
    });
  }, [plantations, parsedCurrentCorners, editingId]);

  // Notify parent component about overlap status
  const hasOverlap = overlappingPlantations.length > 0;
  useEffect(() => {
    if (onOverlapChange) {
      if (hasOverlap) {
        const names = overlappingPlantations.map(p => p.plantationName).join(", ");
        onOverlapChange(
          true,
          `Koordinat tumpang tindih dengan plantation: ${names}. Harap sesuaikan kembali.`
        );
      } else {
        onOverlapChange(false, null);
      }
    }
  }, [hasOverlap, overlappingPlantations, onOverlapChange]);

  // Compute bounding box of all coordinates to scale the SVG viewbox dynamically
  const bounds = useMemo(() => {
    const points: { x: number; y: number }[] = [];
    
    plantations.forEach(p => {
      points.push(...p.corners);
    });
    
    if (parsedCurrentCorners.length > 0) {
      points.push(...parsedCurrentCorners);
    }

    if (points.length === 0) {
      return { minX: 0, maxX: 100, minY: 0, maxY: 100, width: 100, height: 100 };
    }

    const xs = points.map(p => p.x);
    const ys = points.map(p => p.y);

    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const rawWidth = maxX - minX;
    const rawHeight = maxY - minY;

    // Add padding (at least 20 units or 20% of range)
    const paddingX = Math.max(20, rawWidth * 0.2);
    const paddingY = Math.max(20, rawHeight * 0.2);

    const finalMinX = minX - paddingX;
    const finalMaxX = maxX + paddingX;
    const finalMinY = minY - paddingY;
    const finalMaxY = maxY + paddingY;

    return {
      minX: finalMinX,
      maxX: finalMaxX,
      minY: finalMinY,
      maxY: finalMaxY,
      width: finalMaxX - finalMinX,
      height: finalMaxY - finalMinY,
    };
  }, [plantations, parsedCurrentCorners]);

  const svgWidth = 500;
  const svgHeight = 350;

  const toSvgX = (x: number) => {
    return ((x - bounds.minX) / bounds.width) * svgWidth;
  };

  const toSvgY = (y: number) => {
    return svgHeight - ((y - bounds.minY) / bounds.height) * svgHeight;
  };

  const currentPointsStr = parsedCurrentCorners
    .map(p => `${toSvgX(p.x)},${toSvgY(p.y)}`)
    .join(" ");

  return (
    <div className="flex flex-col gap-4">
      <div className="relative overflow-hidden rounded-2xl border border-[#DADAD3] bg-[#FFFFF1] p-1 shadow-[0_2px_8px_rgba(26,28,24,0.05)]">
        {/* SVG Map Canvas */}
        <svg
          width="100%"
          height="320"
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="bg-[#fcfcfa] transition-colors duration-200"
          style={{
            backgroundImage: `radial-gradient(circle, #e8e8df 1px, transparent 1px)`,
            backgroundSize: "20px 20px",
          }}
        >
          {/* Legend and Grid Labels */}
          <g opacity="0.35" className="font-mono text-[9px] fill-[#1A1C18]">
            <text x="15" y="25">GRID SCALE</text>
            <line x1="15" y1="30" x2="65" y2="30" stroke="#1A1C18" strokeWidth="1" />
            <circle cx="15" cy="30" r="1.5" />
            <circle cx="65" cy="30" r="1.5" />
          </g>

          {/* Existing Plantations */}
          {plantations.map(p => {
            if (p.plantationId === editingId) return null;
            const pointsStr = p.corners.map(c => `${toSvgX(c.x)},${toSvgY(c.y)}`).join(" ");
            
            return (
              <g key={p.plantationId} className="group">
                <polygon
                  points={pointsStr}
                  fill="rgba(65, 91, 43, 0.08)"
                  stroke="#415B2B"
                  strokeWidth="2"
                  strokeDasharray="4 3"
                  className="transition-all hover:fill-[#415B2B]/15 cursor-pointer"
                />
                {p.corners.map((corner, i) => (
                  <circle
                    key={`c-${p.plantationId}-${i}`}
                    cx={toSvgX(corner.x)}
                    cy={toSvgY(corner.y)}
                    r="4"
                    fill="#415B2B"
                  />
                ))}
                {/* Visual Label */}
                {p.corners[0] && (
                  <text
                    x={toSvgX(p.corners[0].x)}
                    y={toSvgY(p.corners[0].y) - 10}
                    className="font-sans text-[10px] font-bold fill-[#26391B] filter drop-shadow-sm bg-white/80"
                    textAnchor="middle"
                  >
                    {p.plantationName}
                  </text>
                )}
              </g>
            );
          })}

          {/* Currently Edited Plantation Polygon */}
          {parsedCurrentCorners.length >= 2 && (
            <g>
              <polygon
                points={currentPointsStr}
                fill={hasOverlap ? "rgba(186, 26, 26, 0.12)" : "rgba(128, 176, 72, 0.18)"}
                stroke={hasOverlap ? "#BA1A1A" : "#80B048"}
                strokeWidth="2.5"
                className="transition-all duration-200"
              />
              
              {/* Corner handles & text labels */}
              {parsedCurrentCorners.map((corner, i) => {
                const cx = toSvgX(corner.x);
                const cy = toSvgY(corner.y);
                return (
                  <g key={`current-corner-${i}`}>
                    <circle
                      cx={cx}
                      cy={cy}
                      r="6"
                      fill={hasOverlap ? "#BA1A1A" : "#80B048"}
                      className="animate-pulse shadow-md"
                    />
                    <circle cx={cx} cy={cy} r="2" fill="white" />
                    
                    {/* Mono Coordinate Text label */}
                    <text
                      x={cx}
                      y={cy > svgHeight - 30 ? cy - 14 : cy + 20}
                      className="font-mono text-[9px] font-bold fill-[#1A1C18] bg-white/90 px-1 border border-[#DADAD3] rounded"
                      textAnchor="middle"
                    >
                      T{i + 1}({corner.x}, {corner.y})
                    </text>
                  </g>
                );
              })}
            </g>
          )}

          {/* Fallback label if nothing is on map */}
          {plantations.length === 0 && parsedCurrentCorners.length === 0 && (
            <text
              x={svgWidth / 2}
              y={svgHeight / 2}
              textAnchor="middle"
              className="font-sans text-xs fill-[#5F6358]"
            >
              Belum ada data koordinat untuk divisualisasikan.
            </text>
          )}
        </svg>

        {/* Small warning overlay if overlap is detected */}
        {hasOverlap && (
          <div className="absolute inset-x-0 bottom-0 border-t border-[#FFDAD6] bg-[#FFDAD6]/90 px-4 py-2.5 backdrop-blur-sm">
            <p className="flex items-center gap-2 text-xs font-semibold text-[#BA1A1A]">
              <span className="inline-flex size-2 animate-ping rounded-full bg-[#BA1A1A]" />
              Tumpang Tindih Terdeteksi!
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-2">
          <span className="inline-block size-3.5 rounded border border-dashed border-[#415B2B] bg-[#415B2B]/10" />
          <span className="font-medium text-[#3D4038]">Plantation Lain</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block size-3.5 rounded border border-[#80B048] bg-[#80B048]/20" />
          <span className="font-medium text-[#3D4038]">Plantation Ini (Valid)</span>
        </div>
        {hasOverlap && (
          <div className="flex items-center gap-2">
            <span className="inline-block size-3.5 rounded border border-[#BA1A1A] bg-[#BA1A1A]/10" />
            <span className="font-medium text-[#BA1A1A]">Bentrok Koordinat</span>
          </div>
        )}
      </div>
    </div>
  );
}

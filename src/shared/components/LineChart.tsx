import { useState } from 'react';
import { View } from 'react-native';
import Svg, {
  Circle,
  Defs,
  Line,
  LinearGradient,
  Polygon,
  Polyline,
  Stop,
  Text as SvgText,
} from 'react-native-svg';

import { theme } from '@/shared/theme';

export interface ChartDataPoint {
  /** Étiquette courte pour l'axe X (ex. "28/05"). */
  label: string;
  value: number;
}

interface LineChartProps {
  data: ChartDataPoint[];
  /** Unité affichée sur l'axe Y (ex. " kg"). */
  unit?: string;
  /** Couleur de la ligne et des points. */
  color?: string;
  height?: number;
  /** Nombre maximum d'étiquettes visibles sur l'axe X. */
  maxXLabels?: number;
}

// Padding interne du SVG (laisser de la place aux libellés)
const PAD_LEFT = 44;
const PAD_RIGHT = 12;
const PAD_TOP = 16;
const PAD_BOTTOM = 28;

/**
 * Graphique en ligne simple rendu via react-native-svg.
 * Affiche un polyline, une zone sous la courbe (gradient) et des points.
 * Gère les cas limites : 0 point (rendu vide) et 1 point (point seul).
 */
export function LineChart({
  data,
  unit = '',
  color = theme.colors.primary,
  height = 200,
  maxXLabels = 6,
}: LineChartProps) {
  const [containerWidth, setContainerWidth] = useState(0);

  if (data.length === 0 || containerWidth === 0) {
    // Réserve l'espace avant que onLayout ne soit déclenché
    return (
      <View style={{ height }} onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)} />
    );
  }

  const chartW = containerWidth - PAD_LEFT - PAD_RIGHT;
  const chartH = height - PAD_TOP - PAD_BOTTOM;

  const values = data.map((d) => d.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const valRange = maxVal - minVal;

  const scaleY = (val: number): number => {
    if (valRange === 0) return PAD_TOP + chartH / 2;
    return PAD_TOP + chartH - ((val - minVal) / valRange) * chartH;
  };

  const scaleX = (idx: number): number => {
    if (data.length <= 1) return PAD_LEFT + chartW / 2;
    return PAD_LEFT + (idx / (data.length - 1)) * chartW;
  };

  // Chaîne de points pour le polyline (ligne)
  const linePoints = data.map((d, i) => `${scaleX(i)},${scaleY(d.value)}`).join(' ');

  // Polygone pour la zone remplie (ferme vers le bas)
  const areaPoints = [
    ...data.map((d, i) => `${scaleX(i)},${scaleY(d.value)}`),
    `${scaleX(data.length - 1)},${PAD_TOP + chartH}`,
    `${scaleX(0)},${PAD_TOP + chartH}`,
  ].join(' ');

  // Indices des étiquettes X à afficher (sous-échantillonnage si trop de points)
  const step = Math.max(1, Math.ceil(data.length / maxXLabels));
  const xLabelIndices = data.reduce<number[]>((acc, _, i) => {
    if (i % step === 0 || i === data.length - 1) acc.push(i);
    return acc;
  }, []);

  // Étiquettes Y : min et max (ou un seul si valRange === 0)
  const yLabels: Array<{ val: number; y: number }> =
    valRange === 0
      ? [{ val: minVal, y: PAD_TOP + chartH / 2 }]
      : [
          { val: minVal, y: PAD_TOP + chartH },
          { val: maxVal, y: PAD_TOP },
        ];

  const formatVal = (v: number): string =>
    Number.isInteger(v) ? `${v}${unit}` : `${v.toFixed(1)}${unit}`;

  return (
    <View style={{ height }} onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}>
      <Svg width={containerWidth} height={height}>
        <Defs>
          <LinearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={color} stopOpacity="0.3" />
            <Stop offset="1" stopColor={color} stopOpacity="0.02" />
          </LinearGradient>
        </Defs>

        {/* Ligne de base (axe X) */}
        <Line
          x1={PAD_LEFT}
          y1={PAD_TOP + chartH}
          x2={PAD_LEFT + chartW}
          y2={PAD_TOP + chartH}
          stroke={theme.colors.border}
          strokeWidth={1}
        />

        {/* Zone sous la courbe */}
        {data.length > 1 && <Polygon points={areaPoints} fill="url(#areaGrad)" />}

        {/* Ligne */}
        {data.length > 1 && (
          <Polyline
            points={linePoints}
            fill="none"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Points de données */}
        {data.map((d, i) => (
          <Circle
            key={i}
            cx={scaleX(i)}
            cy={scaleY(d.value)}
            r={4}
            fill={color}
            stroke={theme.colors.background}
            strokeWidth={2}
          />
        ))}

        {/* Étiquettes axe X */}
        {xLabelIndices.map((i) => {
          const point = data[i];
          if (point === undefined) return null;
          return (
            <SvgText
              key={i}
              x={scaleX(i)}
              y={height - 4}
              fontSize={9}
              fill={theme.colors.textMuted}
              textAnchor="middle"
            >
              {point.label}
            </SvgText>
          );
        })}

        {/* Étiquettes axe Y */}
        {yLabels.map(({ val, y }, i) => (
          <SvgText
            key={i}
            x={PAD_LEFT - 4}
            y={y + 4}
            fontSize={9}
            fill={theme.colors.textMuted}
            textAnchor="end"
          >
            {formatVal(val)}
          </SvgText>
        ))}
      </Svg>
    </View>
  );
}

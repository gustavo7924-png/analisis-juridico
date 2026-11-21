import React, { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { FunctionalAreaMatrix } from '../types';

interface RiskDistributionChartProps {
  areas: FunctionalAreaMatrix[];
  selectedArea: string;
  onSelectArea: (areaName: string) => void;
}

interface ChartDatum {
  areaNombre: string;
  shortLabel: string;
  critico: number;
  alto: number;
  medio: number;
  total: number;
}

const SHORT_AREA_LABELS: Record<string, string> = {
  'Constitución / Societario': 'Constitución / Societario',
  'Talento Humano y SST': 'Talento Humano y SST',
  'Contratación y Consumidor': 'Contratación y Consumidor',
  'Producto / Propiedad Intelectual / Ambiental': 'Producto / PI / Ambiental',
  'Contabilidad / Tributario / Prevención de Lavado de Activos':
    'Tributario / Contab. / LAFT',
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: ChartDatum }>;
}

const ChartTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (!active || !payload || payload.length === 0) return null;
  const item = payload[0].payload;

  return (
    <div className="rounded-md border border-[#D6D3D1] bg-white px-3.5 py-2.5 text-xs text-[#1C1917] shadow-sm">
      <div className="font-semibold text-[#1C1917]">{item.areaNombre}</div>
      <div className="mt-1.5 space-y-1 tabular-nums">
        <div className="flex items-center justify-between gap-6">
          <span className="text-[#B91C1C] font-medium">Riesgo Crítico</span>
          <span className="font-mono font-semibold">{item.critico}</span>
        </div>
        <div className="flex items-center justify-between gap-6">
          <span className="text-[#B45309] font-medium">Riesgo Alto</span>
          <span className="font-mono font-semibold">{item.alto}</span>
        </div>
        <div className="flex items-center justify-between gap-6">
          <span className="text-[#57534E] font-medium">Riesgo Medio</span>
          <span className="font-mono font-semibold">{item.medio}</span>
        </div>
        <div className="mt-1 flex items-center justify-between gap-6 border-t border-[#E5E0D5] pt-1 font-semibold">
          <span>Total obligaciones</span>
          <span className="font-mono">{item.total}</span>
        </div>
      </div>
    </div>
  );
};

export const RiskDistributionChart: React.FC<RiskDistributionChartProps> = ({
  areas,
  selectedArea,
  onSelectArea,
}) => {
  const { data, totals } = useMemo(() => {
    let totalCritico = 0;
    let totalAlto = 0;
    let totalMedio = 0;

    const chartData: ChartDatum[] = areas.map((area) => {
      let critico = 0;
      let alto = 0;
      let medio = 0;

      area.filas.forEach((row) => {
        if (row.nivelRiesgo === 'CRÍTICO') critico += 1;
        else if (row.nivelRiesgo === 'ALTO') alto += 1;
        else medio += 1;
      });

      totalCritico += critico;
      totalAlto += alto;
      totalMedio += medio;

      return {
        areaNombre: area.areaNombre,
        shortLabel: SHORT_AREA_LABELS[area.areaNombre] || area.areaNombre,
        critico,
        alto,
        medio,
        total: critico + alto + medio,
      };
    });

    return {
      data: chartData,
      totals: {
        critico: totalCritico,
        alto: totalAlto,
        medio: totalMedio,
        all: totalCritico + totalAlto + totalMedio,
      },
    };
  }, [areas]);

  if (data.length === 0) return null;

  const handleBarClick = (entry: ChartDatum | undefined) => {
    if (!entry?.areaNombre) return;
    onSelectArea(
      selectedArea === entry.areaNombre ? 'Todas las Áreas' : entry.areaNombre
    );
  };

  return (
    <section className="mt-8 rounded-md border border-[#E5E0D5] bg-white p-6 print-break-inside-avoid">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#F0ECE3] pb-4">
        <div>
          <h2 className="font-editorial text-xl font-semibold text-[#1C1917]">
            Carga de Cumplimiento y Distribución de Riesgos por Área
          </h2>
          <p className="mt-1 text-xs text-[#57534E]">
            Cantidad de obligaciones normativas y severidad por área funcional. Haz clic en una
            barra para filtrar la matriz inferior.
          </p>
        </div>

        {/* Resumen numérico tabular + leyenda explícita */}
        <div className="flex flex-wrap items-center gap-4 text-xs tabular-nums">
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-[2px] bg-[#B91C1C]" />
            <span className="font-medium text-[#1C1917]">Crítico: {totals.critico}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-[2px] bg-[#D97706]" />
            <span className="font-medium text-[#1C1917]">Alto: {totals.alto}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-[2px] bg-[#57534E]" />
            <span className="font-medium text-[#1C1917]">Medio: {totals.medio}</span>
          </div>
          <span className="text-[#78716C]">·</span>
          <span className="font-semibold text-[#1C1917]">Total: {totals.all}</span>
        </div>
      </div>

      <div className="mt-4 h-[230px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 6, right: 24, left: 8, bottom: 6 }}
            onClick={(state) => {
              const idx =
                typeof state?.activeTooltipIndex === 'number'
                  ? state.activeTooltipIndex
                  : -1;
              if (idx >= 0 && data[idx]) {
                handleBarClick(data[idx]);
              }
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              horizontal={false}
              stroke="#E5E0D5"
            />
            <XAxis
              type="number"
              allowDecimals={false}
              tick={{ fontSize: 11, fill: '#78716C' }}
              axisLine={{ stroke: '#E5E0D5' }}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="shortLabel"
              width={195}
              tick={{ fontSize: 12, fill: '#1C1917', fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: '#FBF9F5' }}
              content={<ChartTooltip />}
            />
            <Bar
              dataKey="critico"
              stackId="risk"
              name="Riesgo Crítico"
              fill="#B91C1C"
              barSize={22}
              className="cursor-pointer"
            />
            <Bar
              dataKey="alto"
              stackId="risk"
              name="Riesgo Alto"
              fill="#D97706"
              barSize={22}
              className="cursor-pointer"
            />
            <Bar
              dataKey="medio"
              stackId="risk"
              name="Riesgo Medio"
              fill="#57534E"
              barSize={22}
              radius={[0, 3, 3, 0]}
              className="cursor-pointer"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {selectedArea !== 'Todas las Áreas' && (
        <div className="mt-2 flex items-center justify-between border-t border-[#F0ECE3] pt-3 text-xs text-[#57534E]">
          <span>
            Filtro activo desde gráfico:{' '}
            <strong className="text-[#1C1917]">{selectedArea}</strong>
          </span>
          <button
            type="button"
            onClick={() => onSelectArea('Todas las Áreas')}
            className="cursor-pointer font-semibold text-[#1E3A8A] hover:underline"
          >
            Mostrar todas las áreas
          </button>
        </div>
      )}
    </section>
  );
};

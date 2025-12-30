"use client";

import * as React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart";
import { useStatistics } from "@/services/reports";
import type { CompetitionLevel } from "@/types/achievement";

import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";

const competitionLevelConfig: Record<
  CompetitionLevel,
  { label: string; color: string }
> = {
  international: {
    label: "Internasional",
    color: "var(--competition-international)",
  },
  national: { label: "Nasional", color: "var(--competition-national)" },
  regional: { label: "Regional", color: "var(--competition-regional)" },
  local: { label: "Lokal", color: "var(--competition-local)" },
};

const chartConfig = {
  international: {
    label: "Internasional",
    color: "var(--competition-international)",
  },
  national: {
    label: "Nasional",
    color: "var(--competition-national)",
  },
  regional: {
    label: "Regional",
    color: "var(--competition-regional)",
  },
  local: {
    label: "Lokal",
    color: "var(--competition-local)",
  },
} satisfies ChartConfig;

const CompetitionLevelChart = () => {
  const { data, isLoading, error } = useStatistics();

  const chartData = React.useMemo(() => {
    if (!data?.competitionLevelDistribution) return [];

    return Object.entries(competitionLevelConfig).map(([level, config]) => {
      const count = data.competitionLevelDistribution[level] || 0;
      return {
        level,
        label: config.label,
        count,
        color: config.color,
      };
    });
  }, [data]);

  const maxValue = React.useMemo(() => {
    if (chartData.length === 0) return 10;
    return Math.max(...chartData.map((d) => d.count), 1);
  }, [chartData]);

  const yAxisMax = Math.ceil(maxValue * 1.2);

  if (error) {
    return (
      <Card className="w-full border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">
            Distribusi Tingkat Kompetisi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-center">
            <p className="text-sm text-destructive">
              Gagal memuat data distribusi kompetisi. Silakan coba lagi.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="w-full border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">
            Distribusi Tingkat Kompetisi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="h-[400px] animate-pulse rounded-lg bg-gray-200"
            aria-label="Loading"
          />
        </CardContent>
      </Card>
    );
  }

  if (chartData.length === 0 || chartData.every((d) => d.count === 0)) {
    return (
      <Card className="w-full border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">
            Distribusi Tingkat Kompetisi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border p-4 text-center">
            <p className="text-sm text-muted-foreground">
              Belum ada data kompetisi untuk ditampilkan.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">
          Distribusi Tingkat Kompetisi
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px] w-full">
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 20,
              right: 20,
              top: 20,
              bottom: 20,
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--chart-grid)"
              horizontal={true}
              vertical={false}
            />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={12}
              tick={{ fontSize: 12, fill: "var(--chart-tick)" }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={12}
              tick={{ fontSize: 12, fill: "var(--chart-tick)" }}
              domain={[0, yAxisMax]}
            />
            <ChartTooltip
              cursor={false}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0]?.payload as (typeof chartData)[0];
                  return (
                    <div className="rounded-lg border bg-white p-3 shadow-lg">
                      <p className="font-medium text-gray-900">{data.label}</p>
                      <p className="text-sm" style={{ color: data.color }}>
                        {`Total: ${data.count.toLocaleString("id-ID")}`}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar
              dataKey="count"
              fill="var(--chart-primary)"
              radius={[8, 8, 0, 0]}
              name="Total Kompetisi"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
        <div className="mt-4 flex flex-wrap justify-center gap-4">
          {chartData.map((item) => (
            <div key={item.level} className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: item.color }}
                aria-hidden="true"
              />
              <span className="text-xs text-gray-600">
                {item.label}: {item.count}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CompetitionLevelChart;

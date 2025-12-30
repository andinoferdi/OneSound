"use client";

import * as React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart";
import { useStatistics } from "@/services/reports";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { format, parse } from "date-fns";

const chartConfig = {
  count: {
    label: "Total Prestasi",
    color: "var(--chart-primary)",
  },
} satisfies ChartConfig;

const formatPeriod = (period: string): string => {
  try {
    const date = parse(period, "yyyy-MM", new Date());
    return format(date, "MMM yyyy");
  } catch {
    return period;
  }
};

const AchievementPeriodChart = () => {
  const { data, isLoading, error } = useStatistics();

  const chartData = React.useMemo(() => {
    if (!data?.byPeriod) return [];

    return Object.entries(data.byPeriod)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([period, count]) => ({
        month: formatPeriod(period),
        period,
        count: count || 0,
      }));
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
          <CardTitle className="text-xl font-semibold text-gray-900">
            Prestasi per Periode
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-center">
            <p className="text-sm text-destructive">
              Gagal memuat data statistik periode. Silakan coba lagi.
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
          <CardTitle className="text-xl font-semibold text-gray-900">
            Prestasi per Periode
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

  if (chartData.length === 0) {
    return (
      <Card className="w-full border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900">
            Prestasi per Periode
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border p-4 text-center">
            <p className="text-sm text-muted-foreground">
              Belum ada data prestasi per periode untuk ditampilkan.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-900">
          Prestasi per Periode
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
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={12}
              tick={{ fontSize: 12, fill: "var(--chart-tick)" }}
              angle={-45}
              textAnchor="end"
              height={80}
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
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-lg border bg-white p-3 shadow-lg">
                      <p className="font-medium text-gray-900">{label}</p>
                      {payload.map((entry, index) => (
                        <p
                          key={index}
                          className="text-sm"
                          style={{ color: entry.color }}
                        >
                          {`Total Prestasi: ${Number(
                            entry.value
                          ).toLocaleString("id-ID")}`}
                        </p>
                      ))}
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
              name="Total Prestasi"
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default AchievementPeriodChart;

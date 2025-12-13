"use client";

import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";
import type { YearData } from "@/lib/database";

interface YearlyCountChartProps {
	data: YearData[];
}

interface MonarchSegment {
	monarch: string;
	startYear: number;
	endYear: number;
	startIndex: number;
	endIndex: number;
}

function shortenMonarchName(name: string): string {
	// "Margrethe II" -> "M II", "Frederik X" -> "F X"
	const parts = name.split(" ");
	if (parts.length >= 2) {
		return `${parts[0][0]} ${parts[1]}`;
	}
	return name;
}

function groupByMonarch(data: YearData[]): MonarchSegment[] {
	const segments: MonarchSegment[] = [];
	let currentMonarch = data[0]?.monarch;
	let startIndex = 0;

	for (let i = 1; i <= data.length; i++) {
		if (i === data.length || data[i].monarch !== currentMonarch) {
			segments.push({
				monarch: currentMonarch,
				startYear: data[startIndex].year,
				endYear: data[i - 1].year,
				startIndex,
				endIndex: i - 1,
			});
			if (i < data.length) {
				currentMonarch = data[i].monarch;
				startIndex = i;
			}
		}
	}

	return segments;
}

export function YearlyCountChart({ data }: YearlyCountChartProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const scrollContainerRef = useRef<HTMLDivElement>(null);
	const svgRef = useRef<SVGSVGElement>(null);
	const yAxisRef = useRef<SVGSVGElement>(null);
	const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

	// Set up resize observer
	useEffect(() => {
		if (!containerRef.current) return;

		const resizeObserver = new ResizeObserver((entries) => {
			for (const entry of entries) {
				const { width } = entry.contentRect;
				setDimensions({ width, height: 400 });
			}
		});

		resizeObserver.observe(containerRef.current);
		return () => resizeObserver.disconnect();
	}, []);

	// Draw chart
	useEffect(() => {
		if (
			!svgRef.current ||
			!yAxisRef.current ||
			!scrollContainerRef.current ||
			dimensions.width === 0 ||
			data.length === 0
		)
			return;

		const margin = { top: 20, right: 20, bottom: 80, left: 50 };
		const barWidth = 24;
		const availableWidth = dimensions.width - margin.left - margin.right;
		const chartWidth = Math.max(
			availableWidth,
			data.length * barWidth + (data.length - 1) * 8,
		);
		const chartHeight = dimensions.height - margin.top - margin.bottom;

		const svg = d3.select(svgRef.current);
		svg.selectAll("*").remove();

		const yAxisSvg = d3.select(yAxisRef.current);
		yAxisSvg.selectAll("*").remove();

		const scrollContainer = scrollContainerRef.current;

		// Scales
		const xScale = d3
			.scaleBand()
			.domain(data.map((d) => d.year.toString()))
			.range([0, chartWidth])
			.padding(0.25);

		const maxCount = d3.max(data, (d) => d.count) ?? 0;
		const yScale = d3
			.scaleLinear()
			.domain([0, maxCount])
			.range([chartHeight, 0]);

		// Main chart group (scrollable content)
		const g = svg.append("g").attr("transform", `translate(0,${margin.top})`);

		// Y-axis group (fixed)
		const yAxisGroup = yAxisSvg
			.append("g")
			.attr("transform", `translate(${margin.left},${margin.top})`);

		// Bars with rounded tops only
		const barGroups = g
			.selectAll(".bar-group")
			.data(data)
			.enter()
			.append("g")
			.attr("class", "bar-group");

		barGroups.each(function (d) {
			const barGroup = d3.select(this);
			const x = xScale(d.year.toString()) ?? 0;
			const y = yScale(d.count);
			const width = xScale.bandwidth();
			const height = chartHeight - yScale(d.count);
			const radius = 4;

			// Create path with rounded top corners only
			const path =
				height > 0
					? `M ${x},${chartHeight}
				   L ${x},${y + radius}
				   Q ${x},${y} ${x + radius},${y}
				   L ${x + width - radius},${y}
				   Q ${x + width},${y} ${x + width},${y + radius}
				   L ${x + width},${chartHeight}
				   Z`
					: "";

			const bar = barGroup
				.append("path")
				.attr("d", path)
				.attr("fill", "#C60C30")
				.attr("class", "bar")
				.style("cursor", "pointer");

			// Hover text (hidden by default, inside bar at top)
			const hoverText = barGroup
				.append("text")
				.attr("x", x + width / 2)
				.attr("y", y + 18)
				.attr("text-anchor", "middle")
				.style("font-size", "11px")
				.style("font-weight", "600")
				.style("fill", "white")
				.style("opacity", 0)
				.style("pointer-events", "none")
				.text(d.count);

			// Hover events
			bar
				.on("mouseenter", () => {
					bar.attr("fill", "#A00A28");
					hoverText.style("opacity", 1);
				})
				.on("mouseleave", () => {
					bar.attr("fill", "#C60C30");
					hoverText.style("opacity", 0);
				});
		});

		// X axis (years) - in scrollable area
		const xAxis = g
			.append("g")
			.attr("transform", `translate(0,${chartHeight})`)
			.call(d3.axisBottom(xScale));

		xAxis
			.selectAll("text")
			.style("text-anchor", "middle")
			.style("font-size", "12px");

		// Y axis - in fixed area
		let ticks: number[] = [];
		if (maxCount <= 5) {
			ticks = d3.range(0, maxCount + 1);
		} else {
			ticks = yScale.ticks(5).filter((t) => Number.isInteger(t));
		}
		yAxisGroup.call(
			d3.axisLeft(yScale).tickValues(ticks).tickFormat(d3.format("d")),
		);

		// Monarch bands
		const monarchSegments = groupByMonarch(data);
		const monarchBandY = chartHeight + 30;

		monarchSegments.forEach((segment) => {
			const startX = xScale(segment.startYear.toString()) ?? 0;
			const endX =
				(xScale(segment.endYear.toString()) ?? 0) + xScale.bandwidth();
			const bandWidth = endX - startX;
			const monarchName = shortenMonarchName(segment.monarch);

			// Draw band background
			g.append("rect")
				.attr("x", startX)
				.attr("y", monarchBandY)
				.attr("width", bandWidth)
				.attr("height", 24)
				.attr("fill", "#F0F0F0")
				.attr("stroke", "#D0D0D0")
				.attr("stroke-width", 1)
				.attr("rx", 3);

			// Draw monarch text
			g.append("text")
				.attr("x", startX + bandWidth / 2)
				.attr("y", monarchBandY + 16)
				.attr("text-anchor", "middle")
				.style("font-size", "11px")
				.style("font-weight", "600")
				.style("fill", "#666")
				.text(monarchName);
		});

		// Scroll to show most recent years
		if (chartWidth > availableWidth) {
			scrollContainer.scrollLeft = chartWidth - availableWidth;
		}

		// Add drag behavior for panning
		let startX = 0;
		let startScrollLeft = 0;

		const dragBehavior = d3
			.drag<SVGSVGElement, unknown>()
			.on("start", (event) => {
				startX = event.x;
				startScrollLeft = scrollContainer.scrollLeft;
				svg.style("cursor", "grabbing");
			})
			.on("drag", (event) => {
				const dx = startX - event.x;
				scrollContainer.scrollLeft = startScrollLeft + dx;
			})
			.on("end", () => {
				svg.style("cursor", "grab");
			});

		svg.call(dragBehavior);
		svg.style("cursor", "grab");
	}, [data, dimensions]);

	const margin = { top: 20, right: 20, bottom: 80, left: 50 };
	const chartContentWidth = Math.max(
		dimensions.width - margin.left - margin.right,
		data.length * 32,
	);

	return (
		<div
			ref={containerRef}
			className="w-full bg-white rounded-lg border border-gray-200 p-4"
		>
			<div className="relative flex">
				<div className="shrink-0">
					<svg
						ref={yAxisRef}
						width={margin.left}
						height={dimensions.height || 400}
					/>
				</div>
				<div
					ref={scrollContainerRef}
					className="flex-1 overflow-x-auto overflow-y-hidden"
				>
					<svg
						ref={svgRef}
						width={chartContentWidth}
						height={dimensions.height || 400}
						className="touch-pan-x"
					/>
				</div>
			</div>
		</div>
	);
}

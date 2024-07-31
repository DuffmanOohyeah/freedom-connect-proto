'use client';
import {
	Chart as ChartJS,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend,
	RadialLinearScale,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import {
	LineProps,
	FormattedData,
	AccelChartProps,
	//AxisRangesProps,
} from '@/types/api/accelerationChart';
import { useEffect, useState } from 'react';
import { FNOLImpact } from '@/types/api';
import LoadingSpinner from '@/app/(site)/components/LoadingSpinner';

const divBy1k = (num: number, absolute: boolean = false): number => {
	let rtnNum: number = num / 1000;
	if (absolute) rtnNum = Math.abs(rtnNum);
	return rtnNum;
};

ChartJS.register(
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend,
	RadialLinearScale
);

const AccelChart = ({ data }: AccelChartProps): JSX.Element => {
	const { x, y, z }: FNOLImpact = data;
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [xData, setXData] = useState<number[]>([]);
	const [yData, setYData] = useState<number[]>([]);
	const [zData, setZData] = useState<number[]>([]);
	const [timestamps, setTimestamps] = useState<number[]>([]);
	const [liabilityPoint, setLiabilityPoint] = useState<FormattedData | null>(
		null
	);
	const [peakYPoint, setPeakYPoint] = useState<FormattedData | null>(null);
	const [peakZPoint, setPeakZPoint] = useState<FormattedData | null>(null);
	const [liability, setLiability] = useState<
		(FormattedData & { liable: boolean }) | null
	>(null);
	const deviceFreq: number = 400;

	/*const getAxisRanges = (data: FNOLImpact): AxisRangesProps => {
		const { x, y, z }: FNOLImpact = data;
		const rtnObj: AxisRangesProps = {
			x: { max: 0, min: 0 },
			y: { max: 0, min: 0 },
			z: { max: 0, min: 0 },
		};

		for (let idx: number = 0; idx < x.length; idx++) {
			const row = {
				x:  divBy1k(x[idx]),
				y:  divBy1k(y[idx]),
				z:  divBy1k(z[idx]),
			};
			if (row.x) {
				if (row.x > rtnObj.x.max) rtnObj.x.max = row.x;
				if (row.x < rtnObj.x.min) rtnObj.x.min = row.x;
			}
			if (row.y) {
				if (row.y > rtnObj.y.max) rtnObj.y.max = row.y;
				if (row.y < rtnObj.y.min) rtnObj.y.min = row.y;
			}
			if (row.z) {
				if (row.z > rtnObj.z.max) rtnObj.z.max = row.z;
				if (row.z < rtnObj.z.min) rtnObj.z.min = row.z;
			}
		}

		return rtnObj;
	};*/

	const setDataAndLiability = () => {
		const newTimestamps: number[] = [];
		const newFormattedData: FormattedData[] = [];

		for (let idx: number = 0; idx < x.length; idx++) {
			const timestamp: number = (x.length / deviceFreq / x.length) * idx;
			newTimestamps.push(timestamp);
			newFormattedData.push({
				index: idx,
				t: timestamp,
				x: divBy1k(x[idx]),
				y: divBy1k(y[idx]),
				z: divBy1k(z[idx]),
				absX: divBy1k(x[idx], true),
				absY: divBy1k(y[idx], true),
				absZ: divBy1k(z[idx], true),
				liabilityPoint: false,
			});
		}

		setTimestamps(newTimestamps);
		setXData(x.map((x) => divBy1k(x)));
		setYData(y.map((y) => divBy1k(y)));
		setZData(z.map((z) => divBy1k(z)));

		const maxAbsXAxis: FormattedData | null = newFormattedData.reduce(
			(prevMax: FormattedData | null, currentItem: FormattedData) => {
				let rtnObj: FormattedData = currentItem;
				if (prevMax) {
					if (currentItem.absX > prevMax.absX) rtnObj = currentItem;
					else rtnObj = prevMax;
				}
				return rtnObj;
			},
			null
		);

		const maxAbsYAxis: FormattedData | null = newFormattedData.reduce(
			(prevMax: FormattedData | null, currentItem: FormattedData) => {
				let rtnObj: FormattedData = currentItem;
				if (prevMax) {
					if (currentItem.absY > prevMax.absY) rtnObj = currentItem;
					else rtnObj = prevMax;
				}
				return rtnObj;
			},
			null
		);

		const maxAbsZAxis: FormattedData | null = newFormattedData.reduce(
			(prevMax: FormattedData | null, currentItem: FormattedData) => {
				let rtnObj: FormattedData = currentItem;
				if (prevMax) {
					if (currentItem.absZ > prevMax.absZ) rtnObj = currentItem;
					else rtnObj = prevMax;
				}
				return rtnObj;
			},
			null
		);

		if (maxAbsXAxis) {
			const { index: idx, x }: FormattedData = maxAbsXAxis;
			if (idx) newFormattedData[idx].liabilityPoint = true;
			setLiabilityPoint(maxAbsXAxis);
			setLiability({
				...maxAbsXAxis,
				liable: x < 0 ? true : false,
			});
		}

		if (maxAbsYAxis) setPeakYPoint(maxAbsYAxis);
		if (maxAbsZAxis) setPeakZPoint(maxAbsZAxis);
	};

	useEffect(() => {
		setIsLoading(true);
		setDataAndLiability();
		setIsLoading(false);
	}, [data]);

	const lineProps: LineProps = {
		options: {
			responsive: true,
			maintainAspectRatio: true,
			elements: {
				point: {
					radius: 0,
				},
				line: {
					borderWidth: 1,
				},
			},
			scales: {
				x: {
					type: 'linear',
					beginAtZero: true,
					ticks: {
						count: 1000,
					},
					grid: {
						display: false,
					},
					title: {
						display: true,
						text: 'Time (s)',
					},
				},
				y: {
					title: {
						display: true,
						text: 'Acceleration (g)',
					},
					stacked: false,
				},
			},
			plugins: {
				legend: {
					position: 'bottom' as const,
					display: true,
				},
				tooltip: {
					enabled: true,
				},
			},
		},
		data: {
			labels: timestamps,
			datasets: [
				{
					label: 'X-Acceleration',
					stack: 'combined',
					type: 'line',
					data: xData,
					borderColor: 'rgb(220, 9, 73)',
					backgroundColor: 'rgba(220, 9, 73, 0.5)',
				},

				{
					label: 'Y-Acceleration',
					stack: 'combined',
					type: 'line',
					data: yData,
					borderColor: 'rgb(55, 197, 240)',
					backgroundColor: 'rgba(55, 197, 240, 0.5)',
				},
				{
					label: 'Z-Acceleration',
					stack: 'combined',
					type: 'line',
					data: zData,
					borderColor: 'rgb(233, 173, 35)',
					backgroundColor: 'rgba(233, 173, 35, 0.5)',
				},
			],
		},
	};

	if (liabilityPoint) {
		lineProps.data.datasets.push({
			label: 'Liability Point',
			stack: 'combined',
			type: 'line',
			data: [
				{
					x: liabilityPoint.t,
					y: liabilityPoint.x, // WB: I know, this looks odd
				},
			],
			borderColor: `${
				liability &&
				(liability.liable
					? 'rgba(220, 38, 38, 1.0)'
					: 'rgba(21, 128, 61, 1.0)')
			}`,
			backgroundColor: `${
				liability &&
				(liability.liable
					? 'rgba(220, 38, 38, 0.6)'
					: 'rgba(21, 128, 61, 0.7)')
			}`,
			pointStyle: 'circle',
			pointRadius: 10,
			pointHoverRadius: 15,
		});
	}

	if (peakYPoint) {
		lineProps.data.datasets.push({
			label: 'Peak Y Point',
			stack: 'combined',
			type: 'line',
			data: [
				{
					x: peakYPoint.t,
					y: peakYPoint.y,
				},
			],
			borderColor: 'rgb(55, 197, 240)',
			backgroundColor: 'rgba(55, 197, 240, 0.1)',
			pointStyle: 'triangle',
			pointRadius: 10,
			pointHoverRadius: 15,
			hidden: true,
		});
	}

	if (peakZPoint) {
		lineProps.data.datasets.push({
			label: 'Peak Z Point',
			stack: 'combined',
			type: 'line',
			data: [
				{
					x: peakZPoint.t,
					y: peakZPoint.z,
				},
			],
			borderColor: 'rgb(233, 173, 35)',
			backgroundColor: 'rgba(233, 173, 35, 0.1)',
			pointStyle: 'rect',
			pointRadius: 10,
			pointHoverRadius: 15,
			hidden: true,
		});
	}

	return (
		<div className='bg-white rounded-2xl shadow-tile-shadow px-8 py-6 mt-6 w-full h-full relative'>
			<div className='flex flex-col gap-2'>
				<div className='flex flex-row justify-between'>
					<h1 className='text-lg font-semibold mb-10'>
						Acceleration diagram
					</h1>
					{liability && (
						<div className='flex flex-row gap-4 border rounded-lg p-2 text-sm items-center'>
							Liability Prediction:
							<span
								className={`p-2 rounded text-white ${
									liability.liable
										? 'bg-red-600'
										: 'bg-green-700'
								}`}
							>
								{!liability.liable && 'Not '}
								Liable
							</span>
						</div>
					)}
				</div>
				{isLoading ? (
					<LoadingSpinner />
				) : (
					<Line options={lineProps.options} data={lineProps.data} />
				)}
			</div>
		</div>
	);
};

export default AccelChart;

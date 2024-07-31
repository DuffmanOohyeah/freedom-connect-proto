'use client';
import {
	Chart as ChartJS,
	LinearScale,
	PointElement,
	LineElement,
	TimeScale,
	Title,
	Tooltip,
	Legend,
	ChartDataset,
	ChartOptions,
	CategoryScale,
	RadialLinearScale,
} from 'chart.js/auto';
import { Bar } from 'react-chartjs-2';
import { useEffect, useState } from 'react';
import { Waypoint } from '@/types/api';
import 'chartjs-adapter-moment';
import { format } from 'date-fns';

ChartJS.register(
	LinearScale,
	PointElement,
	LineElement,
	TimeScale,
	Title,
	Tooltip,
	Legend,
	CategoryScale,
	RadialLinearScale
);

const TripSpeedChart = ({
	waypoints,
}: {
	waypoints: Waypoint[];
}): JSX.Element => {
	const [chartLabel, setChartLabel] = useState<string>('');
	const [labels, setLabels] = useState<string[]>([]);
	const [speed, setSpeed] = useState<number[]>([]);

	useEffect(() => {
		const preLabels: string[] = [];
		const preSpeed: number[] = [];

		waypoints.map((row, idx) => {
			const dtLocal: Date =
				new Date(row.dtmutc) || new Date(row.localDTM);

			if (row.speedMph > 0) {
				preLabels.push(format(dtLocal, 'HH:mm:ss'));
				preSpeed.push(row.speedMph);
			}

			if (idx === waypoints.length - 1)
				setChartLabel(
					`Event Date: ${format(dtLocal, 'EEEE do MMMM yyyy')}`
				);
		});

		setLabels(preLabels);
		setSpeed(preSpeed);
	}, [waypoints]);

	const datasets: ChartDataset<'bar'>[] = [
		{
			label: 'Speed (MPH)',
			backgroundColor: 'rgba(255, 99, 132, 0.75)',
			borderColor: 'rgb(0,0,0)',
			borderWidth: 0.5,
			data: speed,
		},
	];

	const options: ChartOptions = {
		plugins: {
			title: {
				display: true,
				text: chartLabel,
			},
		},
		/*scales: {
			x: {
				type: 'time',
				//min: new Date('2019-01-01').valueOf(),
				//max: new Date('2019-12-31').valueOf(),
			},
			y: {
				type: 'linear',
				//min: 0,
				//max: 100,
			},
		},*/
	};

	return (
		<Bar
			data={{
				datasets: datasets,
				labels: labels,
			}}
			options={options}
		/>
	);
};

export default TripSpeedChart;

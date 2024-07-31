import {
	GetScoreRes,
	ScoreDatum,
	DatumScore,
	GetScoreResScore,
} from '@/types/api';
import { BaseUrl, getApiHeaders, fullSignOut } from '@/app/utils';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { format, sub } from 'date-fns';
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Disclosure, Transition } from '@headlessui/react';
import LoadingSpinner from './LoadingSpinner';
import { getColourAndText } from './ScoresOverview';

// convert a string in format of dd/MM/yy to a date object
const convertDate = (dateString: string): Date => {
	const dateParts = dateString.split('/');
	return new Date(
		parseInt(`20${dateParts[2]}`),
		parseInt(dateParts[1]) - 1,
		parseInt(dateParts[0])
	);
};

const ScoresTable = ({ opid }: { opid: string }): JSX.Element => {
	const dtMask: string = 'yyyy-MM-dd';
	const [startDate, setStartDate] = useState<string>(
		format(
			sub(new Date(), {
				days: 7,
			}),
			dtMask
		)
	);
	const [endDate, setEndDate] = useState<string>(format(new Date(), dtMask));
	const [scoresArr, setScoresArr] = useState<GetScoreResScore[]>([]);
	const { isLoading, isError } = useQuery(
		['getScoreData', startDate, endDate],
		async () => {
			const response = await fetch(
				`${BaseUrl}/portal/score?opid=${opid}&f=${startDate}&t=${endDate}`,
				{
					method: 'GET',
					headers: await getApiHeaders(),
				}
			);

			if (!response.ok) {
				const res = await response.json();
				if (res.errorMessage == 'Unauthorised') fullSignOut();
				throw new Error('Network response was not ok');
			}

			const scoresRes = (await response.json()) as GetScoreRes;
			setScoresArr(scoresRes.scores);
			return true;
		},
		{
			retry: false,
		}
	);

	return (
		<>
			{isError && (
				<div className='h-full w-full text-center m-8'>
					<p> Sorry an error occurred</p>
				</div>
			)}
			{isLoading && (
				<div className='h-full w-full text-center m-8'>
					<LoadingSpinner />
				</div>
			)}
			{scoresArr && (
				<div className='flex flex-col bg-white rounded-2xl shadow-tile-shadow px-8 py-6 mt-16'>
					<div className='flex flex-row justify-between mb-10'>
						<h1 className='basis-1/8 text-lg font-semibold flex items-center mr-4'>
							Scores
							{!isLoading && scoresArr.length > 0 && (
								<span className='text-sm'>
									&nbsp;&nbsp;&nbsp; (Records found:{' '}
									{scoresArr.length})
								</span>
							)}
						</h1>

						<div className='flex justify-end whitespace-pre'>
							<label className='inline-block mr-4'>
								<span className='mr-2 font-semibold'>From</span>
								<input
									className={`w-48 border-0 bg-placeholder-bg font-medium focus:text-black focus:font-normal focus:ring-0 shadow-none ${
										startDate
											? 'text-black'
											: 'text-placeholder-text'
									}`}
									type='date'
									value={startDate}
									onChange={(
										e: React.ChangeEvent<HTMLInputElement>
									) => setStartDate(e.target.value)}
								/>
							</label>
							<label className='inline-block'>
								<span className='mr-2 font-semibold'>To</span>
								<input
									className={`w-48 border-0 bg-placeholder-bg font-medium focus:text-black focus:font-normal focus:ring-0 shadow-none ${
										endDate
											? 'text-black'
											: 'text-placeholder-text'
									}`}
									type='date'
									value={endDate}
									onChange={(
										e: React.ChangeEvent<HTMLInputElement>
									) => setEndDate(e.target.value)}
								/>
							</label>
							{/* <button
								onClick={() => queryClient.refetchQueries(['getScoreData'])}
								className='text-xs text-white font-semibold bg-shark hover:bg-shark-450 shadow-tile-shadow px-4 py-2 rounded-full flex items-center cursor-pointer'
							>
								Search
							</button> */}
						</div>
					</div>
					{(isLoading || !scoresArr) && (
						<div className='bg-white h-36 w-full  rounded-xl px-4 py-2 text-shark shadow-tile-shadow'>
							<div className='bg-gray-200 w-24 h-8 rounded' />
						</div>
					)}
					{!isLoading &&
						(scoresArr.length > 0 ? (
							<div className='max-h-96 overflow-y-auto'>
								<table className='w-full table-auto zebraTable'>
									<tbody>
										{scoresArr
											.sort(
												(
													a: GetScoreResScore,
													b: GetScoreResScore
												): number => {
													a.scoresByDay.day;
													const aDate: Date =
														convertDate(
															a.scoresByDay.day
														);
													const bDate: Date =
														convertDate(
															b.scoresByDay.day
														);

													const aTime: number =
														aDate.getTime();
													const bTime: number =
														bDate.getTime();

													let rtnInt: number = 0;
													if (aTime > bTime)
														rtnInt = -1;
													else if (aTime < bTime)
														rtnInt = 1;
													return rtnInt;
												}
											)
											.map((dayScore, idx) => {
												const { scoresByDay } =
													dayScore;
												const { data, day } =
													scoresByDay;

												return (
													<Disclosure key={idx}>
														{({ open }) => (
															<DayScoreDetails
																dayData={data}
																date={day}
																open={open}
															/>
														)}
													</Disclosure>
												);
											})}
									</tbody>
								</table>
							</div>
						) : (
							<div className='flex items-center justify-center h-24 w-full'>
								<h1 className='text-xl font-light'>{`No score data was found between the selected dates`}</h1>
							</div>
						))}
				</div>
			)}
		</>
	);
};

const getPeriodData = (data: ScoreDatum[], days: number): DatumScore | null => {
	const filtered = data.filter((row) => {
		const score = row.score;
		if (score.periodDays === days && score.periodType === 'Driving Days')
			return true;
	});
	if (filtered.length === 1) return filtered[0].score;
	else if (filtered.length > 1) throw new Error('too much data');
	else return null;
};

const getValueFromScores = (
	name: string,
	scores: DatumScore | null
): string => {
	let rtnScore: number | string = 'N/A';
	if (scores) {
		const filtered = scores.scores.filter((x) => x.type === name);
		if (filtered && filtered[0] && filtered[0].score)
			rtnScore = filtered[0].score;
	}
	return rtnScore;
};

const DayScoreDetails = ({
	dayData,
	open,
	date,
}: {
	dayData: ScoreDatum[];
	open: boolean;
	date: string;
}): JSX.Element => {
	const day7 = dayData.find((x) => {
		if (x.score.periodDays === 7 && x.score.periodType === 'Calendar Days')
			return true;
	});
	const distance = day7?.score?.distanceMiles ?? '',
		overall = getPeriodData(dayData, 90),
		days30 = getPeriodData(dayData, 30),
		days14 = getPeriodData(dayData, 14),
		days7 = getPeriodData(dayData, 7);

	const overallScore: number = parseFloat(
		getValueFromScores('weighted-total', overall)
	);
	const subColour = getColourFromValue(overallScore);
	const subColourString = `${subColour.border} ${subColour.fill}`;

	return (
		<>
			<tr className='text-xs text-shark'>
				<td className='py-6 pl-8'>{date}</td>
				<td className='py-6'>
					<span className='font-semibold  px-4 py-1 ml-2'>
						{distance}
					</span>
				</td>
				<td className='py-6'>(90 driving days)</td>
				<td className='py-6 text-center'>
					<ScorePill
						label='Overall'
						score={getValueFromScores('weighted-total', overall)}
					/>
				</td>
				<td className='py-6 text-center'>
					<ScorePill
						label='Speed'
						score={getValueFromScores('speeding', overall)}
					/>
				</td>
				<td className='py-6 text-center'>
					<ScorePill
						label='Braking'
						score={getValueFromScores('harsh-braking', overall)}
					/>
				</td>
				<td className='py-6 text-center'>
					<ScorePill
						label='Night Driving'
						score={getValueFromScores('night-driving', overall)}
					/>
				</td>
				<td className='pr-8 py-6 flex justify-end'>
					<Disclosure.Button>
						<ChevronDownIcon
							className={`${
								open && '-rotate-180'
							} transform duration-200 h-4 cursor-pointer`}
						/>
					</Disclosure.Button>
				</td>
			</tr>
			<Transition
				as='tr'
				enter='transition-opacity duration-150'
				enterFrom='opacity-0'
				enterTo='opacity-100'
				leave='transition-opacity duration-100'
				leaveFrom='opacity-100'
				leaveTo='opacity-0'
			>
				<Disclosure.Panel
					as='td'
					className={`overflow-hidden h-[206px] relative border-l-4 ${subColourString}`}
					colSpan={8}
				>
					<div className='absolute inset-0 overflow-hidden overflow-x-scroll pt-8 px-8'>
						<div className='w-full flex gap-32 snap-x overflow-x-scroll pb-8'>
							<ScoreSubsection
								label={'Overall'}
								days90={getValueFromScores(
									'weighted-total',
									overall
								)}
								days30={getValueFromScores(
									'weighted-total',
									days30
								)}
								days14={getValueFromScores(
									'weighted-total',
									days14
								)}
								days7={getValueFromScores(
									'weighted-total',
									days7
								)}
							/>
							<ScoreSubsection
								label={'Speed'}
								days90={getValueFromScores('speeding', overall)}
								days30={getValueFromScores('speeding', days30)}
								days14={getValueFromScores('speeding', days14)}
								days7={getValueFromScores('speeding', days7)}
							/>
							<ScoreSubsection
								label={'Braking'}
								days90={getValueFromScores(
									'harsh-braking',
									overall
								)}
								days30={getValueFromScores(
									'harsh-braking',
									days30
								)}
								days14={getValueFromScores(
									'harsh-braking',
									days14
								)}
								days7={getValueFromScores(
									'harsh-braking',
									days7
								)}
							/>
							<ScoreSubsection
								label={'Night'}
								days90={getValueFromScores(
									'night-driving',
									overall
								)}
								days30={getValueFromScores(
									'night-driving',
									days30
								)}
								days14={getValueFromScores(
									'night-driving',
									days14
								)}
								days7={getValueFromScores(
									'night-driving',
									days7
								)}
							/>
							<ScoreSubsection
								label={'Cornering'}
								days90={getValueFromScores(
									'harsh-cornering',
									overall
								)}
								days30={getValueFromScores(
									'harsh-cornering',
									days30
								)}
								days14={getValueFromScores(
									'harsh-cornering',
									days14
								)}
								days7={getValueFromScores(
									'harsh-cornering',
									days7
								)}
							/>
							<ScoreSubsection
								label={'Motorway'}
								days90={getValueFromScores(
									'road-types',
									overall
								)}
								days30={getValueFromScores(
									'road-types',
									days30
								)}
								days14={getValueFromScores(
									'road-types',
									days14
								)}
								days7={getValueFromScores('road-types', days7)}
							/>
							<ScoreSubsection
								label={'Idling'}
								days90={getValueFromScores('idling', overall)}
								days30={getValueFromScores('idling', days30)}
								days14={getValueFromScores('idling', days14)}
								days7={getValueFromScores('idling', days7)}
							/>
							<ScoreSubsection
								label={'Acceleration'}
								days90={getValueFromScores(
									'harsh-accel',
									overall
								)}
								days30={getValueFromScores(
									'harsh-accel',
									days30
								)}
								days14={getValueFromScores(
									'harsh-accel',
									days14
								)}
								days7={getValueFromScores('harsh-accel', days7)}
							/>
							<ScoreSubsection
								label={'Urban'}
								days90={getValueFromScores('urban', overall)}
								days30={getValueFromScores('urban', days30)}
								days14={getValueFromScores('urban', days14)}
								days7={getValueFromScores('urban', days7)}
							/>
						</div>
					</div>
				</Disclosure.Panel>
			</Transition>
		</>
	);
};

const ScoreSubsection = ({
	label,
	days90,
	days30,
	days14,
	days7,
}: {
	label: string;
	days90: string;
	days30: string;
	days14: string;
	days7: string;
}): JSX.Element => {
	return (
		<>
			{days90 !== 'N/A' && (
				<div className='snap-start flex flex-col gap-4 text-xs min-w-[100px]'>
					<div className='flex flex-row gap-2 justify-between'>
						<h4 className='font-medium'>{label}</h4>
						<h4 className='font-medium'>{days90}</h4>
					</div>
					<div className='flex flex-row gap-2 justify-between'>
						<p className=''>30</p>
						<p className=''>{days30}</p>
					</div>
					<div className='flex flex-row gap-2 justify-between'>
						<p className=''>14</p>
						<p className=''>{days14}</p>
					</div>
					<div className='flex flex-row gap-2 justify-between'>
						<p className=''>7</p>
						<p className=''>{days7}</p>
					</div>
				</div>
			)}
		</>
	);
};

const getColourFromValue = (
	value: number | null
): { fill: string; border: string } => {
	/*0-40 Very  High Risk
		40.1-52.9 High
		53 - 59.9 Low
		60-69.9 Goof
		70-79.9 Great
		80+ Excellent
	*/
	if (value) {
		if (value < 53) {
			return {
				fill: 'bg-score-red',
				border: 'border-score-red',
			};
		} else if (value >= 53 && value < 70) {
			return {
				fill: 'bg-score-yellow',
				border: 'border-score-yellow',
			};
		} else {
			return {
				fill: 'border-jagged-ice',
				border: 'bg-jagged-ice-500/25',
			};
		}
	} else {
		return {
			fill: 'border-grey',
			border: 'bg-grey-500/25',
		};
	}
};

const ScorePill = ({
	label,
	score,
}: {
	label: string;
	score: string;
}): JSX.Element => {
	const { colour } = getColourAndText(parseFloat(score));
	return (
		<span className='flex flex-row justify-center gap-2 items-center'>
			{label}
			<span
				className={`${colour} font-semibold rounded-full px-4 py-1 ml-2`}
			>
				{score}
			</span>
		</span>
	);
};

/*const DynamicScoreField = () => {
	return (
		<td className='py-6 text-center'>
			<ScorePill
				label='Overall'
				score={getValueFromScores('weighted-total', overall)}
			/>
		</td>
	);
};*/

export default ScoresTable;
export { getPeriodData, getValueFromScores };

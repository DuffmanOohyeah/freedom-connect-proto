import { CardProps, ColourAndTextProps } from '@/types/api/scoreDetails';
import {
	DatumScore,
	GetPolicyRes,
	GetScoreRes,
	GetScoreResScore,
} from '@/types/api';
import { getPeriodData, getValueFromScores } from './ScoresTable';
import { PolicyContextInterface, PolicyContext } from './PolicyContext';
import { useContext, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, sub } from 'date-fns';
import { BaseUrl, fullSignOut, getApiHeaders } from '@/app/utils';
import LoadingSpinner from './LoadingSpinner';
import { CardAttsProps } from '@/types/api/scoresOverview';

const ScoresOverview = ({ opid }: { opid: string }): JSX.Element => {
	const { policy } = useContext<PolicyContextInterface>(PolicyContext);
	const cardAtts: CardAttsProps = {
		scores: { overall: 0, speed: 0, brake: 0, night: 0 },
		badges: { overall: '', speed: '', brake: '', night: '' },
	};
	let u4r: boolean = false; // usedFofReporting (local var - to test below)
	const drivingDays: number = 90;
	const dtMask: string = 'yyyy-MM-dd';
	const fromDate: string = format(
		sub(new Date(), {
			days: drivingDays,
		}),
		dtMask
	);
	const toDate: string = format(new Date(), dtMask);
	const [scoresArr, setScoresArr] = useState<GetScoreResScore[]>([]);

	const { isLoading } = useQuery(
		['getScoreData', fromDate, toDate],
		async () => {
			const response = await fetch(
				`${BaseUrl}/portal/score?opid=${opid}&f=${fromDate}&t=${toDate}`,
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
			setScoresArr(scoresRes.scores || []);
			return true;
		},
		{
			retry: false,
		}
	);

	if (!isLoading) {
		/* start: set up default card scores/badges */
		if (policy) {
			const { score }: GetPolicyRes = policy;
			if (score) {
				cardAtts.scores.overall = Number(score.overall);
				cardAtts.scores.speed = Number(score.speed);
				cardAtts.scores.brake = Number(score.brake);
				cardAtts.scores.night = Number(score.night);
				cardAtts.badges.overall = score.overallBadge || '';
				cardAtts.badges.speed = score.speedBadge || '';
				cardAtts.badges.brake = score.brakeBadge || '';
				cardAtts.badges.night = score.nightBadge || '';
			}
		}
		/* end: set up default card scores/badges */

		/* start: get the scores/badges from the data */
		scoresLoop: for (let idx = 0; idx < scoresArr.length; idx++) {
			const {
				scoresByDay: { data, day },
			} = scoresArr[idx];
			const periodData: DatumScore | null = getPeriodData(
				data,
				drivingDays
			);

			if (periodData) {
				const { usedForReporting } = periodData;

				/*if (idx === scoresArr.length - 1) {
					const day2Str: string = new Date(day).toLocaleDateString();
					const dayDate: Date = new Date(day2Str);
					const dayMs: number = dayDate.getTime();
					const nowDate: Date = new Date();
					const nowMs: number = nowDate.getTime();

					console.log('day:', day);
					console.log('day2Str:', day2Str);
					console.log('dayDate:', dayDate);
					console.log('dayMs:', dayMs);
					console.log('nowDate:', nowDate);
					console.log('nowMs:', nowMs);
				}*/

				if (
					usedForReporting &&
					usedForReporting === true &&
					idx === scoresArr.length - 1
				) {
					// grab the most recent date (should be at the end of array)
					u4r = usedForReporting;
					const tempScoreOverall = Number(
						getValueFromScores('weighted-total', periodData)
					);
					const tempScoreSpeed = Number(
						getValueFromScores('speeding', periodData)
					);
					const tempScoreBrake = Number(
						getValueFromScores('harsh-braking', periodData)
					);
					const tempScoreNight = Number(
						getValueFromScores('night-driving', periodData)
					);

					/* if (idx === 0) {
						console.log('tempScoreOverall', tempScoreOverall);
						console.log('tempScoreSpeed', tempScoreSpeed);
						console.log('tempScoreBrake', tempScoreBrake);
						console.log('tempScoreNight', tempScoreNight);
					} */

					if (typeof tempScoreOverall == 'number') {
						cardAtts.scores.overall = tempScoreOverall;
						cardAtts.badges.overall =
							getBadgeLabel(tempScoreOverall);
					}
					if (typeof tempScoreSpeed == 'number') {
						cardAtts.scores.speed = tempScoreSpeed;
						cardAtts.badges.speed = getBadgeLabel(tempScoreSpeed);
					}
					if (typeof tempScoreBrake == 'number') {
						cardAtts.scores.brake = tempScoreBrake;
						cardAtts.badges.brake = getBadgeLabel(tempScoreBrake);
					}
					if (typeof tempScoreNight == 'number') {
						cardAtts.scores.night = tempScoreNight;
						cardAtts.badges.night = getBadgeLabel(tempScoreNight);
					}

					break scoresLoop; // break loop
				}
			}
		}
		/* end: get the scores/badges from the data */
	}

	return (
		<div className='grid grid-cols-4 auto-cols-auto gap-8 mt-16 justify-between'>
			{isLoading ? (
				<LoadingSpinner />
			) : (
				<>
					<ScoreCard
						label='Overall'
						score={cardAtts.scores.overall}
						badge={cardAtts.badges.overall}
						drivingDaysText={
							u4r ? `(${drivingDays} driving days)` : ''
						}
					/>
					<ScoreCard
						label='Speeding'
						score={cardAtts.scores.speed}
						badge={cardAtts.badges.speed}
						drivingDaysText={
							u4r ? `(${drivingDays} driving days)` : ''
						}
					/>
					<ScoreCard
						label='Braking'
						score={cardAtts.scores.brake}
						badge={cardAtts.badges.brake}
						drivingDaysText={
							u4r ? `(${drivingDays} driving days)` : ''
						}
					/>
					<ScoreCard
						label='Night Driving'
						score={cardAtts.scores.night}
						badge={cardAtts.badges.night}
						drivingDaysText={
							u4r ? `(${drivingDays} driving days)` : ''
						}
					/>
				</>
			)}
		</div>
	);
};

const ScoreCard = ({
	label,
	score,
	badge,
	drivingDaysText,
}: CardProps): JSX.Element => {
	const { colour, riskText }: ColourAndTextProps = getColourAndText(score);

	return (
		<div
			className={`${colour} h-36 w-full rounded-xl px-4 py-2 text-shark shadow-tile-shadow`}
		>
			<div className='flex flex-col h-full justify-around'>
				<h2 className='basis-1/4 text-sm'>
					{label}
					{drivingDaysText && (
						<span className='text-xs flex pb-3'>
							{drivingDaysText}
						</span>
					)}
				</h2>
				<h1 className='basis-2/4 font-semibold text-lg'>
					{score === null ? (
						<>Unknown</>
					) : (
						<>{score.toFixed(1)} / 100</>
					)}
				</h1>
				{badge && (
					<p className='text-[10px] whitespace-pre'>
						This is {badge === 'EXCELLENT' ? 'an' : 'a'}{' '}
						<span className='font-semibold'>{badge}</span> score.
					</p>
				)}
				<br />
				{riskText && <span className='text-sm'>{riskText}</span>}
			</div>
		</div>
	);
};

const getColourAndText = (score: number | null): ColourAndTextProps => {
	/*
		0-40 Very High Risk
		40.1-52.9 High
		53 - 59.9 Low
		60-69.9 Good
		70-79.9 Great
		80+ Excellent
	*/
	let rtnObj: ColourAndTextProps = {
		colour: 'bg-score-green/80',
		riskText: '',
	};

	if (score !== null) {
		if (score < 40)
			rtnObj = { colour: 'bg-score-red', riskText: 'Very High Risk' };
		else if (score >= 40 && score < 53)
			rtnObj = { colour: 'bg-score-red', riskText: 'High Risk' };
		else if (score >= 53 && score < 60)
			rtnObj = { colour: 'bg-score-yellow', riskText: 'Low Risk' };
		else if (score >= 60 && score < 70)
			rtnObj = { colour: 'bg-score-yellow', riskText: 'Good' };
		else if (score >= 70 && score < 80)
			rtnObj = { colour: 'bg-score-green', riskText: 'Great' };
		else rtnObj = { colour: 'bg-score-green', riskText: 'Excellent' };
	}

	return rtnObj;
};

const getBadgeLabel = (score: number): string => {
	/*
		0-40 Very High Risk
		40.1-52.9 High
		53 - 59.9 Low
		60-69.9 Good
		70-79.9 Great
		80+ Excellent
	*/
	let rtnLabel = 'Very High Risk';
	if (score > 40 && score < 53) rtnLabel = 'High';
	else if (score >= 53 && score < 60) rtnLabel = 'Low';
	else if (score >= 60 && score < 70) rtnLabel = 'Good';
	else if (score >= 70 && score < 80) rtnLabel = 'Great';
	else if (score >= 80) rtnLabel = 'Excellent';
	return rtnLabel;
};

export default ScoresOverview;
export { getColourAndText };

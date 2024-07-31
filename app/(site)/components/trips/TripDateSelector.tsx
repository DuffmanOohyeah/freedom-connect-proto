import React from 'react';
import {
	setItem,
	getItem,
	setTripDate,
	removeItem,
} from '@/app/(site)/hooks/useLocalStorage';

interface TripDateSelectorProps {
	fromDate: string;
	updateFromDate: (newFrom: string) => void;
	toDate: string;
	updateToDate: (newTo: string) => void;
	opid: string;
}

const TripDateSelector = ({
	fromDate,
	updateFromDate,
	toDate,
	updateToDate,
	opid,
}: TripDateSelectorProps): JSX.Element => {
	const lastOpid: number = Number(getItem('lastOpid')) || 0;
	let newFromDate: string = fromDate;
	let newToDate: string = toDate;

	if (lastOpid === Number(opid)) {
		const tripDates: string | null = getItem('tripDates');
		if (tripDates) {
			const { from, to } = JSON.parse(tripDates);
			const lsFromDate: string | null = from;
			if (lsFromDate) newFromDate = lsFromDate;
			const lsToDate: string | null = to;
			if (lsToDate) newToDate = lsToDate;
		}
	}

	return (
		<>
			<label className='inline-block mr-4'>
				<span className='mr-2 font-semibold'>From:</span>
				<input
					className={`w-48 border-0 bg-placeholder-bg font-medium focus:text-black focus:font-normal focus:ring-0 shadow-none ${
						newFromDate ? 'text-black' : 'text-placeholder-text'
					}`}
					type='date'
					value={newFromDate}
					onChange={(evt: React.ChangeEvent<HTMLInputElement>) => {
						updateFromDate(evt.target.value);
						setItem('lastOpid', opid);
						setTripDate('from', evt.target.value);
						removeItem('tripFromDate'); // WB: temp cmd
					}}
				/>
			</label>

			<label className='inline-block'>
				<span className='mr-2 font-semibold'>To:</span>
				<input
					className={`w-48 border-0 bg-placeholder-bg font-medium focus:text-black focus:font-normal focus:ring-0 shadow-none ${
						newToDate ? 'text-black' : 'text-placeholder-text'
					}`}
					type='date'
					value={newToDate}
					onChange={(evt: React.ChangeEvent<HTMLInputElement>) => {
						updateToDate(evt.target.value);
						setItem('lastOpid', opid);
						setTripDate('to', evt.target.value);
						removeItem('tripToDate'); // WB: temp cmd
					}}
				/>
			</label>
		</>
	);
};

export default TripDateSelector;

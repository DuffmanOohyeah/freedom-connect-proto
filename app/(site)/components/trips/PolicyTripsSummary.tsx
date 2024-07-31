import React, { useState } from 'react';
import TripsDateRange from './TripsDateRange';
import TripDateSelector from './TripDateSelector';
import { formatISO, sub } from 'date-fns';
import { GetTripDatesProps, getTripDates } from '@/app/utils/getTripDates';

interface PolicyTripsSummaryProps {
	opid: string;
}

const PolicyTripsSummary = ({ opid }: PolicyTripsSummaryProps): JSX.Element => {
	const { dtFrom, dtTo, daysInPast }: GetTripDatesProps = getTripDates(opid);

	const [fromDate, setFromDate] = useState(
		formatISO(
			sub(dtFrom, {
				days: daysInPast,
			}),
			{ representation: 'date' }
		)
	);
	const [toDate, setToDate] = useState(
		formatISO(dtTo, { representation: 'date' })
	);

	return (
		<div>
			<h1 className='text-lg font-semibold mb-8'>Trips Summary</h1>
			<div className='flex flex-col justify-start bg-white rounded-lg p-4 w-full'>
				<div className='flex flex-row justify-end'>
					<TripDateSelector
						fromDate={fromDate}
						updateFromDate={(newFrom: string) =>
							setFromDate(newFrom)
						}
						toDate={toDate}
						updateToDate={(newTo: string) => {
							setToDate(newTo);
						}}
						opid={opid}
					/>
				</div>
				<TripsDateRange
					opid={opid}
					fromDate={fromDate}
					toDate={toDate}
				/>
			</div>
		</div>
	);
};

export default PolicyTripsSummary;

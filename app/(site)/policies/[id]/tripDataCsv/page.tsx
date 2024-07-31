'use client';
import { useSearchParams } from 'next/navigation';
import TripDataCsv from '@/app/(site)/components/trips/TripDataCsv';

const TripData = ({ params }: any): JSX.Element => {
	const { id: opid } = params;
	const searchParams = useSearchParams();
	const fromDate: string | null = searchParams.get('fromDate');
	const toDate: string | null = searchParams.get('toDate');

	return (
		<div className='p-7'>
			<TripDataCsv
				opid={opid}
				fromDate={fromDate}
				toDate={toDate}
				dayRange={7}
			/>
		</div>
	);
};

export default TripData;

'use client';
import IndividualTrip from '@/app/(site)/components/trips/IndividualTrip';

interface TripsProps {
	params: {
		id: string;
		sdtm: string;
	};
}

const Trips = ({ params }: TripsProps): JSX.Element => {
	const { id: opid, sdtm } = params;
	return (
		<div className='h-screen'>
			<IndividualTrip opid={opid} sdtm={sdtm} />
		</div>
	);
};

export default Trips;

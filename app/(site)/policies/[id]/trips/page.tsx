'use client';
import PolicyTripsSummary from '@/app/(site)/components/trips/PolicyTripsSummary';

interface TripsProps {
	params: {
		id: string;
	};
}

const Trips = ({ params }: TripsProps): JSX.Element => {
	const { id: opid } = params;

	return (
		<div className='p-7'>
			<PolicyTripsSummary opid={opid} />
		</div>
	);
};

export default Trips;

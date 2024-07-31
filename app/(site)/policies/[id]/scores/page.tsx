'use client';
import ScoresOverview from '@/app/(site)/components/ScoresOverview';
import ScoresTable from '@/app/(site)/components/ScoresTable';

const Scores = ({ params }: any): JSX.Element => {
	const { id: opid } = params;

	return (
		<div className='px-5'>
			<ScoresOverview opid={opid} />
			<ScoresTable opid={opid} />
		</div>
	);
};

export default Scores;

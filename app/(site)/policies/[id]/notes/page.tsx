'use client';
import PolicyNotesTable from '@/app/(site)/components/notes/PolicyNotesTable';
import CreateNote from '@/app/(site)/components/notes/CreateNote';
import { useState } from 'react';

const Notes = ({ params }: any): JSX.Element => {
	const { id: opid } = params;
	const [indexNumber, setIndexNumber] = useState<number>(0);

	return (
		<div className='px-4'>
			<div className='flex flex-col 2xl:flex-row gap-12 mt-16'>
				<div className='basis-7/12 flex flex-col gap-8'>
					<PolicyNotesTable opid={opid} indexNumber={indexNumber} />
				</div>
				<div className='flex-1 flex flex-col gap-8'>
					<CreateNote
						opid={opid}
						policySpecfic={true}
						created={() => setIndexNumber(indexNumber + 1)}
					/>
				</div>
			</div>
		</div>
	);
};

export default Notes;

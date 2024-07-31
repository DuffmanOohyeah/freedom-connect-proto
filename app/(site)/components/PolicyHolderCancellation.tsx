import React, { useState } from 'react';

const PolicyHolderCancellation = (): JSX.Element => {
	const [cancelDate, setCancelDate] = useState<string>('');

	const handleSetCancelDate = (e: React.ChangeEvent<HTMLInputElement>) => {
		setCancelDate(e.target.value);
	};
	return (
		<div className='flex flex-col bg-white rounded-2xl shadow-tile-shadow px-8 py-6 w-full'>
			<h1 className='text-lg font-semibold mb-6 whitespace-pre'>
				Policy Cancellation
			</h1>
			<div className='whitespace-pre grow flex flex-col gap-6 justify-center'>
				<input
					className={`border-0 bg-placeholder-bg font-medium focus:text-black focus:font-normal focus:ring-0 shadow-none ${
						cancelDate ? 'text-black' : 'text-placeholder-text'
					}`}
					type='date'
					value={cancelDate}
					onChange={handleSetCancelDate}
				/>
				<button
					type='button'
					className='bg-shark hover:bg-shark-450 text-white text-xs px-4 py-3 rounded-full whitespace-pre'
				>
					Cancel Policy
				</button>
			</div>
		</div>
	);
};

export default PolicyHolderCancellation;

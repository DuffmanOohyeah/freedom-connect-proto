import React from 'react';

const PolicyHolderPreferences = (): JSX.Element => (
	<div className='flex flex-col bg-white rounded-2xl shadow-tile-shadow px-8 py-6 w-full'>
		<h1 className='text-lg font-semibold mb-6'>Preferences</h1>
		<div className='whitespace-pre grow flex flex-col gap-6 justify-center'>
			<label>
				<input
					type='checkbox'
					className='text-jagged-ice-550 border-aqua-haze-600 focus:ring-0 checked:checkbox-checked mr-4'
				/>
				<span className='font-semibold'>Driving Behaviour</span>
			</label>
			<label>
				<input
					type='checkbox'
					className='text-jagged-ice-550 border-aqua-haze-600 focus:ring-0 checked:checkbox-checked mr-4'
					defaultChecked
				/>
				<span className='font-semibold'>Marketing</span>
			</label>
			<label>
				<input
					type='checkbox'
					className='text-jagged-ice-550 border-aqua-haze-600 focus:ring-0 checked:checkbox-checked mr-4'
					defaultChecked
				/>
				<span className='font-semibold'>App Push Notifications</span>
			</label>
		</div>
	</div>
);

export default PolicyHolderPreferences;

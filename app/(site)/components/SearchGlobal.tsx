'use client';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import React from 'react';

const SearchGlobal = (): JSX.Element => (
	<div className='relative ml-10 mr-4'>
		<input
			type='text'
			name='search'
			id='search'
			placeholder='Search anything...'
			className='searchbox shadow-tile-shadow'
		/>
		<MagnifyingGlassIcon className='h-[18px] w-[18px] flex-none absolute top-[11px] right-[11px]' />
	</div>
);

export default SearchGlobal;

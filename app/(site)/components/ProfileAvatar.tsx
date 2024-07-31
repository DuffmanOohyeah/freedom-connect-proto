'use client';
import React from 'react';
import Image from 'next/image';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

const ProfileAvatar = (): JSX.Element => {
	return (
		<>
			<Image
				width={100}
				height={100}
				className='inline-block h-10 w-10 rounded-full ring-2 ring-white mr-2 shadow-sm'
				src='https://images.unsplash.com/photo-1491528323818-fdd1faba62cc?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
				alt='Avatar'
			/>
			<ChevronDownIcon className='h-3 flex-none' />
		</>
	);
};

export default ProfileAvatar;

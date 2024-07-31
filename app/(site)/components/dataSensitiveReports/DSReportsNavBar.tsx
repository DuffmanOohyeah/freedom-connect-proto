'use client';
import Link from 'next/link';
import { useSelectedLayoutSegments } from 'next/navigation';
import React from 'react';
import { useSession } from 'next-auth/react';
import { SessionType } from '@/types/api';

const DSReportsNavBar = (): JSX.Element => {
	const segments = useSelectedLayoutSegments();
	const { data: session } = useSession();
	const userSession: SessionType | null = session;
	const isMasterUser = userSession?.user?.masterUser || false;

	return (
		<div className='flex flex-wrap gap-4 whitespace-pre'>
			<div className='w-full flex space-x-4'>
				{isMasterUser.toString() == 'true' && (
					<>
						<Link
							href={'/dataSensitiveReports/errorNonCritical'}
							className={`${
								segments.includes('errorNonCritical') ||
								segments.length === 0
									? 'bg-jagged-ice text-shark'
									: 'bg-shark text-white hover:bg-shark-450'
							} text-xs font-medium  hover:bg-jagged-ice-550 shadow-tile-shadow px-4 py-2 rounded-full flex items-center justify-center cursor-pointer`}
						>
							Error Non Critical
						</Link>

						<Link
							href={'/dataSensitiveReports/monthlyPerformance'}
							className={`${
								segments.includes('monthlyPerformance')
									? 'bg-jagged-ice text-shark'
									: 'bg-shark text-white hover:bg-shark-450'
							} text-xs font-medium  hover:bg-jagged-ice-550 shadow-tile-shadow px-4 py-2 rounded-full flex items-center justify-center cursor-pointer`}
						>
							Monthly Performance (KPI)
						</Link>
					</>
				)}
			</div>
		</div>
	);
};

export default DSReportsNavBar;

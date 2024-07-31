'use client';
import React from 'react';
import DSReportingNavBar from '../components/dataSensitiveReports/DSReportsNavBar';

interface DSReportsLayoutProps {
	children: React.ReactNode;
}

const DSReportsLayout = ({ children }: DSReportsLayoutProps): JSX.Element => (
	<div className='p-12'>
		<h1 className='text-2xl font-bold flex items-center'>
			Data Sensitive Reports
		</h1>

		<div className='flex flex-row justify-between gap-4 mt-6'>
			<DSReportingNavBar />
		</div>

		<div className='flex flex-row gap-12 mt-6'>{children}</div>
	</div>
);

export default DSReportsLayout;

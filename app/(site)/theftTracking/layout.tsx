import React from 'react';
//import ReportingDeviceNotInstalled from '../components/reporting/ReportingDeviceNotInstalled';
//import ReportingNavBar from '../components/reporting/ReportingNavBar';

const TheftTrackingLayout = ({
	children,
}: {
	children: React.ReactNode;
}): JSX.Element => {
	return (
		<div className='p-12'>
			<h1 className='text-2xl font-bold flex items-center'>
				Theft Tracking
			</h1>
			{/* <ReportingNavBar /> */}
			<div className='flex flex-row gap-12 mt-6'>{children}</div>
		</div>
	);
};

export default TheftTrackingLayout;

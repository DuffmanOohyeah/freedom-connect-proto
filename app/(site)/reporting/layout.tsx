'use client';
import React, { ReactNode } from 'react';
import ReportingNavBar from '../components/reporting/ReportingNavBar';
import BusinessUnitSelector from './BusinessUnitSelector';
// import { BusinessUnit } from '@/types/api';
// import { HiOutlineChevronDown } from 'react-icons/hi';
// import ReportingDeviceNotInstalled from '../components/reporting/ReportingDeviceNotInstalled';

interface ReportingLayoutProps {
	children: ReactNode;
}

const ReportingLayout = ({ children }: ReportingLayoutProps): JSX.Element => {
	// const [businessUnit, setBusinessUnit] = useState<BusinessUnit>();

	return (
		<div className='p-12'>
			<h1 className='text-2xl font-bold flex items-center'>Reporting</h1>
			<div className='flex flex-row justify-between gap-4 mt-6'>
				<ReportingNavBar />
				<BusinessUnitSelector />
			</div>

			<div className='flex flex-row gap-12 mt-6'>{children}</div>
		</div>
	);
};

export default ReportingLayout;

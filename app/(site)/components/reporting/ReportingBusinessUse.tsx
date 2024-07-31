import { GetBusinessUseReportRes, BusinessUseReport } from '@/types/api';
import { BaseUrl, getApiHeaders, fullSignOut } from '@/app/utils';
import React, { useContext, useEffect, useState } from 'react';
import LoadingSpinner from '../LoadingSpinner';
import Link from 'next/link';
import { BusinessUnitCtx } from '../providers/BusinessUnitProvider';
import ReportActionPanel, {
	ActionPolicy,
} from '../actionButtons/ReportActionPanel';
import { createColumnHelper } from '@tanstack/react-table';
import { format } from 'date-fns';
import { ArrowsPointingOutIcon } from '@heroicons/react/24/outline';
import ReportTable from '../table/ReportingTable';
import { getCurrentBusinessUnit } from '@/app/utils/getCurrentBusinessUnit';
import { BusinessUnitContextType } from '@/types/api/businessUnitProvider';
import { useSession } from 'next-auth/react';

const ReportingRiskBusinessUse = (): JSX.Element => {
	const [reports, setReports] = useState<BusinessUseReport[]>([]);
	const [currentPolicy, setCurrentPolicy] = useState<ActionPolicy | null>(
		null
	);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [isError, setIsError] = useState<boolean>(false);
	const { data: session } = useSession();
	const { state }: BusinessUnitContextType = useContext(BusinessUnitCtx)!;

	const columnHelper = createColumnHelper<BusinessUseReport>();
	const columns = [
		columnHelper.accessor('policyNo', {
			header: 'Policy Number',
			cell: (info) => {
				const policyNumber = info.getValue();
				const opid = info.row.original.opid;
				return (
					<Link
						href={`/policies/${opid}/policyholderdetails`}
						className='hover:underline'
					>
						{policyNumber}
					</Link>
				);
			},
		}),
		columnHelper.accessor('averageTripsPerDay', {
			header: 'Avg Trips/Day',
			cell: (info) => info.getValue(),
		}),
		columnHelper.accessor('occupation', {
			header: 'Occupation',
			cell: (info) => info.getValue(),
		}),
		columnHelper.accessor('classOfUse', {
			header: 'Class of Use',
			cell: (info) => info.getValue(),
		}),
		columnHelper.accessor('daysSinceInception', {
			header: 'Days Since inception',
			cell: (info) => info.getValue(),
		}),
		columnHelper.accessor('snsSentDTM', {
			header: 'SNS Sent to Broker Date',
			cell: (info) => {
				const value = info.getValue();
				return value ? format(new Date(value), 'dd/MM/yyyy HH:mm') : '';
			},
		}),
		columnHelper.display({
			id: 'action',
			header: 'Action',
			cell: (props) => (
				<button
					className=''
					onClick={() => {
						setCurrentPolicy({
							policyNumber: props.row.original.policyNo,
							opid: props.row.original.opid,
							customActions: [],
						});
					}}
				>
					<ArrowsPointingOutIcon className='h-4' />
				</button>
			),
		}),
	];

	const fetchRiskMileage = async (uid: number): Promise<void> => {
		setIsLoading(true);
		setIsError(false);

		if (uid > 0) {
			const response = await fetch(
				`${BaseUrl}/portal/report/risk/business-use?uid=${uid}`,
				{
					method: 'GET',
					headers: await getApiHeaders(),
				}
			);
			if (!response.ok) {
				const res = await response.json();
				if (res.errorMessage == 'Unauthorised') fullSignOut();
				throw new Error('Network response was not ok');
			}
			const resPolicies =
				(await response.json()) as GetBusinessUseReportRes;
			setReports(resPolicies.report || []);
		}

		setIsLoading(false);
	};

	useEffect(() => {
		const currentBU = getCurrentBusinessUnit(session, state);
		fetchRiskMileage(currentBU.id || 0);
	}, [session, state]);

	return (
		<>
			{isLoading && <LoadingSpinner />}
			{!isLoading && reports.length > 0 && (
				<>
					<ReportActionPanel policy={currentPolicy} />
					<ReportTable
						reportName='business-use'
						columns={columns}
						data={reports}
					/>
				</>
			)}
			{!isLoading && !isError && reports.length === 0 && (
				<p className='text-sm'>No reports found</p>
			)}
			{isError && <p className='text-sm'>An error occurred</p>}
		</>
	);
};

export default ReportingRiskBusinessUse;

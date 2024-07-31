import {
	MissingMobileNumbersReportProps,
	GetMissingMobileNumbersReportResProps,
} from '@/types/api';
import { BaseUrl, getApiHeaders, fullSignOut } from '@/app/utils';
import React, { useContext, useEffect, useState } from 'react';
import LoadingSpinner from '../LoadingSpinner';
import Link from 'next/link';
import { BusinessUnitCtx } from '../providers/BusinessUnitProvider';
import { createColumnHelper } from '@tanstack/react-table';
import ReportActionPanel, {
	ActionPolicy,
} from '../actionButtons/ReportActionPanel';
import { ArrowsPointingOutIcon } from '@heroicons/react/24/outline';
import ReportTable from '../table/ReportingTable';
import { useSession } from 'next-auth/react';
import { getCurrentBusinessUnit } from '@/app/utils/getCurrentBusinessUnit';

const ReportMissingMobileNumbers = (): JSX.Element => {
	const [reports, setReports] = useState<MissingMobileNumbersReportProps[]>(
		[]
	);
	const [currentPolicy, setCurrentPolicy] = useState<ActionPolicy | null>(
		null
	);
	const { state } = useContext(BusinessUnitCtx)!;
	const { data: session } = useSession();
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [isError, setIsError] = useState<boolean>(false);

	const columnHelper = createColumnHelper<MissingMobileNumbersReportProps>();

	const columns = [
		columnHelper.accessor('policyNo', {
			header: 'Policy Number',
			cell: (info) => {
				const policyNumber = info.getValue();
				const opid = info.row.original.opid;
				return (
					<Link
						href={`/policies/${opid}/policyholderdetails`}
						className='hover:underline font-medium'
					>
						{policyNumber}
					</Link>
				);
			},
		}),
		columnHelper.accessor('userTitle', {
			header: 'User Title',
			cell: (info) => info.getValue(),
		}),
		columnHelper.accessor('userForename', {
			header: 'User Forename',
			cell: (info) => info.getValue(),
		}),
		columnHelper.accessor('userSurname', {
			header: 'User Surname',
			cell: (info) => info.getValue(),
		}),
		columnHelper.accessor('userEmail', {
			header: 'User Email',
			cell: (info) => `${info.getValue()}`,
		}),
		columnHelper.accessor('userMobile', {
			header: 'User Mobile',
			cell: (info) => `${info.getValue()}`,
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

	const fetchMissingMobiles = async (uid: number): Promise<void> => {
		setIsLoading(true);
		setIsError(false);

		if (uid > 0) {
			const response = await fetch(
				`${BaseUrl}/portal/report/missing/mobiles?uid=${uid}`,
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
				(await response.json()) as GetMissingMobileNumbersReportResProps;
			setReports(resPolicies.report || []);
		}

		setIsLoading(false);
	};

	useEffect(() => {
		const currentBU = getCurrentBusinessUnit(session, state);
		fetchMissingMobiles(currentBU.id || 0);
	}, [session, state]);

	return (
		<>
			{isLoading && <LoadingSpinner />}
			{!isLoading && reports.length > 0 && (
				<>
					<ReportActionPanel policy={currentPolicy} />
					<ReportTable
						reportName='missing-mobile-numbers'
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

export default ReportMissingMobileNumbers;

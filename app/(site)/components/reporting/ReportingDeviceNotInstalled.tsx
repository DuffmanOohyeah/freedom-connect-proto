import {
	DeviceNotInstalledReport,
	GetDeviceNotInstalledReportRes,
} from '@/types/api';
import { BaseUrl, getApiHeaders, fullSignOut } from '@/app/utils';
import React, { useContext, useEffect, useState } from 'react';
import LoadingSpinner from '../LoadingSpinner';

import { BusinessUnitCtx } from '../providers/BusinessUnitProvider';
import { createColumnHelper } from '@tanstack/react-table';
import Link from 'next/link';
import ReportActionPanel, {
	ActionPolicy,
} from '../actionButtons/ReportActionPanel';
import { ArrowsPointingOutIcon } from '@heroicons/react/24/outline';
import ReportTable from '../table/ReportingTable';
import { useSession } from 'next-auth/react';
import { getCurrentBusinessUnit } from '@/app/utils/getCurrentBusinessUnit';

const ReportingDeviceNotInstalled = (): JSX.Element => {
	const [reports, setReports] = useState<DeviceNotInstalledReport[]>([]);
	const [currentPolicy, setCurrentPolicy] = useState<ActionPolicy | null>(
		null
	);
	const { state } = useContext(BusinessUnitCtx)!;
	const { data: session } = useSession();
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [isError, setIsError] = useState<boolean>(false);

	const columnHelper = createColumnHelper<DeviceNotInstalledReport>();
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
		columnHelper.accessor('forename', {
			header: 'Forename',
			cell: (info) => info.getValue(),
		}),
		columnHelper.accessor('surname', {
			header: 'Surname',
			cell: (info) => info.getValue(),
		}),
		columnHelper.accessor('vrm', {
			header: 'VRN',
			cell: (info) => info.getValue(),
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

	const fetchNotInstalled = async (uid: number): Promise<void> => {
		setIsLoading(true);
		setIsError(false);

		if (uid > 0) {
			const response = await fetch(
				`${BaseUrl}/portal/report/device/notinstalled?uid=${uid}`,
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
				(await response.json()) as GetDeviceNotInstalledReportRes;
			setReports(resPolicies.report || []);
		}

		setIsLoading(false);
	};

	useEffect(() => {
		const currentBU = getCurrentBusinessUnit(session, state);
		fetchNotInstalled(currentBU.id || 0);
	}, [session, state]);

	return (
		<>
			{isLoading && <LoadingSpinner />}
			{!isLoading && reports.length > 0 && (
				<>
					<ReportActionPanel policy={currentPolicy} />
					<ReportTable
						reportName='device-not-installed'
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

export default ReportingDeviceNotInstalled;

import {
	GetDeviceUnpluggedReport,
	DeviceUnpluggedReport,
	DeviceDetails,
} from '@/types/api';
import { BaseUrl, getApiHeaders, fullSignOut } from '@/app/utils';
import React, { useContext, useEffect, useState } from 'react';
import LoadingSpinner from '../LoadingSpinner';
import Link from 'next/link';
import { format } from 'date-fns';
import { BusinessUnitCtx } from '../providers/BusinessUnitProvider';
import ReportActionPanel, {
	ActionPolicy,
} from '../actionButtons/ReportActionPanel';
import ReportTable from '../table/ReportingTable';
import { createColumnHelper } from '@tanstack/react-table';
import { ArrowsPointingOutIcon } from '@heroicons/react/24/outline';
import UnplugCancellation from '../actionButtons/UnplugCancellation';
import { useSession } from 'next-auth/react';
import { getCurrentBusinessUnit } from '@/app/utils/getCurrentBusinessUnit';

const ReportingDeviceUnplugged = (): JSX.Element => {
	const [reports, setReports] = useState<DeviceUnpluggedReport[]>([]);
	const { state } = useContext(BusinessUnitCtx)!;
	const { data: session } = useSession();
	const [currentPolicy, setCurrentPolicy] = useState<ActionPolicy | null>(
		null
	);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [isError, setIsError] = useState<boolean>(false);

	const dtFormat: string = 'dd/MM/yyyy HH:mm';

	const columnHelper = createColumnHelper<DeviceUnpluggedReport>();
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
		columnHelper.accessor('lastUnPlug', {
			header: 'Last Unplug',
			cell: (info) => {
				const value = info.getValue();
				return value ? format(new Date(value), dtFormat) : '';
			},
		}),
		columnHelper.accessor('reminderSNSDTM', {
			header: 'Reminder SNS Sent',
			cell: (info) => {
				const value = info.getValue();
				return value ? format(new Date(value), dtFormat) : '';
			},
		}),
		columnHelper.accessor('chaseComm1DTM', {
			header: '1st Chase Comm',
			cell: (info) => {
				const value = info.getValue();
				return value ? format(new Date(value), dtFormat) : '';
			},
		}),
		columnHelper.accessor('chaseComm2DTM', {
			header: '2nd Chase Comm',
			cell: (info) => {
				const value = info.getValue();
				return value ? format(new Date(value), dtFormat) : '';
			},
		}),
		columnHelper.accessor('cancelSNSDTM', {
			header: 'Cancel SNS Sent',
			cell: (info) => {
				const value = info.getValue();
				return value ? format(new Date(value), dtFormat) : '';
			},
		}),
		columnHelper.display({
			id: 'action',
			header: 'Action',
			cell: (props) => (
				<button
					onClick={() => {
						setCurrentPolicy({
							policyNumber: props.row.original.policyNo,
							opid: props.row.original.opid,
							customActions: [
								{
									type: 'component',
									title: 'Device Unplugged Cancellation',
									component: (
										<UnplugCancellation
											opid={props.row.original.opid}
											devices={
												[
													{
														barcode:
															props.row.original
																.deviceBarcode,
													},
												] as DeviceDetails[]
											}
										/>
									),
								},
							],
						});
					}}
				>
					<ArrowsPointingOutIcon className='h-4' />
				</button>
			),
		}),
	];

	const fetchDeviceUnplugged = async (uid: number): Promise<void> => {
		setIsLoading(true);
		setIsError(false);

		if (uid > 0) {
			const response = await fetch(
				`${BaseUrl}/portal/report/device/unplugged?uid=${uid}`,
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
				(await response.json()) as GetDeviceUnpluggedReport;
			setReports(resPolicies.report || []);
		}

		setIsLoading(false);
	};

	useEffect(() => {
		const currentBU = getCurrentBusinessUnit(session, state);
		fetchDeviceUnplugged(currentBU.id || 0);
	}, [session, state]);

	return (
		<>
			{isLoading && <LoadingSpinner />}
			{!isLoading && reports.length > 0 && (
				<>
					<ReportActionPanel policy={currentPolicy} />
					<ReportTable
						reportName='device-unplugged'
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

export default ReportingDeviceUnplugged;

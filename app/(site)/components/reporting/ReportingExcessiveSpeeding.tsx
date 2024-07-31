import { BaseUrl, getApiHeaders, fullSignOut } from '@/app/utils';
import { useContext, useEffect, useState } from 'react';
import LoadingSpinner from '../LoadingSpinner';
import Link from 'next/link';
import {
	ExcessiveSpeedingReport,
	GetExcessiveSpeedingReports,
} from '@/types/api';
import { ArrowsPointingOutIcon } from '@heroicons/react/24/outline';
import { BusinessUnitCtx } from '../providers/BusinessUnitProvider';
import { createColumnHelper } from '@tanstack/react-table';
import ReportActionPanel, {
	ActionPolicy,
} from '../actionButtons/ReportActionPanel';
import ReportTable from '../table/ReportingTable';
import ExcessiveSpeeding from '../ExcessiveSpeeding';
import { useSession } from 'next-auth/react';
import { getCurrentBusinessUnit } from '@/app/utils/getCurrentBusinessUnit';

const ReportingExcessiveSpeeding = (): JSX.Element => {
	const { state } = useContext(BusinessUnitCtx)!;
	const { data: session } = useSession();
	const [currentPolicy, setCurrentPolicy] = useState<ActionPolicy | null>(
		null
	);
	const [reports, setReports] = useState<ExcessiveSpeedingReport[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [isError, setIsError] = useState<boolean>(false);

	const columnHelper = createColumnHelper<ExcessiveSpeedingReport>();
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
		columnHelper.accessor('eventDTMLocal', {
			header: 'Event DTM',
			cell: (info) => info.getValue(),
		}),
		columnHelper.accessor('speedLimitMph', {
			header: 'Speed Limit',
			cell: (info) => info.getValue().toFixed(2),
		}),
		columnHelper.accessor('actualSpeedMph', {
			header: 'Actual Speed',
			cell: (info) => info.getValue().toFixed(2),
		}),
		columnHelper.accessor('durationOfSpeedingSeconds', {
			header: 'Duration',
			cell: (info) => info.getValue().toFixed(2),
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
									title: 'View Event',
									component: (
										<ExcessiveSpeeding
											eventId={props.row.original.excessiveSpeedEventId.toString()}
											opid={props.row.original.opid.toString()}
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

	const fetchExcessiveSpeeding = async (uid: number): Promise<void> => {
		setIsLoading(true);
		setIsError(false);

		if (uid > 0) {
			const response = await fetch(
				`${BaseUrl}/portal/report/excessivespeed/unprocessed?uid=${uid}`,
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
				(await response.json()) as GetExcessiveSpeedingReports;
			setReports(resPolicies.report || []);
		}

		setIsLoading(false);
	};

	useEffect(() => {
		const currentBU = getCurrentBusinessUnit(session, state);
		fetchExcessiveSpeeding(currentBU.id || 0);
	}, [session, state]);

	return (
		<>
			{isLoading && <LoadingSpinner />}
			{!isLoading && reports.length > 0 && (
				<>
					<ReportActionPanel policy={currentPolicy} />
					<ReportTable
						reportName='excessive-speeding'
						columns={columns}
						data={reports}
						sortObj={{ id: 'policyNo', desc: false }}
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

export default ReportingExcessiveSpeeding;

import { BaseUrl, getApiHeaders, fullSignOut } from '@/app/utils';
import { useContext, useEffect, useState } from 'react';
import LoadingSpinner from '../LoadingSpinner';
import Link from 'next/link';
import {
	GetPersistentSpeedingReports,
	PersistentSpeedingReport,
} from '@/types/api';
import { ArrowsPointingOutIcon } from '@heroicons/react/24/outline';
import { BusinessUnitCtx } from '../providers/BusinessUnitProvider';
import { createColumnHelper } from '@tanstack/react-table';
import ReportActionPanel, {
	ActionPolicy,
} from '../actionButtons/ReportActionPanel';
import ReportTable from '../table/ReportingTable';
import PersistentSpeeding from '../PersistentSpeeding';
import { getCurrentBusinessUnit } from '@/app/utils/getCurrentBusinessUnit';
import { useSession } from 'next-auth/react';

const ReportingPersistentSpeeding = (): JSX.Element => {
	const { state } = useContext(BusinessUnitCtx)!;
	const { data: session } = useSession();
	const [currentPolicy, setCurrentPolicy] = useState<ActionPolicy | null>(
		null
	);
	const [reports, setReports] = useState<PersistentSpeedingReport[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [isError, setIsError] = useState<boolean>(false);

	const columnHelper = createColumnHelper<PersistentSpeedingReport>();
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
			header: 'Duration (Secs.)',
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
										<PersistentSpeeding
											eventId={props.row.original.persistentSpeedEventId.toString()}
											opid={props.row.original.opid.toString()}
											validatedDTM={
												props.row.original.validatedDTM
											}
											invalidatedDTM={
												props.row.original
													.invalidatedDTM
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

	const fetchPersistentSpeeding = async (uid: number): Promise<void> => {
		setIsLoading(true);
		setIsError(false);

		if (uid > 0) {
			const response = await fetch(
				`${BaseUrl}/portal/report/persistentspeed?uid=${uid}`,
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
				(await response.json()) as GetPersistentSpeedingReports;
			if (resPolicies.report) {
				/* start: cleanse the report from the api */
				const cleansedReport: PersistentSpeedingReport[] = [];
				resPolicies.report.map((obj) => {
					if (!obj.invalidatedDTM && !obj.validatedDTM)
						cleansedReport.push(obj);
				});
				setReports(cleansedReport);
				/* end: cleanse the report from the api */
			} else setReports([]);
		}

		setIsLoading(false);
	};

	useEffect(() => {
		const currentBU = getCurrentBusinessUnit(session, state);
		fetchPersistentSpeeding(currentBU.id || 0);
	}, [session, state]);

	return (
		<>
			{isLoading && <LoadingSpinner />}
			{!isLoading && reports.length > 0 && (
				<>
					<ReportActionPanel policy={currentPolicy} />
					<ReportTable
						reportName='persistent-speeding'
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

export default ReportingPersistentSpeeding;

import { BaseUrl, getApiHeaders, fullSignOut } from '@/app/utils';
import { useContext, useEffect, useState } from 'react';
import LoadingSpinner from '../LoadingSpinner';
import Link from 'next/link';
import {
	ValidatedExcessiveSpeedingReport,
	GetValidatedExcessiveSpeedingReports,
} from '@/types/api/validatedExcessiveSpeeding';
import { ArrowsPointingOutIcon } from '@heroicons/react/24/outline';
import { BusinessUnitCtx } from '../providers/BusinessUnitProvider';
import { createColumnHelper } from '@tanstack/react-table';
import ReportActionPanel, {
	ActionPolicy,
} from '../actionButtons/ReportActionPanel';
import ReportTable from '../table/ReportingTable';
import ExcessiveSpeeding from '../ExcessiveSpeeding';
import { useSession } from 'next-auth/react';
import { BusinessUnitContextType } from '@/types/api/businessUnitProvider';
import { getCurrentBusinessUnit } from '@/app/utils/getCurrentBusinessUnit';

const ReportingValidatedExcessiveSpeeding = (): JSX.Element => {
	const [currentPolicy, setCurrentPolicy] = useState<ActionPolicy | null>(
		null
	);
	const [reports, setReports] = useState<ValidatedExcessiveSpeedingReport[]>(
		[]
	);
	const { data: session } = useSession();
	const { state }: BusinessUnitContextType = useContext(BusinessUnitCtx)!;
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [isError, setIsError] = useState<boolean>(false);

	const columnHelper = createColumnHelper<ValidatedExcessiveSpeedingReport>();
	const columns = [
		columnHelper.accessor('policyNo', {
			header: 'Policy No.',
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
		columnHelper.accessor('surname', {
			header: 'Policy Holder',
			cell: (info) => {
				let polHolder = '';
				if (info.row.original.title)
					polHolder += info.row.original.title + ' ';
				if (info.row.original.forename)
					polHolder += info.row.original.forename + ' ';
				polHolder += info.getValue();
				return polHolder;
			},
		}),
		columnHelper.accessor('eventDTMLocal', {
			header: 'Event DTM',
			cell: (info) => info.getValue(),
		}),
		columnHelper.accessor('speedLimitMph', {
			header: 'Limit (Mph)',
			cell: (info) => info.getValue(),
		}),
		columnHelper.accessor('actualSpeedMph', {
			header: 'Actual (Mph)',
			cell: (info) => info.getValue().toFixed(1),
		}),
		columnHelper.accessor('durationOfSpeedingSeconds', {
			header: 'Duration (Secs)',
			cell: (info) => info.getValue(),
		}),
		columnHelper.accessor('durationOfSpeedingMetres', {
			header: 'Duration (Mtrs)',
			cell: (info) => info.getValue(),
		}),
		columnHelper.accessor('latitude', {
			header: 'Lat/Long',
			cell: (info) => {
				let latLng = info.row.original.latitude.toFixed(3) + '/';
				latLng += info.row.original.longitude.toFixed(3);
				return latLng;
			},
		}),
		columnHelper.accessor('address', {
			header: 'Address',
			cell: (info) => info.getValue(),
		}),
		columnHelper.display({
			id: 'action',
			header: 'Action',
			cell: (props) => {
				const args = {
					opid: props.row.original.opid,
					policyNo: props.row.original.policyNo,
					eventId: props.row.original.excessiveSpeedEventId,
				};
				return (
					<button
						onClick={() => {
							setCurrentPolicy({
								policyNumber: args.policyNo,
								opid: args.opid,
								customActions: [
									{
										type: 'component',
										title: 'View Event',
										component: (
											<ExcessiveSpeeding
												eventId={args.eventId.toString()}
												opid={args.opid.toString()}
												showValidButtons={false}
											/>
										),
									},
								],
							});
						}}
					>
						<ArrowsPointingOutIcon className='h-4' />
					</button>
				);
			},
		}),
	];

	const fetchExcessiveSpeeding = async (uid: number): Promise<void> => {
		setIsLoading(true);
		setIsError(false);

		if (uid > 0) {
			const response = await fetch(
				`${BaseUrl}/portal/report/validatedexcessivespeed?uid=${uid}`,
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
				(await response.json()) as GetValidatedExcessiveSpeedingReports;
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
						reportName='validated-excessive-speeding'
						columns={columns}
						data={reports}
					/>
				</>
			)}
			{!isLoading && !isError && reports.length === 0 && (
				<p className='text-sm'>No records found</p>
			)}
			{isError && <p className='text-sm'>An error occurred</p>}
		</>
	);
};

export default ReportingValidatedExcessiveSpeeding;

import {
	UntrackedTripsInKmsReportProps,
	GetUntrackedTripsInKmsResponseProps,
} from '@/types/api';
import { BaseUrl, getApiHeaders, fullSignOut } from '@/app/utils';
import React, { useContext, useEffect, useState } from 'react';
import LoadingSpinner from '../LoadingSpinner';
import Link from 'next/link';
import { BusinessUnitCtx } from '../providers/BusinessUnitProvider';
import { createColumnHelper } from '@tanstack/react-table';
import { format } from 'date-fns';
import ReportActionPanel, {
	ActionPolicy,
} from '../actionButtons/ReportActionPanel';
import { ArrowsPointingOutIcon } from '@heroicons/react/24/outline';
import ReportTable from '../table/ReportingTable';
import { useSession } from 'next-auth/react';
import { BusinessUnitContextType } from '@/types/api/businessUnitProvider';
import { getCurrentBusinessUnit } from '@/app/utils/getCurrentBusinessUnit';

const ReportingUntrackedTripsInKms = (): JSX.Element => {
	const [reports, setReports] = useState<UntrackedTripsInKmsReportProps[]>(
		[]
	);
	const [currentPolicy, setCurrentPolicy] = useState<ActionPolicy | null>(
		null
	);
	const [errMessage, setErrMessage] = useState<string>('');
	const { data: session } = useSession();
	const { state }: BusinessUnitContextType = useContext(BusinessUnitCtx)!;
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [isError, setIsError] = useState<boolean>(false);

	const dateTimeFormat: string = 'dd/MM/yyyy HH:mm';

	const columnHelper = createColumnHelper<UntrackedTripsInKmsReportProps>();
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

		columnHelper.accessor('userTitle', {
			header: 'Title',
			cell: (info) => info.getValue(),
		}),

		columnHelper.accessor('userForename', {
			header: 'Forename',
			cell: (info) => info.getValue(),
		}),

		columnHelper.accessor('userSurname', {
			header: 'Surname',
			cell: (info) => info.getValue(),
		}),

		/*columnHelper.accessor('userEmail', {
			header: 'User Email',
			cell: (info) => info.getValue(),
		}),*/

		columnHelper.accessor('startLocalDTM', {
			header: () => (
				<HeaderDiv label={'Start Date/Time'} className='bg-green-100' />
			),
			cell: (info) => format(new Date(info.getValue()), dateTimeFormat),
		}),

		columnHelper.accessor('startLatitude', {
			header: () => (
				<HeaderDiv label={'Start Lat.'} className='bg-green-100' />
			),
			cell: (info) => info.getValue().toFixed(5),
		}),

		columnHelper.accessor('startLongitude', {
			header: () => (
				<HeaderDiv label={'Start Long.'} className='bg-green-100' />
			),
			cell: (info) => info.getValue().toFixed(5),
		}),

		columnHelper.accessor('endLocalDTM', {
			header: () => (
				<HeaderDiv label={'End Date/Time'} className='bg-red-100' />
			),
			cell: (info) => format(new Date(info.getValue()), dateTimeFormat),
		}),

		columnHelper.accessor('endLatitude', {
			header: () => (
				<HeaderDiv label={'End Lat.'} className='bg-red-100' />
			),
			cell: (info) => info.getValue().toFixed(5),
		}),

		columnHelper.accessor('endLongitude', {
			header: () => (
				<HeaderDiv label={'End Long.'} className='bg-red-100' />
			),
			cell: (info) => info.getValue().toFixed(5),
		}),

		columnHelper.accessor('distanceInKms', {
			header: 'Distance (kms)',
			cell: (info) => info.getValue(),
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
							customActions: [],
						});
					}}
				>
					<ArrowsPointingOutIcon className='h-4' />
				</button>
			),
		}),
	];

	const fetchUntrackedTrips = async (uid: number): Promise<void> => {
		setIsLoading(true);
		setIsError(false);

		if (uid > 0) {
			const response = await fetch(
				`${BaseUrl}/portal/report/untracked/trips?uid=${uid}&kms=2`,
				{
					method: 'GET',
					headers: await getApiHeaders(),
				}
			);
			if (!response.ok) {
				const res = await response.json();
				if (res.errorMessage == 'Unauthorised') fullSignOut();
				else setErrMessage(res.errorMessage);
				throw new Error('Network response was not ok');
			}
			const resPolicies =
				(await response.json()) as GetUntrackedTripsInKmsResponseProps;
			setReports(resPolicies.report || []);
		}

		setIsLoading(false);
	};

	useEffect(() => {
		const currentBU = getCurrentBusinessUnit(session, state);
		fetchUntrackedTrips(currentBU.id || 0);
	}, [session, state]);

	return (
		<>
			{isLoading && <LoadingSpinner />}
			{!isLoading && reports.length > 0 && (
				<>
					<ReportActionPanel policy={currentPolicy} />
					<ReportTable
						reportName='untracked-trips-in-kms'
						columns={columns}
						data={reports}
					/>
				</>
			)}
			{!isLoading && !isError && reports.length === 0 && (
				<p className='text-sm'>No reports found</p>
			)}
			{isError && <p className='text-sm'>{errMessage}</p>}
		</>
	);
};

const HeaderDiv = ({
	label,
	className,
}: {
	label: string;
	className: string;
}) => {
	return <div className={className}>{label}</div>;
};

export default ReportingUntrackedTripsInKms;

import { GetReportAllMembersLive, AllMemberReport } from '@/types/api';
import { BaseUrl, getApiHeaders, fullSignOut } from '@/app/utils';
import React, { useContext, useEffect, useState } from 'react';
import LoadingSpinner from '../LoadingSpinner';
import { BusinessUnitCtx } from '../providers/BusinessUnitProvider';
import { createColumnHelper } from '@tanstack/react-table';
import { ArrowsPointingOutIcon } from '@heroicons/react/24/outline';
import ReportActionPanel, {
	ActionPolicy,
} from '../actionButtons/ReportActionPanel';
import ReportTable from '../table/ReportingTable';
import { getCurrentBusinessUnit } from '@/app/utils/getCurrentBusinessUnit';
import { useSession } from 'next-auth/react';
import { BusinessUnitContextType } from '@/types/api/businessUnitProvider';

const ReportingCancelledMembers = (): JSX.Element => {
	const [reports, setReports] = useState<AllMemberReport[]>([]);
	const [currentPolicy, setCurrentPolicy] = useState<ActionPolicy | null>(
		null
	);
	const { data: session } = useSession();
	const { state }: BusinessUnitContextType = useContext(BusinessUnitCtx)!;
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [isError, setIsError] = useState<boolean>(false);

	const fetchCancelled = async (uid: number): Promise<void> => {
		setIsLoading(true);
		setIsError(false);

		if (uid > 0) {
			const response = await fetch(
				`${BaseUrl}/portal/report/allmember/cancelled?uid=${uid}`,
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
				(await response.json()) as GetReportAllMembersLive;
			setReports(resPolicies.report || []);
		}

		setIsLoading(false);
	};

	const columnHelper = createColumnHelper<AllMemberReport>();
	const columns = [
		columnHelper.accessor('policyNo', {
			header: 'Policy Number',
			cell: (info) => info.getValue(),
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
			header: 'VRM',
			cell: (info) => info.getValue(),
		}),
		columnHelper.accessor('latestScore', {
			header: 'Latest Score',
			cell: (info) => {
				const score = info.getValue()?.toFixed(2) || '**';
				return score;
			},
		}),
		columnHelper.display({
			id: 'action',
			header: 'Action',
			cell: (props) => (
				<button
					onClick={() =>
						setCurrentPolicy({
							policyNumber: props.row.original.policyNo,
							opid: props.row.original.opid,
							customActions: [],
						})
					}
				>
					<ArrowsPointingOutIcon className='h-4' />
				</button>
			),
		}),
	];

	useEffect(() => {
		const currentBU = getCurrentBusinessUnit(session, state);
		fetchCancelled(currentBU.id || 0);
	}, [session, state]);

	return (
		<>
			{isLoading && <LoadingSpinner />}
			{!isLoading && reports.length > 0 && (
				<div className='flex flex-col w-full'>
					<ReportActionPanel policy={currentPolicy} />
					<div className='flex flex-col w-full text-xs'>
						** = No immediate score found; please visit
						policy/scores page for historic details
					</div>
					<br />
					<ReportTable
						reportName='all-members-cancelled'
						columns={columns}
						data={reports}
						sortObj={{ id: 'policyNo', desc: false }}
					/>
				</div>
			)}
			{!isLoading && !isError && reports.length === 0 && (
				<p className='text-sm'>No reports found</p>
			)}
			{isError && <p className='text-sm'>An error occurred</p>}
		</>
	);
};

export default ReportingCancelledMembers;

import { GetReportAllMembersLive, AllMemberReport } from '@/types/api';
import { BaseUrl, getApiHeaders, fullSignOut } from '@/app/utils';
import React, { useContext, useEffect, useState } from 'react';
import LoadingSpinner from '../LoadingSpinner';
import { BusinessUnitCtx } from '../providers/BusinessUnitProvider';
import { FilterFn, createColumnHelper } from '@tanstack/react-table';
import ReportTable from '../table/ReportingTable';
import ReportActionPanel, {
	ActionPolicy,
} from '../actionButtons/ReportActionPanel';
import { ArrowsPointingOutIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { getCurrentBusinessUnit } from '@/app/utils/getCurrentBusinessUnit';
import { useSession } from 'next-auth/react';
import { BusinessUnitContextType } from '@/types/api/businessUnitProvider';

declare module '@tanstack/table-core' {
	interface FilterFns {
		fuzzy: FilterFn<unknown>;
	}
}

const ReportingAllMembers = (): JSX.Element => {
	const { data: session } = useSession();
	const { state }: BusinessUnitContextType = useContext(BusinessUnitCtx)!;
	const [reports, setReports] = useState<AllMemberReport[]>([]);
	const [currentPolicy, setCurrentPolicy] = useState<ActionPolicy | null>(
		null
	);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [isError, setIsError] = useState<boolean>(false);

	const fetchAllMembers = async (uid: number): Promise<void> => {
		setIsLoading(true);
		setIsError(false);

		if (uid > 0) {
			const response = await fetch(
				`${BaseUrl}/portal/report/allmember/live?uid=${uid}`,
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

	const dtMask: string = 'dd/MM/yyyy';

	const columnHelper = createColumnHelper<AllMemberReport>();
	const columns = [
		columnHelper.accessor('policyNo', {
			header: 'Policy No.',
			cell: (info) => info.getValue(),
			filterFn: 'fuzzy',
		}),
		columnHelper.accessor('forename', {
			header: 'Forename',
			filterFn: 'fuzzy',
			cell: (info) => info.getValue(),
		}),
		columnHelper.accessor('surname', {
			header: 'Surname',
			cell: (info) => info.getValue(),
			filterFn: 'fuzzy',
		}),
		columnHelper.accessor('vrm', {
			header: 'VRN',
			cell: (info) => info.getValue(),
			filterFn: 'fuzzy',
		}),
		columnHelper.accessor('inceptionDTM', {
			header: 'Inception Date',
			cell: (info) => {
				const val: string =
					format(new Date(info.getValue()), dtMask) || '';
				return val;
			},
			filterFn: 'fuzzy',
		}),
		columnHelper.accessor('policyRecieved', {
			header: 'Policy Rec`d Date',
			cell: (info) => {
				const val: string | null = info.getValue();
				return val ? format(new Date(val), dtMask) : '';
			},
			filterFn: 'fuzzy',
		}),
		columnHelper.accessor('recycledDevice', {
			header: 'Recycled Device',
			cell: (info) => {
				const value: boolean = info.getValue();
				return value === true ? 'Yes' : 'No';
			},
			filterFn: 'fuzzy',
		}),
		columnHelper.accessor('activatedDTM', {
			header: 'App Activated',
			cell: (info) => {
				const value: Date | undefined = info.getValue();
				return value ? format(new Date(value), dtMask) : '';
			},
			filterFn: 'fuzzy',
		}),
		columnHelper.accessor('lastAccessedDTM', {
			header: 'App Last Accessed',
			cell: (info) => {
				const value: Date | undefined = info.getValue();
				return value ? format(new Date(value), dtMask) : '';
			},
			filterFn: 'fuzzy',
		}),
		columnHelper.accessor('urban', {
			header: 'Urban',
			cell: (info) => {
				const val: string = info.getValue()?.toFixed(4) || '';
				return val;
			},
			filterFn: 'fuzzy',
		}),
		columnHelper.accessor('acceleration', {
			header: 'Acceleration',
			cell: (info) => {
				const val: string = info.getValue()?.toFixed(4) || '';
				return val;
			},
			filterFn: 'fuzzy',
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
		fetchAllMembers(currentBU.id || 0);
	}, [session, state]);

	return (
		<>
			{isLoading && <LoadingSpinner />}
			{!isLoading && reports.length > 0 && (
				<>
					<ReportActionPanel policy={currentPolicy} />
					<ReportTable
						reportName='all-members'
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

export default ReportingAllMembers;

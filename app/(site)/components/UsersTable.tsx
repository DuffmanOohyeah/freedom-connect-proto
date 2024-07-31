import { AdminUser } from '@/types/api';
import { BaseUrl, getApiHeaders, fullSignOut } from '@/app/utils';
import React, { useState, useEffect, useContext } from 'react';
import BusinessUnitSelector from '../reporting/BusinessUnitSelector';
import AgentActionsBtn from './actionButtons/AgentResendActivationEmail';
import { format } from 'date-fns';
import ReportTable from '@/app/(site)/components/table/ReportingTable';
import { createColumnHelper } from '@tanstack/react-table';
import { getCurrentBusinessUnit } from '@/app/utils/getCurrentBusinessUnit';
import { BusinessUnitContextType } from '@/types/api/businessUnitProvider';
import { BusinessUnitCtx } from './providers/BusinessUnitProvider';
import { useSession } from 'next-auth/react';

const UsersTable = (): JSX.Element => {
	const [users, setUsers] = useState<AdminUser[]>([]);
	const [error, setError] = useState<string>('');
	const [loading, setLoading] = useState<boolean>(true);
	const { data: session } = useSession();
	const { state }: BusinessUnitContextType = useContext(BusinessUnitCtx)!;
	const dtMask: string = 'yyyy-MM-dd HH:mm';

	const fetchUsers = async (uid: number): Promise<void> => {
		setLoading(true);
		setUsers([]);
		if (uid > 0) {
			const response: Response = await fetch(
				`${BaseUrl}/portal/user/admin?unid=${uid}`,
				{ headers: await getApiHeaders(), method: 'GET' }
			);
			const data = await response.json();
			if (response.ok) setUsers(data || []);
			else {
				setError(data.errorMessage);
				if (data.errorMessage === 'Unauthorised') fullSignOut();
				throw new Error('Network response was not ok');
			}
		}
		setLoading(false);
	};

	useEffect(() => {
		const currentBU = getCurrentBusinessUnit(session, state);
		fetchUsers(currentBU.id || 0);
	}, [session, state]);

	const columnHelper = createColumnHelper<AdminUser>();
	const columns: any[] = [
		columnHelper.accessor('name', {
			header: 'Full Name',
			cell: (info) => info.getValue(),
		}),
		columnHelper.accessor('userName', {
			header: 'User Name',
			cell: (info) => info.getValue(),
		}),
		columnHelper.accessor('email', {
			header: 'Email',
			cell: (info) => info.getValue(),
		}),
		columnHelper.accessor('activatedDTM', {
			header: 'Activated DTM',
			cell: (info) => {
				const value: string | null = info.getValue();
				const dtActive: string = value
					? format(new Date(value), dtMask)
					: '';
				return dtActive;
			},
		}),
		columnHelper.accessor('archivedDTM', {
			header: 'Archived DTM',
			cell: (info) => {
				const value: Date | undefined = info.getValue();
				const dtActive: string = value
					? format(new Date(value), dtMask)
					: '';
				return dtActive;
			},
		}),
		columnHelper.accessor('unitName', {
			header: 'Unit Name',
			cell: (info) => info.getValue(),
		}),
		columnHelper.display({
			id: 'action',
			header: 'Action',
			cell: (props) => <AgentActionsBtn adminUser={props.row.original} />,
		}),
	];

	return (
		<div className='flex flex-col bg-white rounded-2xl shadow-tile-shadow px-8 py-6 mt-10 @container/users'>
			<div className='flex flex-row justify-between mb-8'>
				<h1 className='text-lg font-semibold flex items-center whitespace-pre'>
					Users
					{users.length > 0 && (
						<span className='text-sm'>
							&nbsp;&nbsp;&nbsp;(Records found: {users.length})
						</span>
					)}
				</h1>
				<BusinessUnitSelector />
			</div>
			{!error &&
				!loading &&
				(users.length > 0 ? (
					<div className='max-h-96'>
						<ReportTable
							reportName='user-management'
							columns={columns}
							data={users}
							sortObj={{ id: 'name', desc: false }}
						/>
					</div>
				) : (
					<p className='text-sm'>No users found.</p>
				))}
			{loading && <p className='text-sm'>Loading user list...</p>}
			{error && <p className='text-sm'>An error occurred: {error}</p>}
		</div>
	);
};

export default UsersTable;

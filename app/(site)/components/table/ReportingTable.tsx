import React, { useState } from 'react';
import {
	FilterFn,
	SortingState,
	flexRender,
	getCoreRowModel,
	getSortedRowModel,
	useReactTable,
} from '@tanstack/react-table';
import { CSVLink } from 'react-csv';
import { BiExport } from 'react-icons/bi';
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';
import { rankItem } from '@tanstack/match-sorter-utils';
import { ReportTableProps } from '@/types/api/reportDetails';
import { cleanseReportForCsv } from '../reporting/ReportingDeviceMultipleUnplugged';

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
	// Rank the item
	const itemRank = rankItem(row.getValue(columnId), value);
	// Store the itemRank info
	addMeta({
		itemRank,
	});
	// Return if the item should be filtered in/out
	return itemRank.passed;
};

/*const DebouncedInput = ({
	value: initialValue,
	onChange,
	debounce = 500,
	...props
}: {
	value: string | number;
	onChange: (value: string | number) => void;
	debounce?: number;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'>) => {
	const [value, setValue] = React.useState(initialValue);

	React.useEffect(() => {
		setValue(initialValue);
	}, [initialValue]);

	React.useEffect(() => {
		const timeout = setTimeout(() => {
			onChange(value);
		}, debounce);

		return () => clearTimeout(timeout);
	}, [value]);

	return (
		<input
			{...props}
			value={value}
			onChange={(e) => setValue(e.target.value)}
		/>
	);
};*/

const ReportTable = ({
	reportName,
	columns,
	data,
	sortObj,
}: ReportTableProps): JSX.Element => {
	const [sorting, setSorting] = useState<SortingState>(
		sortObj ? [sortObj] : []
	);
	const [globalFilter, setGlobalFilter] = useState('');
	// Use the useTable Hook to send the columns and data to build the table
	/*const [filterColumn, setFilterColumn] = useState<ColumnDef<any> | null>(
		null
	);*/

	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		filterFns: {
			fuzzy: fuzzyFilter,
		},
		state: {
			sorting,
			globalFilter,
		},
		onSortingChange: setSorting,
		getSortedRowModel: getSortedRowModel(),
		onGlobalFilterChange: setGlobalFilter,
		debugTable: true,
	});

	return (
		<div className='w-full flex flex-col gap-4'>
			<div className='w-full flex flex-row justify-between items-center gap-4'>
				{/* <div className="flex flex-row items-center gap-2 w-full">
					<DebouncedInput
					value={globalFilter ?? ''}
					onChange={value => setGlobalFilter(String(value))}
					className="p-2 font-lg shadow border border-block"
					placeholder="Search..."
					/>
				</div> */}
				<div className='flex flex-row gap-2 items-center'>
					<span className='text-xs text-gray-500'>
						Records found: {data.length}
					</span>
					<CSVLink
						className='action-btn w-24 flex flex-row justify-between items-center'
						data={cleanseReportForCsv(data)}
						filename={`${reportName}-${new Date().toISOString()}.csv`}
					>
						<BiExport />
						Export
					</CSVLink>
				</div>
			</div>

			<div className='overflow-y-auto max-h-96'>
				<table className='w-full table-auto text-xs text-shark zebraTable'>
					<thead className='bg-slate-200'>
						{table.getHeaderGroups().map((headerGroup) => (
							<tr key={headerGroup.id}>
								{headerGroup.headers.map((header) => {
									return (
										<th
											key={header.id}
											colSpan={header.colSpan}
											className='text-left'
										>
											{!header.isPlaceholder && (
												<div
													{...{
														className: `flex flex-row items-center gap-2 pr-2 font-semibold ${
															header.column.getCanSort() &&
															'cursor-pointer select-none'
														}`,
														onClick:
															header.column.getToggleSortingHandler(),
													}}
												>
													{flexRender(
														header.column.columnDef
															.header,
														header.getContext()
													)}
													{{
														asc: (
															<IoIosArrowUp className='h-5' />
														),
														desc: (
															<IoIosArrowDown className='h-5' />
														),
													}[
														header.column.getIsSorted() as string
													] ?? null}
												</div>
											)}
										</th>
									);
								})}
							</tr>
						))}
					</thead>
					<tbody>
						{table.getRowModel().rows.map((row, idx1) => (
							<tr key={idx1}>
								{row.getVisibleCells().map((cell, idx2) => (
									<td key={idx2} className='py-4 align-top'>
										{flexRender(
											cell.column.columnDef.cell,
											cell.getContext()
										)}
									</td>
								))}
							</tr>
						))}
					</tbody>
					<tfoot>
						{table.getFooterGroups().map((footerGroup) => (
							<tr key={footerGroup.id}>
								{footerGroup.headers.map((header, index) => (
									<th key={index}>
										{!header.isPlaceholder &&
											flexRender(
												header.column.columnDef.footer,
												header.getContext()
											)}
									</th>
								))}
							</tr>
						))}
					</tfoot>
				</table>
			</div>
		</div>
	);
};

export default ReportTable;

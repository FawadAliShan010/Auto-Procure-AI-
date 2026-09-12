import React, { useState } from 'react';
import { useProcure } from '../context/ProcurementContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { Button } from '../components/common/Button';
import {
  Search,
  Filter,
  Download,
  Plus,
  ArrowUpDown,
  ExternalLink,
  SlidersHorizontal,
} from 'lucide-react';

export const RequestsView: React.FC = () => {
  const { requests, navigateTo, setSelectedRequestForModal, addToast } = useProcure();

  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');

  const filteredRequests = requests.filter((r) => {
    const matchesSearch =
      r.itemDescription.toLowerCase().includes(search.toLowerCase()) ||
      r.id.toLowerCase().includes(search.toLowerCase()) ||
      r.employeeName.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      selectedStatus === 'ALL' || r.status === selectedStatus;

    const matchesDept = selectedDept === 'ALL' || r.department === selectedDept;

    return matchesSearch && matchesStatus && matchesDept;
  });

  const handleExportCSV = () => {
    const headers = ['ID', 'Item', 'Department', 'Requisitioner', 'Qty', 'Unit Price', 'Total', 'Status', 'Date'];
    const rows = filteredRequests.map((r) => [
      r.id,
      `"${r.itemDescription}"`,
      r.department,
      `"${r.employeeName}"`,
      r.quantity,
      r.estimatedPrice,
      r.quantity * r.estimatedPrice,
      r.status,
      r.createdAt,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AutoProcure_PR_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast('CSV Exported', `Exported ${filteredRequests.length} requisition records.`, 'success');
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Purchase Requisitions Ledger</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit trail of enterprise requisitions intercepted, standardized, and checked across control gates.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="w-3.5 h-3.5" />}
            onClick={handleExportCSV}
          >
            Export CSV
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => navigateTo('/submit')}
          >
            Submit Request
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Filter by item, SKU, requisition ID, or employee name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:border-indigo-600 cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="APPROVED">APPROVED</option>
            <option value="REDUCE">REDUCE</option>
            <option value="ON_HOLD">ON HOLD</option>
            <option value="INVESTIGATE">INVESTIGATE</option>
            <option value="REJECTED">REJECTED</option>
          </select>

          {/* Department Filter */}
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:border-indigo-600 cursor-pointer"
          >
            <option value="ALL">All Departments</option>
            <option value="IT / Technology">IT / Technology</option>
            <option value="Maintenance">Maintenance</option>
            <option value="HR">HR</option>
            <option value="Operations">Operations</option>
            <option value="Facilities & Safety">Facilities & Safety</option>
          </select>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-2.5 px-4">Requisition ID</th>
                <th className="py-2.5 px-4">Item & Taxonomy</th>
                <th className="py-2.5 px-4">Cost Center</th>
                <th className="py-2.5 px-4">Requested By</th>
                <th className="py-2.5 px-4 text-right">Commitment</th>
                <th className="py-2.5 px-4">Gate Status</th>
                <th className="py-2.5 px-4">Audit Date</th>
                <th className="py-2.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-xs text-slate-400">
                    No purchase requisitions match the selected search criteria.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => setSelectedRequestForModal(r)}
                    className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-4 font-mono text-xs font-bold text-slate-600">
                      {r.id}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors text-xs">
                        {r.gate1?.standardized || r.itemDescription}
                      </div>
                      {r.gate1?.matchedItemCode && (
                        <div className="text-[10px] font-mono text-slate-400">
                          SKU #{r.gate1.matchedItemCode}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">
                      {r.department}
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {r.employeeName}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="text-xs font-bold font-mono text-slate-900">
                        ${(r.quantity * r.estimatedPrice).toLocaleString()}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {r.quantity} @ ${r.estimatedPrice}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={r.status} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono">
                      {r.createdAt}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRequestForModal(r);
                        }}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
